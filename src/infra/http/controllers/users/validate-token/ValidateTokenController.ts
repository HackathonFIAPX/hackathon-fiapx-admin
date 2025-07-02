import { IValidateTokenUseCase } from "@application/usecases/users/validate-token/IValidateTokenUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class ValidateTokenController implements IController {
    constructor(
        @inject('IValidateTokenUseCase')
        private validateTokenUseCase: IValidateTokenUseCase
    ) {}

    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        const { token } = httpRequest.body;

        if (!token) {
            return {
                statusCode: 400,
                body: { error: 'Token is required.' }
            };
        }

        const result = await this.validateTokenUseCase.execute({ token });

        if (result.isValid) {
            return HttpResponseHandler.ok(result);
        } else {
            return HttpResponseHandler.unauthorized(result);
        }
    }
}