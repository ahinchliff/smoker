declare namespace api {
  interface ISocketService {
    broadcastSystemState(
      data: api.UpdateSystemStateSocketEventBody
    ): Promise<void>;
  }
}
