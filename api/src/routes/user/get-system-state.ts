import { RequestHandler } from "../handlerBuilders";

const getSystemState: RequestHandler<{}, {}, {}, api.SystemState> = async ({
  services,
}) => {
  const { state } = services;

  return state;
};

export default getSystemState;
