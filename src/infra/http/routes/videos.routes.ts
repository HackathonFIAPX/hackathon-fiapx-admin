import { Router } from "express"
import { IController } from "../protocols/controller"
import { container } from "tsyringe"
import { RouterAdapter } from "../adapters/RouterAdapter"
import { AuthMiddleware } from "../middlewares/auth.middleware";

const getAllVideosByUserController = container.resolve<IController>('GetAllVideosByUserController');
const updateVideoController = container.resolve<IController>('UpdateVideoController');

export default (route: Router): void => {
    route.get('/v1/videos', AuthMiddleware.handle, RouterAdapter.adapt(getAllVideosByUserController))
    route.put('/v1/private/videos', RouterAdapter.adapt(updateVideoController))
}