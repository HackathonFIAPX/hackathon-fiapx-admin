import { IGetPreSignedUrlUseCase } from "@application/usecases/upload/GetPreSignedUrl/IGetPreSignedUrlUseCase";
import { IController } from "@infra/http/protocols/controller";
import { HttpRequest, HttpResponse } from "@infra/http/protocols/http";
import { HttpResponseHandler } from "@infra/http/protocols/httpResponses";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetPresignedUrlController implements IController {
    constructor(
        @inject('IGetPreSignedUrlUseCase')
        private readonly getPresignedUrl: IGetPreSignedUrlUseCase
    ) {}

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { fileType, contentLength } = request.query;
        const tokenInfo = request.tokenInfo;

        const response = await this.getPresignedUrl.execute({
            contentLength,
            fileType,
            clientId: tokenInfo?.payload?.client_id,
        });

        return HttpResponseHandler.ok(response)
    }
}