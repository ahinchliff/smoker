declare namespace api {
  type Config = {
    environment: "test" | "development" | "staging" | "production";
    port: string;
    jwt: {
      secret: string;
      validForInHours: number;
    };
    password: string;
    pushed: {
      appKey: string;
      appSecret: string;
    };
  };
}
