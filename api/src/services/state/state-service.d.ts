declare namespace api {
  type StateService = {
    fanMode: "auto" | "manual";
    manualFanState: "on" | "off";
    autoTargetTemperature: number;
    shutdown: boolean;
    numberOfSuccussiveInvalidTemperatures: number;
  };
}
