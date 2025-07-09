import { CognitoHandler } from './CognitoHandler';
import { CognitoIdentityProviderClient, InitiateAuthCommand, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { envCognito } from '@config/variables/cognito';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
    const mockSend = jest.fn();
    return {
        __esModule: true, // This is important for mocking modules
        default: jest.fn(), // Mock the default export if any
        CognitoIdentityProviderClient: jest.fn(() => ({
            send: mockSend,
        })),
        InitiateAuthCommand: jest.fn().mockImplementation((params) => params),
        AdminCreateUserCommand: jest.fn().mockImplementation((params) => params),
        AdminSetUserPasswordCommand: jest.fn().mockImplementation((params) => params),
        mockSend: mockSend, // Export mockSend
    };
});

const { mockSend } = require('@aws-sdk/client-cognito-identity-provider');

jest.mock('@config/variables/cognito', () => ({
    envCognito: {
        region: 'mock-region',
        clientId: 'mock-client-id',
        userPoolId: 'mock-user-pool-id',
    },
}));

describe('CognitoHandler', () => {
    let cognitoHandler: CognitoHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        cognitoHandler = new CognitoHandler();
    });

    describe('login', () => {
        it('should successfully return an access token on successful login', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!',
            };
            const mockAccessToken = 'mock-access-token';

            mockSend.mockResolvedValueOnce({
                AuthenticationResult: {
                    AccessToken: mockAccessToken,
                },
            });

            const result = await cognitoHandler.login(loginData);

            expect(InitiateAuthCommand).toHaveBeenCalledWith({
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: envCognito.clientId,
                AuthParameters: {
                    USERNAME: loginData.email,
                    PASSWORD: loginData.password,
                },
            });
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockAccessToken);
        });

        it('should throw an error if login fails (no AuthenticationResult)', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            mockSend.mockResolvedValueOnce({});

            await expect(cognitoHandler.login(loginData)).rejects.toThrow('Login failed: Invalid credentials or user not found');
            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if login fails (no AccessToken)', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            mockSend.mockResolvedValueOnce({
                AuthenticationResult: {},
            });

            await expect(cognitoHandler.login(loginData)).rejects.toThrow('Login failed: Invalid credentials or user not found');
            expect(mockSend).toHaveBeenCalledTimes(1);
        });
    });

    describe('signUp', () => {
        it('should successfully sign up a user', async () => {
            const signUpData = {
                email: 'newuser@example.com',
                password: 'NewPassword123!',
                username: 'newuser@example.com', // Added username
            };

            mockSend.mockResolvedValueOnce({
                User: { Username: signUpData.email },
            }); // For AdminCreateUserCommand
            mockSend.mockResolvedValueOnce({}); // For AdminSetUserPasswordCommand

            await cognitoHandler.signUp(signUpData);

            expect(AdminCreateUserCommand).toHaveBeenCalledWith({
                UserPoolId: envCognito.userPoolId,
                Username: signUpData.email,
                TemporaryPassword: signUpData.password,
                MessageAction: 'SUPPRESS',
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: signUpData.email,
                    },
                ],
                DesiredDeliveryMediums: [],
            });
            expect(AdminSetUserPasswordCommand).toHaveBeenCalledWith({
                UserPoolId: envCognito.userPoolId,
                Username: signUpData.email,
                Password: signUpData.password,
                Permanent: true,
            });
            expect(mockSend).toHaveBeenCalledTimes(2);
        });
    });
});