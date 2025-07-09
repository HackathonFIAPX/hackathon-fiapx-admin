import { IUseCase } from "@application/usecases/IUseCase";
import { TGetAllVideosByUserUseCaseInput, TGetAllVideosByUserUseCaseOutput } from "./TGetAllVideosByUserUseCase";

export interface IGetAllVideosByUserUseCase extends IUseCase<TGetAllVideosByUserUseCaseInput, TGetAllVideosByUserUseCaseOutput> {}