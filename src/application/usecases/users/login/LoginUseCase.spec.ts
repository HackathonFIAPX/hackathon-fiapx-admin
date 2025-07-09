import { LoginUseCase } from './LoginUseCase';
import { ICognitoHandler } from '@infra/aws/cognito/CognitoHandler/ICognitoHandler';

// Mock ICognitoHandler
const mockLogin = jest.fn();
const mockCognitoHandler: ICognitoHandler = {
    login: mockLogin,
    signUp: jest.fn(), // Only include methods defined in ICognitoHandler
};

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new LoginUseCase(mockCognitoHandler);
    });

    it('should call cognitoHandler.login with correct parameters and return token', async () => {
        const input = { email: 'test@example.com', password: 'password123' };
        const mockCognitoResponse = 'mock_access_token'; // login returns string
        mockLogin.mockResolvedValue(mockCognitoResponse);

        const result = await useCase.execute(input);

        expect(mockLogin).toHaveBeenCalledTimes(1);
        expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        expect(result).toEqual({ token: 'mock_access_token' });
    });
});