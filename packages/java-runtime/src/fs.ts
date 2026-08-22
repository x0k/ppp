import BrowserFS from 'browserfs';
import type ZipFS from 'browserfs/dist/node/backend/ZipFS';
import type { FSModule } from 'browserfs/dist/node/core/FS';

export { FSModule };

const path = BrowserFS.BFSRequire('path');
const fs = BrowserFS.BFSRequire('fs');
const { Buffer } = BrowserFS.BFSRequire('buffer');

function copyFile(srcFile: string, destFile: string) {
	fs.writeFileSync(destFile, fs.readFileSync(srcFile));
}

function recursiveCopy(srcFolder: string, destFolder: string) {
	function processDir(srcFolder: string, destFolder: string) {
		try {
			fs.mkdirSync(destFolder);
		} catch (err) {
			// Ignore EEXIST.
			if (err && typeof err === 'object' && 'code' in err && err.code !== 'EEXIST') {
				throw err;
			}
		}
		for (let item of fs.readdirSync(srcFolder)) {
			const srcItem = path.resolve(srcFolder, item),
				destItem = path.resolve(destFolder, item),
				stat = fs.statSync(srcItem);
			if (stat.isDirectory()) {
				processDir(srcItem, destItem);
			} else {
				copyFile(srcItem, destItem);
			}
		}
	}
	processDir(srcFolder, destFolder);
}

// Seeds an in-memory filesystem out of the doppio.zip artifact:
// `classes/` (doppio's own classes) and `vendor/` (JCL jars). The ZipFS
// mount is used only as a transient extraction source and is unmounted
// right after, so neither the zip buffer nor its index outlive init.
export async function initFs(libZipData: ArrayBuffer): Promise<FSModule> {
	const zipFs = await new Promise<ZipFS>((resolve, reject) =>
		BrowserFS.FileSystem.ZipFS.Create({ zipData: Buffer.from(libZipData) }, (e, created) =>
			e ? reject(e) : resolve(created!)
		)
	);
	const mfs = new BrowserFS.FileSystem.MountableFileSystem();
	mfs.mount('/tmp', new BrowserFS.FileSystem.InMemory());
	mfs.mount('/home', new BrowserFS.FileSystem.InMemory());
	mfs.mount('/sys', new BrowserFS.FileSystem.InMemory());
	mfs.mount('/zip', zipFs);
	BrowserFS.initialize(mfs);
	try {
		recursiveCopy('/zip/classes', '/sys/classes');
		recursiveCopy('/zip/vendor', '/sys/vendor');
	} finally {
		mfs.umount('/zip');
	}
	return fs;
}
