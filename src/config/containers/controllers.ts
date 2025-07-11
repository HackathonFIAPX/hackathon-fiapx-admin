import { GetPresignedUrlController } from "@infra/http/controllers/upload/GetPresignedUrl/GetPresignedUrlController";
import { CreateUserController } from "@infra/http/controllers/users/create/CreateUserController";
import { UserLoginController } from "@infra/http/controllers/users/login/UserLoginController";
import { UserSignUpController } from "@infra/http/controllers/users/signup/UserSignUpController";
import { ValidateTokenController } from "@infra/http/controllers/users/validate-token/ValidateTokenController";
import { GetAllVideosByUserController } from "@infra/http/controllers/videos/GetAllVideosByUser/GetAllVideosByUserController";
import { GetPresignedURLToZipController } from "@infra/http/controllers/videos/GetPresignedURLToZipControler/GetPresignedURLToZipController";
import { UpdateVideoController } from "@infra/http/controllers/videos/UpdateVideo/UpdateVideoController";
import { IController } from "@infra/http/protocols/controller";
import { container } from "tsyringe";

// upload controllers
container.registerSingleton<IController>('GetPresignedUrlController', GetPresignedUrlController);

// user controllers
container.registerSingleton<IController>('UserSignUpController', UserSignUpController);
container.registerSingleton<IController>('UserLoginController', UserLoginController);
container.registerSingleton<IController>('ValidateTokenController', ValidateTokenController);
container.registerSingleton<IController>('CreateUserController', CreateUserController);

// video controllers
container.registerSingleton<IController>('GetAllVideosByUserController', GetAllVideosByUserController);
container.registerSingleton<IController>('UpdateVideoController', UpdateVideoController);
container.registerSingleton<IController>('GetPresignedURLToZipController', GetPresignedURLToZipController);