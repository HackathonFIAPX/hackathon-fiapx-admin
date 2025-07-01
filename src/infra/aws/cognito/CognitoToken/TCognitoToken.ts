import { JwtPayload } from "jsonwebtoken";

export interface TValidTokenResult {
    isValid: boolean;
    payload?: JwtPayload;
    error?: string;
}