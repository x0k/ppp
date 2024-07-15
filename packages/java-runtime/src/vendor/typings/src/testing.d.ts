import { JVMOptions } from './interfaces';
export interface TestingError extends Error {
    originalError?: any;
    fatal?: boolean;
}
/**
 * Doppio testing options.
 */
export interface TestOptions extends JVMOptions {
    /**
     * Classes to test. Each can be in one of the following forms:
     * - foo.bar.Baz
     * - foo/bar/Baz
     */
    testClasses?: string[];
}
/**
 * Represents a single unit test, where we compare Doppio's output to the native
 * JVM.
 */
export declare class DoppioTest {
    /**
     * Test runner options.
     */
    private opts;
    /**
     * The class to test.
     */
    cls: string;
    /**
     * Path to the file recording the output from the native JVM.
     */
    private outFile;
    /**
     * The output capturer for this test.
     */
    private outputCapturer;
    constructor(opts: TestOptions, cls: string);
    /**
     * Constructs a new JVM for the test.
     */
    private constructJVM(cb);
    /**
     * Runs the unit test.
     */
    run(registerGlobalErrorTrap: (cb: (err: Error) => void) => void, cb: (err: Error, actual?: string, expected?: string, diff?: string) => void): void;
}
/**
 * Retrieve all of the unit tests.
 */
export declare function getTests(opts: TestOptions, cb: (tests: DoppioTest[]) => void): void;
/**
 * Returns a formatted diff between doppioOut and nativeOut.
 * Returns NULL if the strings are identical.
 */
export declare function diff(doppioOut: string, nativeOut: string): string;
/**
 * Run the specified tests.
 */
export declare function runTests(opts: TestOptions, quiet: boolean, continueAfterFailure: boolean, hideDiffs: boolean, registerGlobalErrorTrap: (cb: (err: Error) => void) => void, cb: (err?: TestingError) => void): void;
