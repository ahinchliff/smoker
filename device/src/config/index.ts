const getEnvVariable = (property: string, canBeUndefined = false): any => {
  const value = process.env[property];

  if (!canBeUndefined && !value) {
    throw new Error(`${property} environment variable is not set`);
  }

  return value;
};

const config: device.Config = {
  apiEndpoint:
    getEnvVariable("NODE_ENV") === "production"
      ? "https://smoker-api.herokuapp.com"
      : "http://localhost:3000",
  password: getEnvVariable("PASSWORD"),
};
export default config;
