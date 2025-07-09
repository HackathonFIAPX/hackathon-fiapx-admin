import { Router } from 'express'
import healthRoutes from './health.routes' // Import the default export
import { container } from 'tsyringe'
import { RouterAdapter } from '../adapters/RouterAdapter'
import { IController } from '../protocols/controller'

// Mock express.Router
const mockGet = jest.fn();
const mockRouter = {
    get: mockGet,
} as unknown as Router; // Cast to Router type

// Mock tsyringe container
jest.mock('tsyringe', () => {
    const mockLivenessController = {} as IController;
    const mockReadinessController = {} as IController;
    return {
        container: {
            resolve: jest.fn((token: string) => {
                if (token === 'LivenessController') return mockLivenessController;
                if (token === 'ReadinessController') return mockReadinessController;
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

describe('health.routes', () => {
    // Assert container.resolve calls once, as they happen on module load
    beforeAll(() => {
        // The healthRoutes module is imported, which triggers container.resolve
        // So, we can assert these calls here.
        expect(container.resolve).toHaveBeenCalledWith('LivenessController');
        expect(container.resolve).toHaveBeenCalledWith('ReadinessController');
    });

    beforeEach(() => {
        // Clear mocks for RouterAdapter and mockRouter, but not for container.resolve
        // as its calls are already asserted in beforeAll.
        mockGet.mockClear();
        (RouterAdapter.adapt as jest.Mock).mockClear();
    });

    it('should configure health routes correctly', () => {
        healthRoutes(mockRouter);

        // Verify RouterAdapter.adapt calls
        expect(RouterAdapter.adapt).toHaveBeenCalledTimes(2);
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object)); // Use expect.any(Object) as controllers are defined inside mock
        expect(RouterAdapter.adapt).toHaveBeenCalledWith(expect.any(Object));

        // Verify route.get calls
        expect(mockGet).toHaveBeenCalledTimes(2);
        expect(mockGet).toHaveBeenCalledWith('/health/liveness', 'adapted-Object'); // adapted-Object because mock controllers are empty objects
        expect(mockGet).toHaveBeenCalledWith('/health/readiness', 'adapted-Object');
    });
});