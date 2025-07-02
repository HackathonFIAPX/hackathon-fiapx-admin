import { GetPresignedUrlController } from "@infra/http/controllers/upload/GetPresignedUrl/GetPresignedUrlController";
import { UserLoginController } from "@infra/http/controllers/users/login/UserLoginController";
import { UserSignUpController } from "@infra/http/controllers/users/signup/UserSignUpController";
import { ValidateTokenController } from "@infra/http/controllers/users/validate-token/ValidateTokenController";
import { IController } from "@infra/http/protocols/controller";
import { container } from "tsyringe";

container.registerSingleton<IController>('GetPresignedUrlController', GetPresignedUrlController);
container.registerSingleton<IController>('UserSignUpController', UserSignUpController);
container.registerSingleton<IController>('UserLoginController', UserLoginController);
container.registerSingleton<IController>('ValidateTokenController', ValidateTokenController);