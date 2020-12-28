import { Server as WebSocketServer, OPEN } from "ws";

export default class SocketService implements api.ISocketService {
  constructor(private ws: WebSocketServer) {}

  public broadcastSystemState = async (
    systemState: api.UpdateSystemStateSocketEventBody
  ) => this.broadcast("SYSTEM_STATE_UPDATE", systemState);

  private broadcast = async (event: string, body: any) => {
    this.ws.clients.forEach(function each(client) {
      if (client.readyState === OPEN) {
        console.log(`Socket Client - Sending "${event}"`);
        client.send(
          JSON.stringify({
            event,
            body,
          })
        );
      }
    });
  };
}
