import * as onoff from "onoff";
import * as moment from "moment";
import { PythonShell } from "python-shell";
import config from "./config";
import Api from "./clients/api-client";
import { exec } from "child_process";

let authDetails: api.LoginResponseBody | undefined = undefined;

const api = new Api(config.apiEndpoint, (e) => {
  console.log(e);
  throw e.response ? e.response.data : e;
});

const fanRelay = new onoff.Gpio(21, "out");

const isFanOn = () => fanRelay.readSync() === 0;

const getTempFromSensor = async (): Promise<number | undefined> => {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      "./device/src/temp-sensor/get-temp.py",
      {
        pythonPath: "/usr/bin/python2.7",
      },
      (err, results) => {
        if (err) {
          reject(err);
        }

        if (results) {
          const possibleNumber = Number(results[0]);
          isNaN(possibleNumber) ? resolve(undefined) : resolve(possibleNumber);
        } else {
          resolve(undefined);
        }
      }
    );
  });
};

(async () => {
  while (true) {
    const fanOn = isFanOn();

    if (
      !authDetails ||
      moment.utc().add(5, "minutes").isAfter(authDetails.expiry)
    ) {
      try {
        authDetails = await api.login({ password: config.password });
        api.setAuthorization(authDetails.token);
      } catch (e) {
        console.log("failed to login", e);
        return;
      }
    }

    const temperature = await getTempFromSensor();

    try {
      const reportResult = await api.report({
        temperature,
        fanOn,
      });

      if (reportResult.shutdown) {
        console.log("turning off");
        fanRelay.writeSync(0);
        fanRelay.unexport();
        exec("sudo shutdown -h now");
        return;
      }

      await fanRelay.write(reportResult.fanOn ? 0 : 1);
    } catch (e) {
      console.log("error reporting", e);
    }

    const table = [
      {
        temperature,
        fan: isFanOn(),
      },
    ];

    console.table(table);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
})();
