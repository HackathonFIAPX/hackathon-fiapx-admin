import env from 'env-var'

export const envCognito = Object.freeze({
    userPoolId: env.get('COGNITO_USER_POOL_ID').asString(),
    clientId: env.get('COGNITO_CLIENT_ID').asString(),
    region: env.get('COGNITO_REGION').asString(),
});