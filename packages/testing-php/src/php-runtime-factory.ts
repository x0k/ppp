import { WebPHP } from "@php-wasm/web";

import { version } from "./version";

export const phpRuntimeFactory = () => WebPHP.loadRuntime(version);
