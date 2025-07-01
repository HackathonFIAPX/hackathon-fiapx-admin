import { ISignUpUseCase } from "@application/usecases/users/signup/ISignUpUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserSignUpController implements IController {
    constructor(
        @inject('ISignUpUseCase')
        private readonly signUpUseCase: ISignUpUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { email, password } = request.body;

        if (!email || !password) {
            return HttpResponseHandler.badRequest('Email, password and name are required');
        }

        await this.signUpUseCase.execute({ email, password});

        return HttpResponseHandler.created({ email, password });
    }
}