import { Router } from 'express'
import videosRoutes from './videos.routes'
import { container } from 'tsyringe'
import { RouterAdapter } from '../adapters/RouterAdapter'
import { IController } from '../protocols/controller'
import { AuthMiddleware } from '../middlewares/auth.middleware'

// Mock express.Router
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockRouter = {
    get: mockGet,
    put: mockPut,
} as unknown as Router;

// Mock tsyringe container
jest.mock('tsyringe', () => {
    const mockGetAllVideosByUserController = {} as IController;
    const mockUpdateVideoControllerController = {} as IController;
    return {
        container: {
            resolve: jest.fn((token: string) => {
                if (token === 'GetAllVideosByUserController') return mockGetAllVideosByUserController;
                if (token === 'UpdateVideoController') return mockUpdateVideoControllerController;
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

describe('users.route', () => {
    // Assert container.resolve calls once, as they happen on module load
    beforeAll(() => {
        expect(container.resolve).toHaveBeenCalledWith('GetAllVideosByUserController');
        expect(container.resolve).toHaveBeenCalledWith('UpdateVideoController');
    });

    beforeEach(() => {
        mockGet.mockClear();
        (RouterAdapter.adapt as jest.Mock).mockClear();
    });

    it('should configure user routes correctly', () => {
        videosRoutes(mockRouter);

        // Verify RouterAdapter.adapt calls
        expect(RouterAdapter.adapt).toHaveBeenCalledTimes(2);
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));

        // Verify route.post calls
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith('/v1/videos', AuthMiddleware.handle, 'adapted-Object');

        // Verify route.put calls
        expect(mockPut).toHaveBeenCalledTimes(1);
        expect(mockPut).toHaveBeenCalledWith('/v1/private/videos', 'adapted-Object');
    });
});