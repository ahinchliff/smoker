const state: api.StateService = {
  fanMode: "manual",
  manualFanState: "off",
  autoTargetTemperature: 200,
  shutdown: false,
  numberOfSuccussiveInvalidTemperatures: 0,
};

export default state;
