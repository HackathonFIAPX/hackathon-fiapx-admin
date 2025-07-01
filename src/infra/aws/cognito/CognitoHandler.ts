import { AdminCreateUserCommand, AdminSetUserPasswordCommand, CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
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
        const { email, password } = signUpData;
          const adminCreateUserCommand = new AdminCreateUserCommand({
            UserPoolId: envCognito.userPoolId,
            Username: email,
            TemporaryPassword: password,
            MessageAction: "SUPPRESS",
            UserAttributes: [
              {
                Name: "email",
                Value: email,
              },
            ],
            DesiredDeliveryMediums: [] as any[],
          });

          const createResult = await cognitoClient.send(adminCreateUserCommand);
      
          console.log("Usuário criado com sucesso (status temporário):", createResult.User.Username);
      
          const setPasswordParams = {
            UserPoolId: envCognito.userPoolId,
            Username: email,
            Password: password,
            Permanent: true,
          };
          const adminSetUserPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
          await cognitoClient.send(adminSetUserPasswordCommand);
    }
}