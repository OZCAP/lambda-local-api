# Local lambda API

Lightweight express-based wrapper for running lambda API gateways locally. This package is an alternative to using AWS SAM for lambda development. This package is not designed to be used on a production environment.

## What is wrong with AWS SAM?

While developing APIs locally using AWS SAM, you will likely run into the following annoying issues:

1. Slow — AWS SAM relies on spinning up a Docker container to run lambda function. This can take a long time to start up and restart between changes.
1. Blocking — AWS SAM spins up a single docker container to handle one request at a time. This can be a problem if you are testing a service that requires multiple requests to be made concurrently.

## Installation

To install the CLI as a dev dependency, run the following command:

```bash
npm install --save-dev local-lambda-api
```

Alternatively, you can install the CLI globally by running the following command:

```bash
npm install -g local-lambda-api
```

## Usage help

```bash
Usage: local-lambda-api [filename(.js|.mjs|.cjs)] [options]

Options:
      --version       Show version number                              [boolean]
  -h, --help          Show help                                        [boolean]
  -p, --port          Port to run the API server on (default: 4000)     [number]
      --defaultEvent  Path to a JSON file containing a custom default event
                      object                                            [string]
      --b64           Set event.isBase64Encoded to true                [boolean]

Examples:
  local-lambda-api index.js  Run the local API server using index.js as the
                             Lambda API handler
```
