import * as Koa from "koa";
import * as Router from "@koa/router";
import { authBuilder, noAuthBuilder } from "./handlerBuilders";
import deviceHandlers from "./device";
import userHandlers from "./user";
import authHandlers from "./auth";

export default (
  app: Koa,
  config: api.Config,
  services: (logger: api.Logger) => api.Services
): void => {
  const auth = authBuilder(config, services);
  const unAuth = noAuthBuilder(config, services);

  const deviceRouter = new Router({ prefix: "/device" });
  deviceRouter.post("/report", auth(deviceHandlers.report));

  const userRouter = new Router({ prefix: "/user" });
  userRouter.post("/", auth(userHandlers.setSystemState));
  userRouter.get("/", unAuth(userHandlers.getSystemState));
  userRouter.post("/shutdown", auth(userHandlers.shutdown));

  const authRouter = new Router({ prefix: "/auth" });
  authRouter.post("/login", unAuth(authHandlers.login));

  app.use(deviceRouter.routes());
  app.use(userRouter.routes());
  app.use(authRouter.routes());
};
