declare namespace api {
  type SystemState = {
    fanMode: "auto" | "manual";
    manualFanState: "on" | "off";
    autoTargetTemperature: number;
  };

  type SetSystemStateRequestBody = SystemState;

  type UpdateSystemStateSocketEventBody = api.SystemState &
    api.ReportRequestBody;
}
