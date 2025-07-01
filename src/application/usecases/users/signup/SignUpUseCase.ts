import { inject, injectable } from "tsyringe";
import { ISignUpUseCase } from "./ISignUpUseCase";
import { ICognitoHandler } from "@infra/aws/cognito/CognitoHandler/ICognitoHandler";
import { TSignUpUseCaseInput, TSignUpUseCaseOutput } from "./TSignUpUseCase";

@injectable()
export class SignUpUseCase implements ISignUpUseCase {
    constructor(
        @inject("ICognitoHandler")
        private cognitoHandler: ICognitoHandler
    ) {}

    async execute(input: TSignUpUseCaseInput): Promise<TSignUpUseCaseOutput> {
        const { email, password } = input;
        const username = email;

        await this.cognitoHandler.signUp({ email, password, username });
    }
}