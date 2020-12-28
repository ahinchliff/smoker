import * as Joi from "joi";
import { RequestHandler } from "../handlerBuilders";
import { validate, ValidationSchema } from "../../utils/validationUtils";
import { validationBadRequest } from "../../utils/errorsUtils";

const bodyValidation: ValidationSchema<api.SetSystemStateRequestBody> = {
  autoTargetTemperature: Joi.number().required(),
  fanMode: Joi.string().valid("auto", "manual").required(),
  manualFanState: Joi.string().valid("on", "off").required(),
};

const setSystemState: RequestHandler<
  {},
  {},
  api.SetSystemStateRequestBody,
  api.SystemState
> = async ({ body, services }) => {
  const { state } = services;

  const bodyValidationResult = await validate(body, bodyValidation);

  if (bodyValidationResult.isInvalid) {
    return validationBadRequest(bodyValidationResult.errors);
  }

  state.fanMode = body.fanMode;
  state.manualFanState = body.manualFanState;
  state.autoTargetTemperature = body.autoTargetTemperature;

  return state;
};

export default setSystemState;
