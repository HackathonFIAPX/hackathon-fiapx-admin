import { inject, injectable } from "tsyringe";
import { ILoginUseCase } from "./ILoginUseCase";
import { ICognitoHandler } from "@infra/aws/cognito/ICognitoHandler";

@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject("ICognitoHandler")
        private cognitoHandler: ICognitoHandler
    ) {}

    async execute(input: { email: string; password: string }): Promise<{ token: string }> {
        const { email, password } = input;
        const token = await this.cognitoHandler.login({ email, password });

        return { token };
    }
}