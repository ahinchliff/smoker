import { RequestHandler } from "../handlerBuilders";

const shutdown: RequestHandler<{}, {}, {}, { success: boolean }> = async ({
  services,
}) => {
  const { state } = services;

  state.shutdown = true;

  return { success: true };
};

export default shutdown;
