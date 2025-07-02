import { CognitoHandler } from "@infra/aws/cognito/CognitoHandler/CognitoHandler";
import { ICognitoHandler } from "@infra/aws/cognito/CognitoHandler/ICognitoHandler";
import { CognitoToken } from "@infra/aws/cognito/CognitoToken/CognitoToken";
import { ICognitoToken } from "@infra/aws/cognito/CognitoToken/ICognitoToken";
import { IS3Handler } from "@infra/aws/s3/IS3Handler";
import { S3Handler } from "@infra/aws/s3/S3Handler";
import { container } from "tsyringe";

container.registerSingleton<IS3Handler>('IS3Handler',S3Handler);
container.registerSingleton<ICognitoHandler>('ICognitoHandler', CognitoHandler);
container.registerSingleton<ICognitoToken>('ICognitoToken', CognitoToken);
