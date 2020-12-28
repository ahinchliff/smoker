import { useEffect, useState, useRef } from "react";
import * as moment from "moment";
import {
  Box,
  Container,
  makeStyles,
  Typography,
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
  Slider,
  Switch,
  TextField,
} from "@material-ui/core";
import SocketClient from "./clients/socket-client";
import Api from "./clients/api-client";
import config from "./config";

let wsReconnectnterval: NodeJS.Timeout | undefined = undefined;

const App = () => {
  const [showEditSettings, setShowEditSettings] = useState(false);

  const [authDetails, setAuthDetails] = useState<
    api.LoginResponseBody | undefined
  >(undefined);

  const [socketStatus, setSocketStatus] = useState<"connected" | "connecting">(
    "connecting"
  );

  const [report, setReport] = useState<api.ReportRequestBody | undefined>(
    undefined
  );

  const [systemState, setSystemState] = useState<api.SystemState | undefined>(
    undefined
  );

  const [secondsSinceLastReport, setSecondsSinceLastReport] = useState<number>(
    0
  );

  const api = useRef(
    new Api(config.apiEndpoint, (e) => {
      console.log(e);
      throw e.response ? e.response.data : e;
    })
  );

  const socketClient = useRef(
    new SocketClient(config.socketEndpoint, {
      onConnect: () => {
        setSocketStatus("connected");
        if (wsReconnectnterval) {
          clearInterval(wsReconnectnterval);
        }
      },
      onDisconnect: () => {
        if (!wsReconnectnterval) {
          wsReconnectnterval = setInterval(connectToSocketEndpoint, 5000);
        }
      },
      onError: () => {
        if (!wsReconnectnterval) {
          wsReconnectnterval = setInterval(connectToSocketEndpoint, 5000);
        }
      },
    })
  );

  const connectToSocketEndpoint = async () => {
    try {
      await socketClient.current.connect();
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSystemState = async () => {
    try {
      const result = await api.current.getSystemState();
      setSystemState(result);
    } catch (e) {
      console.log(e);
    }
  };

  const login = async (password: string) => {
    try {
      const result = await api.current.login({ password });
      setAuthDetails(result);
      api.current.setAuthorization(result.token);
    } catch (e) {
      console.log("failed to login", e);
      alert(
        "Failed to login. Password might be wrong or something is broken :/"
      );
    }
  };

  useEffect(() => {
    const secondsSinceLastReportInterval = setInterval(() => {
      setSecondsSinceLastReport(() => secondsSinceLastReport + 1);
    }, 1000);

    return () => clearInterval(secondsSinceLastReportInterval);
  }, [secondsSinceLastReport]);

  useEffect(() => {
    connectToSocketEndpoint();
    fetchSystemState();

    socketClient.current.addOnEvent(
      "SYSTEM_STATE_UPDATE",
      (body: api.UpdateSystemStateSocketEventBody) => {
        setReport(body);
        setSystemState(body);
        setSecondsSinceLastReport(0);
      }
    );

    return () => {
      if (wsReconnectnterval) {
        clearInterval(wsReconnectnterval);
      }
    };
  }, []);

  const toggleShowEditSettings = () => setShowEditSettings(!showEditSettings);

  const updateSystemState = async (data: api.SystemState) => {
    try {
      const result = await api.current.setSystemState(data);
      setSystemState(result);
    } catch (e) {
      console.log(e);
      alert("Failed to update. Probably need to annoy ant about it.");
    }
    toggleShowEditSettings();
  };

  const shutdown = () => api.current.shutdown();

  const classes = useStyles();

  const deviceIsOffline = secondsSinceLastReport > 5;

  return (
    <Box className={classes.app}>
      {socketStatus === "connected" && deviceIsOffline && (
        <OfflineBanner text="DEVICE IS OFFLINE" />
      )}
      <Container maxWidth="md" className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">DEVICE</Typography>
          </Grid>
          <Grid item xs={6}>
            <Box className={classes.paper} textAlign="center">
              <Typography variant="h5">TEMP</Typography>
              <Typography>
                {report && report.temperature && !deviceIsOffline
                  ? report.temperature.toFixed(2)
                  : "???"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box className={classes.paper} textAlign="center">
              <Typography variant="h5">FAN</Typography>
              <Typography>
                {report && !deviceIsOffline
                  ? report.fanOn
                    ? "ON"
                    : "OFF"
                  : "???"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4">SETTINGS</Typography>
          </Grid>
          {showEditSettings ? (
            <EditSettings
              authDetails={authDetails}
              login={login}
              systemState={systemState}
              updateSystemState={updateSystemState}
              toggleShowEditSettings={toggleShowEditSettings}
              shutdown={shutdown}
            />
          ) : (
            <DisplaySettings
              systemState={systemState}
              toggleShowEditSettings={toggleShowEditSettings}
            />
          )}
        </Grid>
      </Container>
    </Box>
  );
};

const DisplaySettings: React.FC<{
  systemState: api.SystemState | undefined;
  toggleShowEditSettings: () => void;
}> = (props) => {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Box className={classes.paper}>
        <SettingLine
          title="FAN MODE"
          value={
            props.systemState ? props.systemState.fanMode.toUpperCase() : "???"
          }
        />
        <Divider />
        {props.systemState?.fanMode === "manual" && (
          <>
            <SettingLine
              title="MANUAL FAN"
              value={
                props.systemState
                  ? props.systemState.manualFanState.toUpperCase()
                  : "???"
              }
            />
            <Divider />
          </>
        )}
        {props.systemState?.fanMode === "auto" && (
          <>
            <SettingLine
              title="AUTO TARGET TEMP"
              value={
                props.systemState
                  ? props.systemState.autoTargetTemperature.toString()
                  : "???"
              }
            />
          </>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={props.toggleShowEditSettings}
          size="large"
          fullWidth
        >
          CHANGE
        </Button>
      </Box>
    </Grid>
  );
};

const EditSettings: React.FC<{
  authDetails: api.LoginResponseBody | undefined;
  systemState: api.SystemState | undefined;
  login: (password: string) => Promise<void>;
  updateSystemState: (data: api.SystemState) => Promise<void>;
  toggleShowEditSettings: () => void;
  shutdown: () => Promise<{ success: boolean }>;
}> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");

  const [fanMode, setFanMode] = useState<"manual" | "auto">(
    props.systemState!.fanMode
  );

  const [autoTargetTemperature, setAutoTargetTemperature] = useState<number>(
    props.systemState!.autoTargetTemperature
  );

  const [manualFanState, setManualFanState] = useState<"on" | "off">(
    props.systemState!.manualFanState
  );

  const handleTabChange = (_event: any, newValue: "manual" | "auto") => {
    setFanMode(newValue);
  };

  const handleAutoTargetTemperatureChange = (
    _event: any,
    newValue: number | number[]
  ) => {
    setAutoTargetTemperature(newValue as number);
  };

  const handleManualFanStateChange = (event: any) => {
    setManualFanState(event.target.checked ? "on" : "off");
  };

  const classes = useStyles();

  const updateSystemState = async () => {
    setLoading(true);
    try {
      await props.updateSystemState({
        fanMode,
        autoTargetTemperature,
        manualFanState,
      });
    } catch (e) {
      alert("Failed to update. Probably need to annoy ant about it.");
    }
    setLoading(false);
  };

  if (
    !props.authDetails ||
    moment.utc(props.authDetails.expiry).isBefore(moment.utc())
  ) {
    return (
      <Grid item xs={12}>
        <Box className={classes.paper}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="PASSWORD"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  setLoading(true);
                  await props.login(password);
                  setLoading(false);
                }}
                size="large"
                fullWidth
                disabled={loading}
              >
                LOGIN
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="secondary"
                onClick={props.toggleShowEditSettings}
                size="large"
                fullWidth
              >
                CANCEL
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography>HINT: WHAT DOES ANT ALWAYS BRING?</Typography>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Box className={classes.paper}>
        <Tabs value={fanMode} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Automatic" value="auto" />
          <Tab label="Manual" value="manual" />
        </Tabs>

        <TabPanel value={fanMode} index={"auto"}>
          <Grid container xs={12}>
            <Grid item xs={3}>
              <Typography>TARGET TEMP</Typography>
            </Grid>
            <Grid item xs={7}>
              <Slider
                defaultValue={200}
                valueLabelDisplay="auto"
                step={10}
                marks
                min={100}
                max={300}
                onChange={handleAutoTargetTemperatureChange}
                value={autoTargetTemperature}
              />
            </Grid>
            <Grid item xs={2}>
              <Box textAlign="right">
                <Typography>{autoTargetTemperature}</Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={fanMode} index={"manual"}>
          <Grid container xs={12}>
            <Grid item xs={3}>
              <Typography>FAN</Typography>
            </Grid>
            <Grid item xs={9}>
              <Box display="flex" justifyContent="flex-end">
                <Switch
                  checked={manualFanState === "on"}
                  onChange={handleManualFanStateChange}
                  name="checkedA"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={updateSystemState}
              size="large"
              fullWidth
              disabled={loading}
            >
              SAVE
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="secondary"
              onClick={props.toggleShowEditSettings}
              size="large"
              fullWidth
            >
              CANCEL
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              onClick={props.shutdown}
              size="large"
              fullWidth
              disabled={loading}
            >
              SHUTDOWN
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

const TabPanel: React.FC<{ value: string | number; index: string | number }> = (
  props
) => {
  const { children, value, index, ...other } = props;

  const classes = useStyles();

  return (
    <div className={classes.tabPanel} hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
};

const SettingLine: React.FC<{ title: string; value: string }> = (props) => {
  const classes = useStyles();

  return (
    <Box
      className={classes.settingLine}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
    >
      <Box display="inline-block">
        <Typography>{props.title}</Typography>
      </Box>
      <Box display="inline-block">
        <Typography>{props.value}</Typography>
      </Box>
    </Box>
  );
};

const OfflineBanner: React.FC<{ text: string }> = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.offlineBanner} textAlign="center">
      <Typography variant="h6">{props.text}</Typography>
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  app: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    height: "100vh",
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "black",
    borderStyle: "solid",
  },
  offlineBanner: {
    padding: theme.spacing(1),
    backgroundColor: "red",
    color: "white",
  },
  settingLine: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  tabPanel: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
  },
}));

export default App;
