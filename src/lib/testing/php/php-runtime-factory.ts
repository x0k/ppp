import { WebPHP } from "@php-wasm/web";

import { version } from "./model";

export const phpRuntimeFactory = () => WebPHP.loadRuntime(version);
