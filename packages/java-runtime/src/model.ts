import type { Context } from 'libs/context';

import type { JVM } from './jvm';

export type JVMFactory = (ctx: Context) => Promise<[JVM, Disposable]>;
