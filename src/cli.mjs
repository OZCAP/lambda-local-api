#!/usr/bin/env node

import express from "express";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { validateArgs } from "./service.mjs";

const argv = yargs(hideBin(process.argv))
    .scriptName("local-lambda-api")
    .usage("Usage: $0 [filename(.js|.mjs|.cjs)] [options]")
    .example("$0 handler.js", "Run the local API server using handler.js as the Lambda API handler")
    .help("h")
    .alias("h", "help")
    .option("p", {
        alias: "port",
        describe: "Port to run the API server on",
        type: "number",
    })
    .option("defaultEvent", {
        describe: "Path to a JSON file containing a custom default event object",
        type: "string",
    })
    .boolean("b64")
    .describe("b64", "Set event.isBase64Encoded to true")
    .demandCommand(1, "You must provide a filename.").argv;

const { port, filename, defaultEvent, b64 } = validateArgs(argv);

const baseEvent = JSON.parse((await readFile(new URL(defaultEvent, import.meta.url))).toString());
const app = express();

app.use(express.json());

app.all("*", async (req, res) => {
    const queryIndex = req.originalUrl.indexOf("?");
    const rawQueryString = queryIndex >= 0 ? req.originalUrl.slice(queryIndex + 1) : "";

    const event = {
        ...baseEvent,
        httpMethod: req.method,
        path: req.path,
        headers: req.headers,
        queryStringParameters: req.query,
        body: req.body && (!b64 ? JSON.stringify(req.body) : req.body),
        isBase64Encoded: b64,
        rawQueryString: rawQueryString,
        cookies: req.cookies,
        reqestContext: {
            http: {
                method: req.method,
                path: req.path,
                protocol: req.protocol,
                sourceIp: req.ip,
                userAgent: req.get("User-Agent"),
            },
        },
    };

    const context = {
        callbackWaitsForEmptyEventLoop: true,
        functionName: "local",
        functionVersion: "1",
        invokedFunctionArn: "local",
        memoryLimitInMB: "128",
        awsRequestId: "local",
        logGroupName: "local",
        logStreamName: "local",
        getRemainingTimeInMillis: () => 1000,
        done: () => undefined,
        fail: () => undefined,
        succeed: () => undefined,
    };

    try {
        const { handler: lambdaHandler } = await import(`${process.cwd()}/${filename}`);
        const lambdaResponse = await lambdaHandler(event, context, () => undefined);
        const colorFn = (() => {
            switch (Math.floor(lambdaResponse.statusCode / 100)) {
                case 2:
                    return chalk.green;
                case 4:
                    return chalk.yellow;
                case 5:
                    return chalk.red;
                default:
                    return chalk.white;
            }
        })();
        console.log(colorFn(`${req.method} ${req.path} (${lambdaResponse.statusCode})`));
        res.status(lambdaResponse.statusCode).json(JSON.parse(lambdaResponse.body));
    } catch (error) {
        console.error("Error calling Lambda handler", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
