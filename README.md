# SMOKER

A hacked together fullstack TypeScript project that allows my mate to remotely monitor and adjust the temperature of his meat smoker.

## Components

### Device

A very basic loop written in TypeScript that interfaces with the fan relay and temperature sensor using the 'onoff' package. Sends the current temperature over HTTP to the API every second. The HTTP response contains if the fan should be on/off.

Currently running on a Raspberry Pi Zero WH. On startup, the device checks if it has the most recent git commit and if not pulls, builds the TypeScript and run the compiled JS using NodeJS.

### Api

KoaJS app running on NodeJS.

- Allows webapp user and device to authenticate.
- Receives data from device and based on current settings determines if the fan should be on or off.
- Receives settings from the web app and stores them in a very simple stateful JavaScript object (anything more would be overkill for this project)
- Pushes device data to web app using websockets.

### Web App

Allows the user to set a target temperature or manually set if the fan should be on or off. Receives a socket event emitted from the API containing the current temperature and if the fan is currently running.

## Improvements

Pretty much everything. A quick and messy project to get something up and running. The main things I would improve if building a production project are:

- Break the web app into Pages and then components. Currently the entire app is in the App.tsx file :)
- Host the web app on AWS S3 and the api on AWS lambda. I am using Heroku 1) the device is reporting every one second which would exceed AWS Lambda free tier 2) Too lazy to build a deployment pipeline so Heroku makes it easy to deploy both the api and webapp at the same time.
- Eject from Create React App so I could share code between the web and device projects. Current the base HTTP client is duplicated in both projects. Too lazy to setup Webpack and Babel.
- General code quality and tests!
