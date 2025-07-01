import { TCognitoLogin, TCognitoSignUp } from "./TCognitoHandler";

export interface ICognitoHandler {
    login: (loginData: TCognitoLogin) => Promise<string>;
    signUp: (signUpData: TCognitoSignUp) => Promise<void>;
}