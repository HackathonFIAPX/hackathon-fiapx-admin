import { RequestLogger } from '@infra/utils/logger/RequestLogger'
import { Express } from 'express'
import 'express-async-errors'

export async function setupMiddlewares(app: Express): Promise<void> {
    app.use(RequestLogger.log())
}