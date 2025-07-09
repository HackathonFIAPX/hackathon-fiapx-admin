import { Router } from 'express'
import usersRoutes from './users.route'
import { container } from 'tsyringe'
import { RouterAdapter } from '../adapters/RouterAdapter'
import { IController } from '../protocols/controller'

// Mock express.Router
const mockPost = jest.fn();
const mockRouter = {
    post: mockPost,
} as unknown as Router;

// Mock tsyringe container
jest.mock('tsyringe', () => {
    const mockUserLoginController = {} as IController;
    const mockUserSignUpController = {} as IController;
    const mockValidateTokenController = {} as IController;
    return {
        container: {
            resolve: jest.fn((token: string) => {
                if (token === 'UserLoginController') return mockUserLoginController;
                if (token === 'UserSignUpController') return mockUserSignUpController;
                if (token === 'ValidateTokenController') return mockValidateTokenController;
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
        expect(container.resolve).toHaveBeenCalledWith('UserLoginController');
        expect(container.resolve).toHaveBeenCalledWith('UserSignUpController');
        expect(container.resolve).toHaveBeenCalledWith('ValidateTokenController');
    });

    beforeEach(() => {
        mockPost.mockClear();
        (RouterAdapter.adapt as jest.Mock).mockClear();
    });

    it('should configure user routes correctly', () => {
        usersRoutes(mockRouter);

        // Verify RouterAdapter.adapt calls
        expect(RouterAdapter.adapt).toHaveBeenCalledTimes(3);
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object)); // Use expect.any(Object)
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));

        // Verify route.post calls
        expect(mockPost).toHaveBeenCalledTimes(3);
        expect(mockPost).toHaveBeenCalledWith('/v1/users/login', 'adapted-Object');
        expect(mockPost).toHaveBeenCalledWith('/v1/users/signup', 'adapted-Object');
        expect(mockPost).toHaveBeenCalledWith('/v1/users/validate-token', 'adapted-Object');
    });
});