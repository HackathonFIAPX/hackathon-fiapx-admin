import { Router } from 'express'
import uploadRoutes from './upload.routes'
import { container } from 'tsyringe'
import { RouterAdapter } from '../adapters/RouterAdapter'
import { IController } from '../protocols/controller'
import { AuthMiddleware } from '../middlewares/auth.middleware'

// Mock express.Router
const mockGet = jest.fn();
const mockRouter = {
    get: mockGet,
} as unknown as Router;

// Mock tsyringe container
jest.mock('tsyringe', () => {
    const mockGetPresignedUrlController = {} as IController;
    return {
        container: {
            resolve: jest.fn((token: string) => {
                if (token === 'GetPresignedUrlController') return mockGetPresignedUrlController;
                return {};
            }),
        },
    };
});

// Mock RouterAdapter
jest.mock('../adapters/RouterAdapter', () => {
    const mockAdapt = jest.fn((controller: IController) => `adapted-${controller.constructor.name}`);
    return {
        RouterAdapter: {
            adapt: mockAdapt,
        },
    };
});

describe('upload.routes', () => {
    // Assert container.resolve calls once, as they happen on module load
    beforeAll(() => {
        expect(container.resolve).toHaveBeenCalledWith('GetPresignedUrlController');
    });

    beforeEach(() => {
        mockGet.mockClear();
        (RouterAdapter.adapt as jest.Mock).mockClear();
    });

    it('should configure upload routes correctly', () => {
        uploadRoutes(mockRouter);

        // Verify RouterAdapter.adapt calls
        expect(RouterAdapter.adapt).toHaveBeenCalledTimes(1);
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object)); // Use expect.any(Object)

        // Verify route.get calls
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith('/v1/uploads/presigned-url', AuthMiddleware.handle, 'adapted-Object');
    });
});