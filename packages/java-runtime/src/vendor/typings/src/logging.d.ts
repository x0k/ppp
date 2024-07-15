export declare function debug_var(e: any): string;
export declare function debug_vars(arr: any[]): string[];
export declare enum LogLevel {
    VTRACE = 10,
    TRACE = 9,
    DEBUG = 5,
    ERROR = 1,
}
export declare let logLevel: LogLevel;
export declare function setLogLevel(level: LogLevel): void;
export declare function vtrace(...msgs: any[]): void;
export declare function trace(...msgs: any[]): void;
export declare function debug(...msgs: any[]): void;
export declare function error(...msgs: any[]): void;
