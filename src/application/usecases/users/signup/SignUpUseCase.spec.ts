import { SignUpUseCase } from './SignUpUseCase';
import { ICognitoHandler } from '@infra/aws/cognito/CognitoHandler/ICognitoHandler';
import { TSignUpUseCaseInput } from './TSignUpUseCase';

// Mock ICognitoHandler
const mockSignUp = jest.fn();
const mockCognitoHandler: ICognitoHandler = {
    signUp: mockSignUp,
    login: jest.fn(), // Only include methods defined in ICognitoHandler
};

describe('SignUpUseCase', () => {
    let useCase: SignUpUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new SignUpUseCase(mockCognitoHandler);
    });

    it('should call cognitoHandler.signUp with correct parameters', async () => {
        const input: TSignUpUseCaseInput = { email: 'newuser@example.com', password: 'newpassword123' };
        mockSignUp.mockResolvedValue(undefined); // signUp might not return anything specific

        await useCase.execute(input);

        expect(mockSignUp).toHaveBeenCalledTimes(1);
        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'newuser@example.com',
            password: 'newpassword123',
            username: 'newuser@example.com',
        });
    });
});