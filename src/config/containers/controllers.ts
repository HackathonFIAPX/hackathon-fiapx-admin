import { GetPresignedUrlController } from "@infra/http/controllers/upload/GetPresignedUrl/GetPresignedUrlController";
import { IController } from "@infra/http/protocols/controller";
import { container } from "tsyringe";

container.registerSingleton<IController>('GetPresignedUrlController', GetPresignedUrlController);