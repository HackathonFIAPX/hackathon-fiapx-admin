import { IUseCase } from "@application/usecases/IUseCase";
import { TGetPreSignedUrlInput, TGetPreSignedUrlOutput } from "./TGetPreSignedUrl";

export interface IGetPreSignedUrl extends IUseCase<TGetPreSignedUrlInput, TGetPreSignedUrlOutput> {}