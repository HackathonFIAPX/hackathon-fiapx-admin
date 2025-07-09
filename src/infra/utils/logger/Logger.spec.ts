import { Logger } from './Logger'
import winston from 'winston'

// Mock the entire winston module
jest.mock('winston', () => {
    // Create a mock logger instance that will be returned by createLogger
    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    };

    const mockCombine = jest.fn(() => jest.fn()); // combine returns a function

    return {
        // Mock createLogger to return our mockLogger
        createLogger: jest.fn(() => mockLogger),
        transports: {
            Console: jest.fn(),
        },
        format: {
            combine: mockCombine,
            timestamp: jest.fn(),
            json: jest.fn(),
        },
    };
});

describe('Logger', () => {
    // Get a reference to the mocked logger instance after the module is loaded
    const mockLoggerInstance = (winston.createLogger as jest.Mock).mock.results[0].value;

    beforeAll(() => {
        // Ensure createLogger is called once when the module is loaded
        expect(winston.createLogger).toHaveBeenCalledTimes(1);
        expect(winston.createLogger).toHaveBeenCalledWith({
            transports: [expect.any(winston.transports.Console)],
            format: expect.any(Function), // winston.format.combine returns a function
        });
        expect(winston.transports.Console).toHaveBeenCalledTimes(1);
        expect(winston.format.combine).toHaveBeenCalledTimes(1);
        expect(winston.format.timestamp).toHaveBeenCalledTimes(1);
        expect(winston.format.json).toHaveBeenCalledTimes(1);
    });

    beforeEach(() => {
        jest.clearAllMocks(); // This will clear all mocks, including createLogger
        // So, we need to re-mock createLogger if we want to test it again,
        // or just test it once at the beginning.
        // For this scenario, testing it once at module load is sufficient.

        // Clear mocks on the logger instance methods
        mockLoggerInstance.info.mockClear();
        mockLoggerInstance.error.mockClear();
        mockLoggerInstance.warn.mockClear();
    });

    it('info should call winston logger info method', () => {
        const message = 'Test info message';
        const additionalInfo = { key: 'value' };
        Logger.info({ message, additionalInfo });
        expect(mockLoggerInstance.info).toHaveBeenCalledTimes(1);
        expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, { additionalInfo });
    });

    it('error should call winston logger error method', () => {
        const message = 'Test error message';
        const additionalInfo = { error: 'details' };
        Logger.error({ message, additionalInfo });
        expect(mockLoggerInstance.error).toHaveBeenCalledTimes(1);
        expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, { additionalInfo });
    });

    it('warn should call winston logger warn method', () => {
        const message = 'Test warn message';
        const additionalInfo = { warning: 'details' };
        Logger.warn({ message, additionalInfo });
        expect(mockLoggerInstance.warn).toHaveBeenCalledTimes(1);
        expect(mockLoggerInstance.warn).toHaveBeenCalledWith(message, { additionalInfo });
    });

    it('should handle additionalInfo being undefined', () => {
        const message = 'Message without additional info';
        Logger.info({ message });
        expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, { additionalInfo: undefined });
    });
});