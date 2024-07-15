/**
 * A module for generic interfaces. Like enums.ts, we use this to avoid
 * unneeded dependencies between modules, which can induce circular
 * dependencies.
 */
/**
 * Standard JVM options.
 */
export interface JVMOptions {
    doppioHomePath: string;
    classpath?: string[];
    bootstrapClasspath?: string[];
    javaHomePath?: string;
    nativeClasspath?: string[];
    enableSystemAssertions?: boolean;
    enableAssertions?: boolean | string[];
    disableAssertions?: string[];
    properties?: {
        [name: string]: string;
    };
    tmpDir?: string;
    responsiveness?: number | (() => number);
    intMode?: boolean;
    dumpJITStats?: boolean;
}
/**
 * Partial typing for Websockify WebSockets.
 */
export interface IWebsock {
    rQlen(): number;
    rQshiftBytes(len: number): number[];
    on(eventName: string, cb: Function): void;
    open(uri: string): void;
    close(): void;
    send(data: number): void;
    send(data: number[]): void;
    get_raw_state(): number;
}
/**
 * Doppio-specific configuration options passed to this Java interface.
 */
export interface JVMCLIOptions extends JVMOptions {
    launcherName: string;
}
