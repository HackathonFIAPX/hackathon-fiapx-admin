import { Router } from "express"
import { IController } from "../protocols/controller"
import { container } from "tsyringe"
import { RouterAdapter } from "../adapters/RouterAdapter"
import { AuthMiddleware } from "../middlewares/auth.middleware";

const getAllVideosByUserController = container.resolve<IController>('GetAllVideosByUserController');
const updateVideoController = container.resolve<IController>('UpdateVideoController');
const getPresignedURLToZipController = container.resolve<IController>('GetPresignedURLToZipController');

export default (route: Router): void => {
    route.get('/v1/videos', AuthMiddleware.handle, RouterAdapter.adapt(getAllVideosByUserController))
    route.get('/v1/videos/:videoId/presigned/zip', AuthMiddleware.handle, RouterAdapter.adapt(getPresignedURLToZipController))
    route.put('/v1/private/videos', RouterAdapter.adapt(updateVideoController))
}