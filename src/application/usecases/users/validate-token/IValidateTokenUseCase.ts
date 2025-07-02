import { IUseCase } from "@application/usecases/IUseCase";
import { TValidateTokenUseCaseInput, TValidateTokenUseCaseOutput } from "./TValidateTokenUseCase";

export interface IValidateTokenUseCase extends IUseCase<TValidateTokenUseCaseInput, TValidateTokenUseCaseOutput> {}