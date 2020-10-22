const { createLogger, format, transports } = require("winston");
const { combine, colorize, label, timestamp, printf } = format;
const path = require("path");
const dayjs = require('dayjs')


const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: "执行情况" }), timestamp(), myFormat),
  transports: [
    // new transports.Console(),
    new transports.File({
      filename: path.resolve(__dirname, "../logs/info.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.resolve(__dirname, "../logs/error.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
