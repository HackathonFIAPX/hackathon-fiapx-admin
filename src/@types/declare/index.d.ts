import { TokenInfo } from '../../infra/aws/cognito/CognitoToken/TCognitoToken';

declare global {
  namespace Express {
    interface Request {
      tokenInfo?: TokenInfo;
    }
  }
}