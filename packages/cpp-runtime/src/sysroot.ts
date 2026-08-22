// Sysroot handling, adapted from browsercc
// (https://github.com/BertalanD/browsercc, MIT).

import type { EmscriptenFS } from './emscripten';

export function* tarContents(
	contents: ArrayBuffer
): Generator<{ name: string; content: Uint8Array }> {
	const data = new Uint8Array(contents);
	let offset = 0;

	const textDecoder = new TextDecoder('utf-8');

	while (offset + 512 <= data.length) {
		const header = data.slice(offset, offset + 512);
		const name = textDecoder.decode(header.slice(0, 100)).replace(/\0.*$/, '');
		if (!name) break; // two empty blocks mean end of archive

		const sizeOctal = textDecoder.decode(header.slice(124, 136)).replace(/\0.*$/, '').trim();
		const size = parseInt(sizeOctal, 8) || 0;

		const contentStart = offset + 512;
		const contentEnd = contentStart + size;
		const content = data.slice(contentStart, contentEnd);

		yield { name, content };

		// advance to next file, rounding up to next 512 bytes
		const totalSize = 512 + Math.ceil(size / 512) * 512;
		offset += totalSize;
	}
}

export function setUpSysroot(fs: EmscriptenFS, tar: ArrayBuffer) {
	for (const { name, content } of tarContents(tar)) {
		if (name.endsWith('/')) continue;

		const dirName = name.split('/').slice(0, -1).join('/');
		fs.mkdirTree(dirName);
		fs.writeFile(name, content);
	}
}
