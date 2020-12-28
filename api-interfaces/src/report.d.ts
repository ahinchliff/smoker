declare namespace api {
  type ReportRequestBody = {
    temperature: number | undefined;
    fanOn: boolean;
  };

  type ReportRequestResponse = {
    fanOn: boolean;
    shutdown: boolean;
  };
}
