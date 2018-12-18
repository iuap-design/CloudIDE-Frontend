module.exports = {
  "appenders": [
    {
      "type": "console"
    },
    {
      "type": "dateFile",
      "filename": "logs/uretail.log",
      "pattern": "-yyyy-MM-dd-hh",
      "category": "uretail"
    },
    {
      "type": "logLevelFilter",
      "level": "ERROR",
      "appender": {
        "type": "dateFile",
        "filename": "logs/errors.log",
        "pattern": "-yyyy-MM-dd"
      }
    }
  ]
}
