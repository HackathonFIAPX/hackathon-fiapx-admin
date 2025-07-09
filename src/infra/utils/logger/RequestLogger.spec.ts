import { RequestLogger } from './RequestLogger'
import morgan from 'morgan'
import { Logger } from './Logger' // This will be the mocked Logger

// Explicitly type morgan as JestMockedFunction
const mockedMorgan = morgan as jest.MockedFunction<typeof morgan>;

// Mock morgan
jest.mock('morgan', () => jest.fn(() => jest.fn())); // morgan returns a function, so its mock should return a function

// Mock Logger
jest.mock('./Logger', () => ({
    Logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('RequestLogger', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {};
        mockResponse = {};
        mockNext = jest.fn();
    });

    it('should return a morgan middleware function', () => {
        const middleware = RequestLogger.log();
        expect(mockedMorgan).toHaveBeenCalledTimes(1); // Use mockedMorgan here
        expect(typeof middleware).toBe('function');
    });

    it('should log request details using Logger.info', () => {
        const middleware = RequestLogger.log();

        // Simulate morgan's tokens function
        const mockTokens = {
            method: jest.fn(() => 'GET'),
            url: jest.fn(() => '/test'),
            status: jest.fn(() => '200'),
            'response-time': jest.fn(() => '100'),
        };

        // Get the callback function passed to morgan
        const morganCallback = mockedMorgan.mock.calls[0][0]; // Use mockedMorgan here

        // Call the callback with mock tokens, req, res
        const result = morganCallback(mockTokens, mockRequest, mockResponse);

        expect(mockTokens.method).toHaveBeenCalledWith(mockRequest, mockResponse);
        expect(mockTokens.url).toHaveBeenCalledWith(mockRequest, mockResponse);
        expect(mockTokens.status).toHaveBeenCalledWith(mockRequest, mockResponse);
        expect(mockTokens['response-time']).toHaveBeenCalledWith(mockRequest, mockResponse);

        expect(Logger.info).toHaveBeenCalledTimes(1);
        expect(Logger.info).toHaveBeenCalledWith({
            message: 'GET /test 200 - 100 ms',
        });
        expect(result).toBeNull(); // morgan callback should return null
    });
});
