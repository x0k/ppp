/// <reference types="node" />
import { Method } from './methods';
export interface JitInfo {
    pops: number;
    pushes: number;
    hasBranch: boolean;
    emit: (pops: string[], pushes: string[], suffix: string, onSuccess: string, code: Buffer, pc: number, onErrorPushes: string[], method: Method) => string;
}
export declare const opJitInfo: JitInfo[];
