import env from 'env-var'

export const envDynamoDB = Object.freeze({
    region: env.get('DYNAMODB_REGION').asString() as string,
    endpoint: env.get('DYNAMODB_HOST').asString() as string,
    accessKeyId: env.get('DYNAMODB_ACCESS_KEY_ID').asString() as string,
    secretAccessKey: env.get('DYNAMODB_SECRET_ACCESS_KEY').asString() as string,
    tableName: env.get('DYNAMODB_TABLE').asString() as string
})