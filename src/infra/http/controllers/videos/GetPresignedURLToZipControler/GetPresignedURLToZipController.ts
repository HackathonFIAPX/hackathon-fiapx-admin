import { IGetPresignedURLToZipUseCase } from "@application/usecases/videos/GetPresignedURLToZip/IGetPresignedURLToZipUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetPresignedURLToZipController implements IController{
    constructor(
        @inject('IGetPresignedURLToZipUseCase')
        private readonly getPresignedURLToZipUseCase: IGetPresignedURLToZipUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { videoId } = request.params;
        const clientId = request.tokenInfo.payload.username;

        const presignedUrl = await this.getPresignedURLToZipUseCase.execute({
            clientId,
            videoId,
        });

        return HttpResponseHandler.ok(presignedUrl)
    }
}