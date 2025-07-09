import { IUseCase } from "@application/usecases/IUseCase";
import { TCreateUserUseCaseInput, TCreateUserUseCaseOutput } from "./TCreateUserUseCase";

export interface ICreateUserUseCase extends IUseCase<TCreateUserUseCaseInput, TCreateUserUseCaseOutput> {}