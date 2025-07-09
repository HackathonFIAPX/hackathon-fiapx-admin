import { NextFunction, Response, Request } from "express";
import { ICognitoToken } from "@infra/aws/cognito/CognitoToken/ICognitoToken";
import { container, injectable } from "tsyringe";

export class AuthMiddleware {
    static async handle(request: Request, response: Response, next: NextFunction): Promise<void> {
        const authorization = request.headers.authorization
        
        const isAuthenticated = authorization && authorization.startsWith('Bearer ');
        if (!isAuthenticated) {
            response.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const token = authorization.split(' ')[1];
        const cognitoToken = container.resolve<ICognitoToken>('ICognitoToken');

        const tokenInfo = await cognitoToken.validateToken(token, 'access');
        if (!tokenInfo || !tokenInfo.isValid) {
            response.status(401).json({ error: tokenInfo?.error || 'Invalid token' });
            return;
        }

        request.tokenInfo = tokenInfo;

        next();
    }
}