import { IUseCase } from "@application/usecases/IUseCase";
import { TGetPreSignedUrlUseCaseInput, TGetPreSignedUrlUseCaseOutput } from "./TGetPreSignedUrlUseCase";

export interface IGetPreSignedUrlUseCase extends IUseCase<TGetPreSignedUrlUseCaseInput, TGetPreSignedUrlUseCaseOutput> {}