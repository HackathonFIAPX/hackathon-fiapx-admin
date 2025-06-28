import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { envAWS } from "@config/variables/aws"
import { Logger } from "@infra/utils/logger/Logger"

const sqsClient = new SQSClient({
    region: envAWS.region,
    credentials: {
        accessKeyId: envAWS.accessKeyId,
        secretAccessKey: envAWS.secretAccessKey,
        sessionToken: envAWS.awsSessionToken,
    }
})

export enum ESQSMessageType {
    UPDATE_ORDER = 'proccess.update.order'
}

export type TSQSMessage = {
    type: ESQSMessageType
    data: any
}

export class SQSHandler {
    public static sendMessage = async (request: TSQSMessage) => {
        try {
            await sqsClient.send(new SendMessageCommand({
                QueueUrl: '', // substituir pela URL da fila SQS
                MessageBody: JSON.stringify(request),
            }))
        } catch (error) {
            Logger.error({
                message: 'Error sending message to SQS',
                additionalInfo: error,
            })
            throw new Error('Failed to send message to SQS')
        }
    }
} 