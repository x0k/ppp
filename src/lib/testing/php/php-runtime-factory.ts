import { WebPHP } from '@php-wasm/web';

export const phpRuntimeFactory = () => WebPHP.loadRuntime('8.3')
