import { Router } from "express"
import { IController } from "../protocols/controller"
import { container } from "tsyringe"
import { RouterAdapter } from "../adapters/RouterAdapter"

const userLoginController = container.resolve<IController>('UserLoginController');
const userSignUpController = container.resolve<IController>('UserSignUpController');

export default (route: Router): void => {
    route.post('/v1/users/login', RouterAdapter.adapt(userLoginController))
    route.post('/v1/users/signup', RouterAdapter.adapt(userSignUpController))
}