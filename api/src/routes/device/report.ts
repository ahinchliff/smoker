import * as Joi from "joi";
import { RequestHandler } from "../handlerBuilders";
import { validate, ValidationSchema } from "../../utils/validationUtils";
import { validationBadRequest } from "../../utils/errorsUtils";

const bodyValidation: ValidationSchema<api.ReportRequestBody> = {
  temperature: Joi.number(),
  fanOn: Joi.boolean().required(),
};

const report: RequestHandler<
  {},
  {},
  api.ReportRequestBody,
  api.ReportRequestResponse
> = async ({ body, services }) => {
  const { state, socket, pushNotification } = services;

  const bodyValidationResult = await validate(body, bodyValidation);

  if (bodyValidationResult.isInvalid) {
    return validationBadRequest(bodyValidationResult.errors);
  }

  const shutdown = state.shutdown;
  state.shutdown = false;

  if (!body.temperature) {
    state.numberOfSuccussiveInvalidTemperatures =
      state.numberOfSuccussiveInvalidTemperatures + 1;

    if (state.numberOfSuccussiveInvalidTemperatures % 30 === 0) {
      await pushNotification.sendInvalidTemperatureNotification();
    }
  } else {
    state.numberOfSuccussiveInvalidTemperatures = 0;
  }

  const fanOn = shouldFanBeOn(state, body.temperature);

  await socket.broadcastSystemState({
    ...state,
    ...body,
  });

  return {
    fanOn,
    shutdown,
  };
};

const shouldFanBeOn = (
  state: api.StateService,
  temperature: number | undefined
): boolean => {
  console.log("should fan be on", state, temperature);

  if (state.fanMode === "manual" && state.manualFanState === "on") {
    return true;
  }

  if (temperature && temperature < state.autoTargetTemperature) {
    return true;
  }

  return false;
};

export default report;
