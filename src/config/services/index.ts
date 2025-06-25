import { DynamoDBConnector } from "@infra/persistence/dynamodb/dynamo-db-connector"
import { Server } from "./server"
import { Logger } from "@infra/utils/logger/Logger"

(async () => {
    const dbConnected = await DynamoDBConnector.getInstance().connect()
    if(!dbConnected) {
        Logger.error({
            message: '[APP] - Database connection failed',
        })
        process.exit()
    }

    const serverInitialized = Server.getInstance().inititalize()
    if(!serverInitialized) {
        Logger.error({
            message: '[APP] - Server initialization failed',
        })
        process.exit()
    }
})()