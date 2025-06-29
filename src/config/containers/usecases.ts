import { GetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/GetPreSignedUrlUseCase";
import { IGetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/IGetPreSignedUrlUseCase";
import { container } from "tsyringe";

container.registerSingleton<IGetPreSignedUrlUseCase>('IGetPreSignedUrlUseCase', GetPreSignedUrlUseCase);