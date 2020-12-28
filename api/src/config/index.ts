const getEnvVariable = (property: string, canBeUndefined = false): any => {
  const value = process.env[property];

  if (!canBeUndefined && !value) {
    throw new Error(`${property} environment variable is not set`);
  }

  return value;
};

const config: api.Config = {
  environment: getEnvVariable("NODE_ENV"),
  port: getEnvVariable("PORT"),
  jwt: {
    secret: getEnvVariable("JWT_SECRET"),
    validForInHours: getEnvVariable("JWT_VALID_FOR_IN_HOURS"),
  },
  password: getEnvVariable("PASSWORD"),
  pushed: {
    appKey: getEnvVariable("PUSHED_APP_KEY"),
    appSecret: getEnvVariable("PUSHED_APP_SECRET"),
  },
};

export default config;
