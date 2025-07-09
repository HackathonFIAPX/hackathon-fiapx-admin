import { User } from "@domain/models/User"

export type TCreateUserUseCaseInput = {
    clientId: string
    name: string
}

export type TCreateUserUseCaseOutput = User