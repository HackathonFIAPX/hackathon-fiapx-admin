import { GetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/GetPreSignedUrlUseCase";
import { IGetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/IGetPreSignedUrlUseCase";
import { ILoginUseCase } from "@application/usecases/users/login/ILoginUseCase";
import { LoginUseCase } from "@application/usecases/users/login/LoginUseCase";
import { ISignUpUseCase } from "@application/usecases/users/signup/ISignUpUseCase";
import { SignUpUseCase } from "@application/usecases/users/signup/SignUpUseCase";
import { IValidateTokenUseCase } from "@application/usecases/users/validate-token/IValidateTokenUseCase";
import { ValidateTokenUseCase } from "@application/usecases/users/validate-token/ValidateTokenUseCase";
import { container } from "tsyringe";

container.registerSingleton<IGetPreSignedUrlUseCase>('IGetPreSignedUrlUseCase', GetPreSignedUrlUseCase);

container.registerSingleton<ISignUpUseCase>('ISignUpUseCase', SignUpUseCase);
container.registerSingleton<ILoginUseCase>('ILoginUseCase', LoginUseCase);
container.registerSingleton<IValidateTokenUseCase>('IValidateTokenUseCase', ValidateTokenUseCase);
