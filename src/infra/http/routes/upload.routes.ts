import { Router } from "express";
import { IController } from "../protocols/controller";
import { container } from "tsyringe";
import { RouterAdapter } from "../adapters/RouterAdapter";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const getPresignedUrlController = container.resolve<IController>('GetPresignedUrlController');

export default (route: Router): void => {
    route.get('/v1/uploads/presigned-url', AuthMiddleware.handle, RouterAdapter.adapt(getPresignedUrlController))
}