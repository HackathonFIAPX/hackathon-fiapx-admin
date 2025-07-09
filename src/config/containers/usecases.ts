import { GetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/GetPreSignedUrlUseCase";
import { IGetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/IGetPreSignedUrlUseCase";
import { CreateUserUseCase } from "@application/usecases/users/create/CreateUserUseCase";
import { ICreateUserUseCase } from "@application/usecases/users/create/ICreateUserUseCase";
import { ILoginUseCase } from "@application/usecases/users/login/ILoginUseCase";
import { LoginUseCase } from "@application/usecases/users/login/LoginUseCase";
import { ISignUpUseCase } from "@application/usecases/users/signup/ISignUpUseCase";
import { SignUpUseCase } from "@application/usecases/users/signup/SignUpUseCase";
import { IValidateTokenUseCase } from "@application/usecases/users/validate-token/IValidateTokenUseCase";
import { ValidateTokenUseCase } from "@application/usecases/users/validate-token/ValidateTokenUseCase";
import { GetAllVideosByUserUseCase } from "@application/usecases/videos/GetAllVideosByUser/GetAllVideosByUserUseCase";
import { IGetAllVideosByUserUseCase } from "@application/usecases/videos/GetAllVideosByUser/IGetAllVideosByUserUseCase";
import { container } from "tsyringe";

// uploads
container.registerSingleton<IGetPreSignedUrlUseCase>('IGetPreSignedUrlUseCase', GetPreSignedUrlUseCase);

// users
container.registerSingleton<ISignUpUseCase>('ISignUpUseCase', SignUpUseCase);
container.registerSingleton<ILoginUseCase>('ILoginUseCase', LoginUseCase);
container.registerSingleton<IValidateTokenUseCase>('IValidateTokenUseCase', ValidateTokenUseCase);
container.registerSingleton<ICreateUserUseCase>('ICreateUserUseCase', CreateUserUseCase);

// videos
container.registerSingleton<IGetAllVideosByUserUseCase>('IGetAllVideosByUserUseCase', GetAllVideosByUserUseCase);