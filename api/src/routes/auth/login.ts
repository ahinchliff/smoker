import * as moment from "moment";
import * as Joi from "joi";
import { badRequest, validationBadRequest } from "../../utils/errorsUtils";
import { RequestHandler } from "../handlerBuilders";
import { validate, ValidationSchema } from "../../utils/validationUtils";
import { generateJWT } from "../../utils/authUtils";

const bodyValidation: ValidationSchema<api.LoginRequestBody> = {
  password: Joi.string().required(),
};

const login: RequestHandler<
  {},
  {},
  api.LoginRequestBody,
  api.LoginResponseBody
> = async ({ body, config }) => {
  const bodyValidationResult = await validate(body, bodyValidation);

  if (bodyValidationResult.isInvalid) {
    return validationBadRequest(bodyValidationResult.errors);
  }

  if (body.password !== config.password) {
    return badRequest("incorrect password");
  }

  return {
    token: generateJWT(config.jwt.secret, config.jwt.validForInHours),
    expiry: moment.utc().add(config.jwt.validForInHours, "hours").toISOString(),
  };
};

export default login;
