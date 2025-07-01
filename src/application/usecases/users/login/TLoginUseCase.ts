export type TLoginUseCaseInput = {
    email: string;
    password: string;
}

export type TLoginUseCaseOutput = {
    token: string;
};