import { inject, injectable } from "tsyringe";
import { IValidateTokenUseCase } from "./IValidateTokenUseCase";
import { ICognitoToken } from "@infra/aws/cognito/CognitoToken/ICognitoToken";
import { TValidateTokenUseCaseInput, TValidateTokenUseCaseOutput } from "./TValidateTokenUseCase";

@injectable()
export class ValidateTokenUseCase implements IValidateTokenUseCase {
  constructor(
    @inject('ICognitoToken')
    private cognitoToken: ICognitoToken
  ) {}

  async execute(input: TValidateTokenUseCaseInput): Promise<TValidateTokenUseCaseOutput> {
    const { token } = input;

    const validationResult = await this.cognitoToken.validateToken(token, 'id');

    return {
      isValid: validationResult.isValid,
      payload: validationResult.payload,
    };
  }
}