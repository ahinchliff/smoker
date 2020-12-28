declare namespace api {
  interface IPushNotificationService {
    sendInvalidTemperatureNotification(): Promise<void>;
  }
}
