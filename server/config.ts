import * as log4js from "log4js";

export const config:any={
    SERVER_PORT:5560
}


//---------------- log ------------

log4js.configure({
    appenders: {
        out: { type: "stdout" },
        file: { type: "dateFile", filename: "logs/application.log",pattern: "yyyy-MM-dd" },
    },
    categories: {
        default: { appenders: ["out", "file"], level: "debug" },
    }
});

const logger = log4js.getLogger();
logger.level = "debug";
logger.debug("--------------------- SERVER STARTS --------------");

export {logger};