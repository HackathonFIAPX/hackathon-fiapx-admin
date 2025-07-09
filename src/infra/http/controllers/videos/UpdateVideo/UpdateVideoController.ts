import { IUpdateVideoUseCase } from "@application/usecases/videos/UpdateVideo/IUpdateVideoUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateVideoController implements IController {
    constructor(
        @inject("IUpdateVideoUseCase")
        private readonly updateVideoUseCase: IUpdateVideoUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { videoId, status } = request.body;
        const clientId = request.tokenInfo.payload.username;

        const result = await this.updateVideoUseCase.execute({
            clientId,
            videoId,
            status,
        });

        return HttpResponseHandler.ok(result);
    }
}