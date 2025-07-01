import { IUseCase } from "@application/usecases/IUseCase";
import { TLoginUseCaseInput, TLoginUseCaseOutput } from "./TLoginUseCase";

export interface ILoginUseCase extends IUseCase<TLoginUseCaseInput, TLoginUseCaseOutput> {}