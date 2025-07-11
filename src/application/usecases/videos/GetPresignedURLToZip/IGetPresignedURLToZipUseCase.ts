import { IUseCase } from "@application/usecases/IUseCase";
import { TGetPresignedURLToZipUseCaseInput, TGetPresignedURLToZipUseCaseOutput } from "./TGetPresignedURLToZipUseCase";

export interface IGetPresignedURLToZipUseCase extends IUseCase<TGetPresignedURLToZipUseCaseInput, TGetPresignedURLToZipUseCaseOutput> {}