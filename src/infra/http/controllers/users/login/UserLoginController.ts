import { ILoginUseCase } from "@application/usecases/users/login/ILoginUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserLoginController implements IController {
    constructor(
        @inject('ILoginUseCase')
        private readonly loginUseCase: ILoginUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { email, password } = request.body;

        if (!email || !password) {
            return HttpResponseHandler.badRequest('Email and password are required');
        }

        const result = await this.loginUseCase.execute({ email, password });

        return HttpResponseHandler.ok({ email, password })
    }
}