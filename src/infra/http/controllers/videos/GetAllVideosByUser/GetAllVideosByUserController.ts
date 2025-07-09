import { IGetAllVideosByUserUseCase } from "@application/usecases/videos/GetAllVideosByUser/IGetAllVideosByUserUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetAllVideosByUserController implements IController {
    constructor(
        @inject('IGetAllVideosByUserUseCase')
        private readonly getAllVideosByUserUseCase: IGetAllVideosByUserUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { clientId } = request.tokenInfo.payload.client_id;

        const result = await this.getAllVideosByUserUseCase.execute({
            clientId,
        });

        return HttpResponseHandler.ok(result)
    }
}