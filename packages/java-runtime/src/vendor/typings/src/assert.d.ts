import { JVMThread } from './threading';
/**
 * Checks the given assertion. Throws an error if it fails.
 */
export default function assert(assertion: boolean, msg?: string, thread?: JVMThread): void;
