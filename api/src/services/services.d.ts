declare namespace api {
  type Services = {
    auth: api.IAuthService;
    socket: api.ISocketService;
    state: api.StateService;
    pushNotification: api.IPushNotificationService;
  };
}
