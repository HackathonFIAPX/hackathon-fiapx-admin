import { ICreateUserUseCase } from "@application/usecases/users/create/ICreateUserUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class CreateUserController implements IController {
    constructor(
        @inject("ICreateUserUseCase")
        private readonly createUserUseCase: ICreateUserUseCase
    ) {}

    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        const { clientId, name } = httpRequest.body;
        if (!clientId || !name) {
            return HttpResponseHandler.badRequest("Missing required fields: clientId and name.");
        }

        const result = await this.createUserUseCase.execute({
            clientId,
            name,
        });

        return HttpResponseHandler.created(result)
    }
}