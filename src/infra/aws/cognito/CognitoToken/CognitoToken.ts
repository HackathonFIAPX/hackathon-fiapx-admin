import { injectable } from "tsyringe";
import { ICognitoToken } from "./ICognitoToken";
import { JwksClient } from "jwks-rsa";
import { envCognito } from "@config/variables/cognito";
import { JwtHeader, JwtPayload, decode, verify } from "jsonwebtoken";
import { TValidTokenResult } from "./TCognitoToken";
import { Logger } from "@infra/utils/logger/Logger";

const jwksUri = `https://cognito-idp.${envCognito.region}.amazonaws.com/${envCognito.userPoolId}/.well-known/jwks.json`;
const jwksClient = new JwksClient({
    jwksUri,
    cache: true,         // Ativa o cache de chaves
    cacheMaxEntries: 5,  // Máximo de chaves a serem armazenadas em cache
    cacheMaxAge: 600000, // Tempo de cache em ms (10 minutos)
    rateLimit: true,     // Limita a taxa de requisições para a URI JWKS
    jwksRequestsPerMinute: 10, // Máximo de requisições por minuto
});

@injectable()
export class CognitoToken implements ICognitoToken {
    async validateToken(token: string, expectedTokenUse: 'id' | 'access'): Promise<TValidTokenResult> {
        return new Promise((resolve) => {
            // Decodifica o token para obter o cabeçalho
            const decodedToken = decode(token, { complete: true });
            if (!decodedToken || typeof decodedToken === 'string') {
                return resolve({ isValid: false, error: 'Invalid token.' });
            }

            const header = decodedToken.header;
            const payload = decodedToken.payload as JwtPayload;

            if (!header || !payload) {
                return resolve({ isValid: false, error: 'Token dont have header or payload.' });
            }

            this.getKey(header, (err, key) => {
                if (err || !key) {
                    Logger.error({ message: 'Error to get signed key:', additionalInfo: err?.message});
                    return resolve({ isValid: false, error: 'Error to get signed key.' });
                }

                verify(token, key, {
                    algorithms: ['RS256'], // Algoritmo de assinatura esperado pelo Cognito
                    // Opções de validação de claims
                    issuer: `https://cognito-idp.${envCognito.region}.amazonaws.com/${envCognito.userPoolId}`,
                    audience: expectedTokenUse === 'id' ? envCognito.clientId : undefined, // 'aud' é Client ID para ID Token
                    // 'client_id' é para Access Token, mas 'jsonwebtoken' não valida isso por padrão em 'audience'.
                    // Se for um Access Token, você pode verificar `payload.client_id` manualmente.
                }, (err, verifiedPayload) => {
                    if (err) {
                        Logger.error({ message: 'Error to validate token:', additionalInfo: err.message});
                        return resolve({ isValid: false, error: `Invalid token: ${err.message}` });
                    }

                    // Validações adicionais específicas do Cognito:
                    if (payload.token_use !== expectedTokenUse) {
                        return resolve({ isValid: false, error: `Incorrect token. Expected: ${expectedTokenUse}, Received: ${payload.token_use}` });
                    }
                    if (expectedTokenUse === 'access' && payload.client_id !== envCognito.clientId) {
                         return resolve({ isValid: false, error: `Access Token dont belongs to Client ID.` });
                    }

                    // Se tudo estiver correto
                    resolve({ isValid: true, payload: verifiedPayload as JwtPayload });
                });
            });
        });
    }

    private getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void): void {
        jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) {
                callback(err);
            } else {
                const signingKey = key?.getPublicKey(); // No TypeScript, 'key' pode ser undefined
                if (signingKey) {
                    callback(null, signingKey);
                } else {
                    callback(new Error('Signing key not found.'));
                }
            }
        });
    }
}