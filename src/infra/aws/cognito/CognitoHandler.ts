import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ICognitoHandler } from "./ICognitoHandler";
import { TCognitoLogin, TCognitoSignUp } from "./TCognitoHandler";
import { envCognito } from "@config/variables/cognito";

const cognitoClient = new CognitoIdentityProviderClient({
    region: envCognito.region,
})

export class CognitoHandler implements ICognitoHandler {
    async login(loginData: TCognitoLogin): Promise<string> {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: envCognito.clientId,
            AuthParameters: {
                USERNAME: loginData.email,
                PASSWORD: loginData.password
            }
        })
        const result = await cognitoClient.send(command);

        if (!result.AuthenticationResult || !result.AuthenticationResult?.AccessToken) {
            throw new Error('Login failed: Invalid credentials or user not found');
        }

        return result.AuthenticationResult.AccessToken;
    }

    async signUp(signUpData: TCognitoSignUp): Promise<void> {
        const command = new SignUpCommand({
            ClientId: envCognito.clientId,
            Username: signUpData.email,
            Password: signUpData.password,
            UserAttributes: [
                {
                    Name: "email",
                    Value: signUpData.email
                }
            ]
        })
        const result = await cognitoClient.send(command);

        if (!result.UserConfirmed) {
            throw new Error('Sign-up failed: User not confirmed');
        }
    }
}