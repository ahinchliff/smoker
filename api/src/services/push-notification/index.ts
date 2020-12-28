import Axios, { AxiosInstance } from "axios";

export default class PushNotificationService
  implements api.IPushNotificationService {
  private apiClient: AxiosInstance;
  constructor(private config: api.Config["pushed"]) {
    this.apiClient = Axios.create({
      baseURL: "https://api.pushed.co/1",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public sendInvalidTemperatureNotification = async () =>
    this.sendNotification(
      "Haven't received a valid temperature for over 30 seconds. Turning the fan off if running in automatic mode."
    );

  private sendNotification = async (message: string) => {
    try {
      await this.apiClient.post("/push", {
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
        content: message,
        target_type: "app",
      });
    } catch (err) {
      console.log("failed to send notification", err);
    }
  };
}
