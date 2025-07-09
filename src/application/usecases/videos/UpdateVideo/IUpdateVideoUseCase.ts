import { IUseCase } from "@application/usecases/IUseCase";
import { TUpdateVideoUseCaseInput, TUpdateVideoUseCaseOutput } from "./TUpdateVideoUseCase";

export interface IUpdateVideoUseCase extends IUseCase<TUpdateVideoUseCaseInput, TUpdateVideoUseCaseOutput> {}