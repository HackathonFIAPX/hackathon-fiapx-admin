import { JwtPayload } from "jsonwebtoken";

export type TValidateTokenUseCaseInput = {
  token: string;
};

export type TValidateTokenUseCaseOutput = {
  isValid: boolean;
  payload: JwtPayload;
};