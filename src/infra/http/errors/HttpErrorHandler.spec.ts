import { HttpErrorHandler } from './HttpErrorHandler'
import { EHttpStatusCode } from '../protocols/EHttpStatusCode'
import { Request, Response, NextFunction } from 'express'
import { Logger } from '@infra/utils/logger/Logger'

// Mock Logger
jest.mock('@infra/utils/logger/Logger', () => ({
    Logger: {
        error: jest.fn(),
    },
}))

// Mock HttpError
jest.mock('./http-errors/HttpError', () => ({
    HttpError: jest.fn().mockImplementation(function(this: any, message: string, statusCode: EHttpStatusCode, additionalInfo?: any) {
        this.message = message;
        this.getStatusCode = jest.fn(() => statusCode);
        this.additionalInfo = additionalInfo;
    }),
}));

// Mock ErrorCustom
jest.mock('@infra/utils/ErrorCustom/ErrorCustom', () => ({
    ErrorCustom: jest.fn().mockImplementation(function(this: any, { error }: { error?: any }) {
        this.message = error?.message || 'Mock Error Custom';
        this.getFileName = jest.fn(() => 'mockFile');
        this.getFunctionName = jest.fn(() => 'mockFunction');
    }),
}));

// Re-import the mocked classes after jest.mock and cast to any
import { HttpError as MockedHttpError } from './http-errors/HttpError'
import { ErrorCustom as MockedErrorCustom } from '@infra/utils/ErrorCustom/ErrorCustom'

const HttpError = MockedHttpError as any;
const ErrorCustom = MockedErrorCustom as any;

describe('HttpErrorHandler', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        mockRequest = {}
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }
        mockNext = jest.fn()
        jest.clearAllMocks()
    })

    describe('handle', () => {
        it('should handle HttpError correctly', () => {
            const errorMessage = 'Test Http Error'
            const errorStatusCode = EHttpStatusCode.BAD_REQUEST
            const errorAdditionalInfo = { detail: 'Some detail' }

            const httpError = new HttpError(errorMessage, errorStatusCode, errorAdditionalInfo)

            HttpErrorHandler.handle(httpError, mockRequest as Request, mockResponse as Response, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(errorStatusCode)
            expect(mockResponse.send).toHaveBeenCalledWith(errorMessage)
            expect(Logger.error).toHaveBeenCalledWith({
                message: errorMessage,
                additionalInfo: {
                    statusCode: errorStatusCode,
                    fileName: 'mockFile',
                    functionName: 'mockFunction',
                    additionalInfo: errorAdditionalInfo,
                },
            })
            expect(mockNext).toHaveBeenCalledTimes(1)
        })

        it('should handle generic Error correctly', () => {
            const genericError = new Error('Something went wrong')

            HttpErrorHandler.handle(genericError, mockRequest as Request, mockResponse as Response, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(EHttpStatusCode.INTERNAL_SERVER_ERROR)
            expect(mockResponse.send).toHaveBeenCalledWith('Internal Server Error')
            expect(Logger.error).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                additionalInfo: {
                    statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
                    fileName: 'mockFile',
                    functionName: 'mockFunction',
                    additionalInfo: null,
                },
            })
            expect(mockNext).toHaveBeenCalledTimes(1)
        })

        it('should handle ErrorCustom (not HttpError) correctly', () => {
            const customError = new ErrorCustom({ error: new Error('Custom error message') })

            HttpErrorHandler.handle(customError, mockRequest as Request, mockResponse as Response, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(EHttpStatusCode.INTERNAL_SERVER_ERROR)
            expect(mockResponse.send).toHaveBeenCalledWith('Internal Server Error')
            expect(Logger.error).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                additionalInfo: {
                    statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
                    fileName: 'mockFile',
                    functionName: 'mockFunction',
                    additionalInfo: null,
                },
            })
            expect(mockNext).toHaveBeenCalledTimes(1)
        })

        it('should log to console', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
            const genericError = new Error('Something went wrong')

            HttpErrorHandler.handle(genericError, mockRequest as Request, mockResponse as Response, mockNext)

            expect(consoleSpy).toHaveBeenCalledWith('HttpErrorHandler.handle', genericError)
            consoleSpy.mockRestore()
        })
    })
})
