import { AxiosError, AxiosResponse } from "axios";
import { ApiClientBase } from "./api-client-base";

export default class Api extends ApiClientBase {
  constructor(
    protected endpoint: string,
    onError: (
      apiError: AxiosError,
      url: string,
      errorHandled?: boolean
    ) => never
  ) {
    super({
      apiBaseURL: endpoint,
      onError: (apiError: AxiosError, url: string, errorHandled?: boolean) =>
        onError(apiError, url, errorHandled),
      responseDataMapper(res: AxiosResponse<any>) {
        return res.data;
      },
    });
  }

  public report = async (
    data: api.ReportRequestBody
  ): Promise<api.ReportRequestResponse> => {
    return this.post<api.ReportRequestResponse>("/device/report", data);
  };

  public login = async (
    data: api.LoginRequestBody
  ): Promise<api.LoginResponseBody> => {
    return this.post<api.LoginResponseBody>("/auth/login", data);
  };
}
