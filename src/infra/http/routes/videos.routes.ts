import { Router } from "express"
import { IController } from "../protocols/controller"
import { container } from "tsyringe"
import { RouterAdapter } from "../adapters/RouterAdapter"
import { AuthMiddleware } from "../middlewares/auth.middleware";

const getAllVideosByUserController = container.resolve<IController>('GetAllVideosByUserController');

export default (route: Router): void => {
    route.post('/v1/videos', AuthMiddleware.handle, RouterAdapter.adapt(getAllVideosByUserController))
}