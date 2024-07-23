export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
}

export class Logger {
  static log(trace: string, message: any) {
    console.log(
      `\x1b[36m${new Date().toISOString()} [${LogLevel.INFO}] ${trace}\n ${JSON.stringify(message)} \n`
    );
  }

  static error(trace: string, message: any) {
    console.error(
      `\x1b[31m${new Date().toISOString()} [${LogLevel.ERROR}] ${trace}\n ${JSON.stringify(message)} \n`
    );
  }

  static warn(trace: string, message: any) {
    console.warn(
      `\x1b[33m${new Date().toISOString()} [${LogLevel.WARN}] ${trace}\n ${JSON.stringify(message)} \n`
    );
  }

  static debug(trace: string, message: any) {
    console.debug(
      `\x1b[32m${new Date().toISOString()} [${LogLevel.DEBUG}] ${trace}\n ${JSON.stringify(message)} \n`
    );
  }
}
