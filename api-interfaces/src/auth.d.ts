declare namespace api {
  type LoginRequestBody = {
    password: string;
  };

  type LoginResponseBody = {
    token: string;
    expiry: string;
  };

  type RegisterPushNotificationRequestBody = {
    token: string;
    platform: "android" | "ios";
  };
}
