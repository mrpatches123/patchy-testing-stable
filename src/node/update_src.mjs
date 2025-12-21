import path from 'path';
import fs from 'fs';
function isFolder(path) {
	// console.log(path);
	try {
		return fs.lstatSync(path).isDirectory();
	} catch {
	}
}
/**
 * @param {string} src
 * @param {string} dest
 * @param {(src: string, dest: string, dir: string, staticSRCPath: string, relitiveFromSRCPath: string) => boolean} excludeCallback
 */
function copyRecursiveSync(src, dest, excludeCallback, deleteDest = false) {
	const pathArray = src.split(path.sep);
	const srcfolderName = pathArray[pathArray.length - 1];
	const srcFolderNameWithDest = path.join(dest, srcfolderName);
	if (deleteDest) {
		if (isFolder(srcFolderNameWithDest)) fs.rmSync(srcFolderNameWithDest, { recursive: true, force: true });
		fs.mkdirSync(srcFolderNameWithDest);
	}
	function copyRecursiveSyncInternal(srcInternal, destInternal) {
		fs.readdirSync(srcInternal).forEach(dir => {
			const staticSRCPath = path.join(srcInternal, dir);
			const staticDestPath = path.join(destInternal, dir);
			const relitiveFromSRCPath = staticSRCPath.replace(src, '');
			if (excludeCallback?.(src, dest, dir, staticSRCPath, relitiveFromSRCPath)) return;
			if (isFolder(staticSRCPath)) {
				try {
					fs.mkdirSync(staticDestPath);
				} catch { }
				copyRecursiveSyncInternal(staticSRCPath, staticDestPath);
			} else {
				const fileContents = fs.readFileSync(staticSRCPath);
				fs.writeFileSync(staticDestPath, fileContents);
			}
			// console.log(staticSRCPath);
		});
	};
	copyRecursiveSyncInternal(src, srcFolderNameWithDest);
};
const stable_lib_path = path.resolve('../patchy-testing-stable/src/patchy-stable-api/');
const stable_lib_dest = path.resolve('./src/');
copyRecursiveSync(stable_lib_path, stable_lib_dest, null, true);