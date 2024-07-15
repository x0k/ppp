import JVM from './jvm';
import { JVMCLIOptions } from './interfaces';
/**
 * Consumes a `java` command line string. Constructs a JVM, launches the command, and
 * returns the JVM object. Throws an exception if parsing fails.
 *
 * Returns `null` if no JVM needed to be constructed (e.g. -h flag).
 *
 * @param args Arguments to the 'java' command.
 * @param opts Default options.
 * @param doneCb Called when JVM execution finishes. Passes a
 *   number to the callback indicating the exit value.
 * @param [jvmStarted] Called with the JVM object once we have invoked it.
 */
export default function java(args: string[], opts: JVMCLIOptions, doneCb: (status: number) => void, jvmStarted?: (jvm: JVM) => void): void;
