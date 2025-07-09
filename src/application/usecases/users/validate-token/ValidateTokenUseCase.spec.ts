import { ValidateTokenUseCase } from './ValidateTokenUseCase';
import { ICognitoToken } from '@infra/aws/cognito/CognitoToken/ICognitoToken';
import { TValidateTokenUseCaseInput, TValidateTokenUseCaseOutput } from './TValidateTokenUseCase';
import { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload
import { TValidTokenResult } from '@infra/aws/cognito/CognitoToken/TCognitoToken'; // Import TValidTokenResult

// Mock ICognitoToken
const mockValidateToken = jest.fn();
const mockCognitoToken: ICognitoToken = {
    validateToken: mockValidateToken,
};

describe('ValidateTokenUseCase', () => {
    let useCase: ValidateTokenUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ValidateTokenUseCase(mockCognitoToken);
    });

    it('should call cognitoToken.validateToken with correct parameters and return validation result', async () => {
        const input: TValidateTokenUseCaseInput = { token: 'mock_token' };
        const mockPayload: JwtPayload = { sub: '123', email: 'test@example.com' };
        const mockCognitoTokenResponse: TValidTokenResult = { isValid: true, payload: mockPayload };
        mockValidateToken.mockResolvedValue(mockCognitoTokenResponse);

        const result = await useCase.execute(input);

        expect(mockValidateToken).toHaveBeenCalledTimes(1);
        expect(mockValidateToken).toHaveBeenCalledWith('mock_token', 'access');
        expect(result).toEqual({
            isValid: true,
            payload: mockPayload,
        });
    });

    it('should return isValid: false and payload: undefined if token is invalid', async () => {
        const input: TValidateTokenUseCaseInput = { token: 'invalid_token' };
        const mockCognitoTokenResponse: TValidTokenResult = { isValid: false, payload: undefined }; // Explicitly type
        mockValidateToken.mockResolvedValue(mockCognitoTokenResponse);

        const result = await useCase.execute(input);

        expect(mockValidateToken).toHaveBeenCalledTimes(1);
        expect(mockValidateToken).toHaveBeenCalledWith('invalid_token', 'access');
        expect(result).toEqual({
            isValid: false,
            payload: undefined,
        });
    });
});
