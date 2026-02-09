import { cache, createCachedFetch as createFetch } from 'libs/fetch';
import { hashString } from 'libs/hash';

type CachePrefix =
	| 'dotnet-cache@'
	| 'gleam-cache@'
	| 'go-cache@'
	| 'java-cache@'
	| 'php-cache@'
	| 'python-cache@'
	| 'ruby-cache@'
	| 'rust-cache@';

export async function createCachedFetch(prefix: CachePrefix, key: string) {
	return createFetch(await cache(prefix, await hashString(key)));
}
