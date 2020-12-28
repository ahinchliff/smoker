import { createServer as createHttpServer } from "http";
import { Server as WebSocketServer } from "ws";
import initApp from "./app";
import { initServices } from "./services";
import config from "./config";

(async () => {
  const http = createHttpServer();

  const ws = new WebSocketServer({
    server: http,
    clientTracking: true,
  });

  const services = await initServices(config, ws);

  const app = initApp(config, services);

  http.on("request", app.callback());

  http.listen(config.port, () => {
    console.log(`app listening on ${config.port}`);
  });
})();
