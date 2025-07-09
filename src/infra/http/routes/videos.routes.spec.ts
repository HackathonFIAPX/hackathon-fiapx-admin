import { Router } from 'express'
import videosRoutes from './videos.routes'
import { container } from 'tsyringe'
import { RouterAdapter } from '../adapters/RouterAdapter'
import { IController } from '../protocols/controller'
import { AuthMiddleware } from '../middlewares/auth.middleware'

// Mock express.Router
const mockPost = jest.fn();
const mockRouter = {
    post: mockPost,
} as unknown as Router;

// Mock tsyringe container
jest.mock('tsyringe', () => {
    const mockGetAllVideosByUserController = {} as IController;
    return {
        container: {
            resolve: jest.fn((token: string) => {
                if (token === 'GetAllVideosByUserController') return mockGetAllVideosByUserController;
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
    });

    beforeEach(() => {
        mockPost.mockClear();
        (RouterAdapter.adapt as jest.Mock).mockClear();
    });

    it('should configure user routes correctly', () => {
        videosRoutes(mockRouter);

        // Verify RouterAdapter.adapt calls
        expect(RouterAdapter.adapt).toHaveBeenCalledTimes(1);
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));

        // Verify route.post calls
        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockPost).toHaveBeenCalledWith('/v1/videos', AuthMiddleware.handle, 'adapted-Object');
    });
});