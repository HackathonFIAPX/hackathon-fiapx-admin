import { TValidTokenResult } from "./TCognitoToken";

export interface ICognitoToken {
    validateToken(token: string, expectedTokenUse: 'id' | 'access'): Promise<TValidTokenResult>;
}
