import { IUseCase } from "@application/usecases/IUseCase";
import { TSignUpUseCaseInput, TSignUpUseCaseOutput } from "./TSignUpUseCase";

export interface ISignUpUseCase extends IUseCase<TSignUpUseCaseInput, TSignUpUseCaseOutput> {}