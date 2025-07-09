import { NextFunction, Response, Request } from "express";
import { ICognitoToken } from "@infra/aws/cognito/CognitoToken/ICognitoToken";
import { container, injectable } from "tsyringe";
import { Logger } from "@infra/utils/logger/Logger";

export class AuthMiddleware {
    static async handle(request: Request, response: Response, next: NextFunction): Promise<void> {
        const authorization = request.headers.authorization
        
        Logger.info({
            message: 'AuthMiddleware - Checking authorization header',
            additionalInfo: {
                authorizationHeader: authorization,
                requestMethod: request.method,
                requestUrl: request.url
            }
        });
        const isAuthenticated = authorization && authorization.startsWith('Bearer ');
        if (!isAuthenticated) {
            Logger.info({
                message: 'AuthMiddleware - Unauthorized access attempt',
                additionalInfo: {
                    requestMethod: request.method,
                    requestUrl: request.url
                }
            });
            response.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const token = authorization.split(' ')[1];
        const cognitoToken = container.resolve<ICognitoToken>('ICognitoToken');

        const tokenInfo = await cognitoToken.validateToken(token, 'access');
        Logger.info({
            message: 'AuthMiddleware - Token validation result',
            additionalInfo: {
                tokenInfo,
                requestMethod: request.method,
                requestUrl: request.url
            }
        });
        if (!tokenInfo || !tokenInfo.isValid) {
            response.status(401).json({ error: tokenInfo?.error || 'Invalid token' });
            return;
        }

        request.tokenInfo = tokenInfo;
        Logger.info({
            message: 'AuthMiddleware - Token info from request',
            additionalInfo: {
                tokenInfo: request.tokenInfo,
            }
        });

        next();
    }
}