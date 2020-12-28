import { Server as WebSocketServer } from "ws";

import AuthService from "./auth";
import PushNotificationService from "./push-notification";
import SocketService from "./socket";
import StateService from "./state";

export const initServices = async (
  config: api.Config,
  wsServer: WebSocketServer
): Promise<(logger: api.Logger) => api.Services> => {
  return (_logger: api.Logger): api.Services => {
    return {
      auth: new AuthService(config.jwt),
      socket: new SocketService(wsServer),
      state: StateService,
      pushNotification: new PushNotificationService(config.pushed),
    };
  };
};
