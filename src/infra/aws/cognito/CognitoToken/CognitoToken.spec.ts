import { CognitoToken } from './CognitoToken';
import { JwksClient } from 'jwks-rsa';
import * as jsonwebtoken from 'jsonwebtoken';
import { Logger } from '@infra/utils/logger/Logger';
import { envCognito } from '@config/variables/cognito';

// Mock external modules
jest.mock('jwks-rsa', () => {
    const mockGetSigningKey = jest.fn();
    return {
        JwksClient: jest.fn(() => ({
            getSigningKey: mockGetSigningKey,
        })),
        __esModule: true, // Important for named exports
        mockGetSigningKey: mockGetSigningKey, // Export the mock function
    };
});

const { mockGetSigningKey } = require('jwks-rsa');

jest.mock('jsonwebtoken', () => ({
    decode: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('@infra/utils/logger/Logger', () => ({
    Logger: {
        error: jest.fn(),
    },
}));

jest.mock('@config/variables/cognito', () => ({
    envCognito: {
        region: 'mock-region',
        userPoolId: 'mock-user-pool-id',
        clientId: 'mock-client-id',
    },
}));

describe('CognitoToken', () => {
    let cognitoToken: CognitoToken;
    let mockDecode: jest.Mock;
    let mockVerify: jest.Mock;
    let mockLoggerError: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        cognitoToken = new CognitoToken();
        mockDecode = jsonwebtoken.decode as jest.Mock;
        mockVerify = jsonwebtoken.verify as jest.Mock;
        mockLoggerError = Logger.error as jest.Mock;
    });

    describe('validateToken', () => {
        const mockToken = 'mock.jwt.token';
        const mockKid = 'mock-kid';
        const mockPublicKey = 'mock-public-key';
        const mockPayload = {
            sub: '123',
            iss: `https://cognito-idp.${envCognito.region}.amazonaws.com/${envCognito.userPoolId}`,
            aud: envCognito.clientId,
            token_use: 'id',
            exp: Math.floor(Date.now() / 1000) + 3600,
        };

        it('should return isValid: false for an invalid token (decode returns null)', async () => {
            mockDecode.mockReturnValueOnce(null);

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Invalid token.' });
            expect(mockDecode).toHaveBeenCalledWith(mockToken, { complete: true });
            expect(mockGetSigningKey).not.toHaveBeenCalled();
            expect(mockVerify).not.toHaveBeenCalled();
        });

        it('should return isValid: false for an invalid token (decode returns string)', async () => {
            mockDecode.mockReturnValueOnce('invalid token string');

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Invalid token.' });
            expect(mockDecode).toHaveBeenCalledWith(mockToken, { complete: true });
            expect(mockGetSigningKey).not.toHaveBeenCalled();
            expect(mockVerify).not.toHaveBeenCalled();
        });

        it('should return isValid: false if token has no header or payload', async () => {
            mockDecode.mockReturnValueOnce({ header: null, payload: mockPayload });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Token dont have header or payload.' });
            expect(mockDecode).toHaveBeenCalledWith(mockToken, { complete: true });
            expect(mockGetSigningKey).not.toHaveBeenCalled();
            expect(mockVerify).not.toHaveBeenCalled();
        });

        it('should return isValid: false if error getting signing key', async () => {
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: mockPayload });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(new Error('Key error'));
            });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Error to get signed key.' });
            expect(mockLoggerError).toHaveBeenCalledWith({
                message: 'Error to get signed key:',
                additionalInfo: 'Key error',
            });
            expect(mockVerify).not.toHaveBeenCalled();
        });

        it('should return isValid: false if signing key not found', async () => {
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: mockPayload });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, null); // Simulate key not found
            });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Error to get signed key.' });
            expect(mockLoggerError).toHaveBeenCalledWith({
                message: 'Error to get signed key:',
                additionalInfo: 'Signing key not found.',
            });
            expect(mockVerify).not.toHaveBeenCalled();
        });

        it('should return isValid: false if token verification fails', async () => {
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: mockPayload });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, { getPublicKey: () => mockPublicKey });
            });
            mockVerify.mockImplementationOnce((token: string, key: string, options: any, cb: (err: Error | null, payload?: any) => void) => {
                cb(new Error('Verification failed'));
            });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Invalid token: Verification failed' });
            expect(mockLoggerError).toHaveBeenCalledWith({
                message: 'Error to validate token:',
                additionalInfo: 'Verification failed',
            });
        });

        it('should return isValid: false if token_use is incorrect', async () => {
            const payloadWithWrongTokenUse = { ...mockPayload, token_use: 'access' };
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: payloadWithWrongTokenUse });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, { getPublicKey: () => mockPublicKey });
            });
            mockVerify.mockImplementationOnce((token: string, key: string, options: any, cb: (err: Error | null, payload?: any) => void) => {
                cb(null, payloadWithWrongTokenUse);
            });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: false, error: 'Incorrect token. Expected: id, Received: access' });
        });

        it('should return isValid: false if Access Token client_id mismatch', async () => {
            const payloadWithWrongClientId = { ...mockPayload, token_use: 'access', client_id: 'wrong-client-id' };
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: payloadWithWrongClientId });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, { getPublicKey: () => mockPublicKey });
            });
            mockVerify.mockImplementationOnce((token: string, key: string, options: any, cb: (err: Error | null, payload?: any) => void) => {
                cb(null, payloadWithWrongClientId);
            });

            const result = await cognitoToken.validateToken(mockToken, 'access');

            expect(result).toEqual({ isValid: false, error: 'Access Token dont belongs to Client ID.' });
        });

        it('should return isValid: true for a valid ID token', async () => {
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: mockPayload });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, { getPublicKey: () => mockPublicKey });
            });
            mockVerify.mockImplementationOnce((token: string, key: string, options: any, cb: (err: Error | null, payload?: any) => void) => {
                cb(null, mockPayload);
            });

            const result = await cognitoToken.validateToken(mockToken, 'id');

            expect(result).toEqual({ isValid: true, payload: mockPayload });
            expect(mockDecode).toHaveBeenCalledWith(mockToken, { complete: true });
            expect(mockGetSigningKey).toHaveBeenCalledWith(mockKid, expect.any(Function));
            expect(mockVerify).toHaveBeenCalledWith(
                mockToken,
                mockPublicKey,
                {
                    algorithms: ['RS256'],
                    issuer: `https://cognito-idp.${envCognito.region}.amazonaws.com/${envCognito.userPoolId}`,
                    audience: envCognito.clientId,
                },
                expect.any(Function)
            );
        });

        it('should return isValid: true for a valid Access token', async () => {
            const mockAccessTokenPayload = { ...mockPayload, token_use: 'access', client_id: envCognito.clientId };
            mockDecode.mockReturnValueOnce({ header: { kid: mockKid }, payload: mockAccessTokenPayload });
            mockGetSigningKey.mockImplementationOnce((kid: string, cb: (err: Error | null, key?: any) => void) => {
                cb(null, { getPublicKey: () => mockPublicKey });
            });
            mockVerify.mockImplementationOnce((token: string, key: string, options: any, cb: (err: Error | null, payload?: any) => void) => {
                cb(null, mockAccessTokenPayload);
            });

            const result = await cognitoToken.validateToken(mockToken, 'access');

            expect(result).toEqual({ isValid: true, payload: mockAccessTokenPayload });
            expect(mockDecode).toHaveBeenCalledWith(mockToken, { complete: true });
            expect(mockGetSigningKey).toHaveBeenCalledWith(mockKid, expect.any(Function));
            expect(mockVerify).toHaveBeenCalledWith(
                mockToken,
                mockPublicKey,
                {
                    algorithms: ['RS256'],
                    issuer: `https://cognito-idp.${envCognito.region}.amazonaws.com/${envCognito.userPoolId}`,
                    audience: undefined,
                },
                expect.any(Function)
            );
        });
    });
});