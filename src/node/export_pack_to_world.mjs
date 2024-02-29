import path from 'path';
import fs from 'fs';
/**
 * @returns {'behavior_packs' | 'resource_packs'}
 */
function getPackType() {
	const packsPath = path.resolve('../');
	const pathArray = packsPath.split(path.sep);
	return pathArray[pathArray.length - 1].replace('development_', '');
}
const packType = getPackType();
const packPath = process.cwd();
const worldsFolderPath = path.resolve('../../minecraftWorlds');
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
			console.log(staticSRCPath);
		});
	};
	copyRecursiveSyncInternal(src, srcFolderNameWithDest);
};
const devmanifest = JSON.parse(fs.readFileSync(path.join(packPath, 'manifest.json')).toString());
const packHeaderUUID = devmanifest.header.uuid;
const packNameHeader = devmanifest.header.name;
console.log(packHeaderUUID);


const excludes = ['.git', '.vscode', 'src', '.gitignore', 'tsconfig.json', 'package.json', 'package-lock.json', 'node_modules'].map(path => '\\' + path);
const worlds = ['test'];
const filesToRemove = ['world_behavior_pack_history.json', 'world_resource_pack_history.json'];
worlds.forEach(world => {
	let uuidHeader = crypto.randomUUID();
	let uuidScripts = crypto.randomUUID();
	let uuidData = crypto.randomUUID();
	let uuidResources = crypto.randomUUID();
	let headerVersion = [0, 0, 1];

	const worldPath = path.join(worldsFolderPath, world);
	console.log(worldPath, isFolder(worldPath));
	if (!isFolder(worldPath)) return;
	const dest = path.join(worldPath, packType);
	const pathArray = packPath.split(path.sep);
	const srcfolderName = pathArray[pathArray.length - 1];
	const srcFolderNameWithDest = path.join(dest, srcfolderName);
	if (isFolder(srcFolderNameWithDest)) {
		try {
			const manifest = JSON.parse(fs.readFileSync(path.join(srcFolderNameWithDest, 'manifest.json')).toString());
			const { uuid, version } = manifest.header;
			uuidHeader = uuid;
			headerVersion = version;
			headerVersion[2]++;
			manifest.modules.forEach((module) => {
				switch (module.type) {
					case 'data':
						uuidData = module.uuid;
						break;
					case 'scripts':
						uuidScripts = module.uuid;
						break;
					case 'resources':
						uuidResources = module.uuid;
						break;
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
	copyRecursiveSync(packPath, dest, (src, dest, dir, staticSRCPath, relitiveFromSRCPath) => {
		console.log(relitiveFromSRCPath);
		if (excludes.includes(relitiveFromSRCPath)) return true;
	}, true);
	const manifest = JSON.parse(fs.readFileSync(path.join(packPath, 'manifest.json')).toString());
	// console.warn(manifest);
	manifest.header.uuid = uuidHeader;
	manifest.header.version = headerVersion;
	manifest.header.name = `${packNameHeader} World`;
	manifest.description = `${headerVersion[0]}.${headerVersion[1]}.${headerVersion[2]}`;
	manifest.modules.forEach((module, i) => {
		switch (module.type) {
			case 'data':
				manifest.modules[i].uuid = uuidData;
				break;
			case 'scripts':
				manifest.modules[i].uuid = uuidScripts;
				break;
			case 'resources':
				manifest.modules[i].uuid = uuidResources;
				break;
		}
	});
	fs.writeFileSync(path.join(srcFolderNameWithDest, 'manifest.json'), JSON.stringify(manifest, null, 4));
	filesToRemove.forEach(file => {
		try { fs.rmSync(path.join(worldPath, file)); } catch { }
	});
	const worldPacksPath = `world_${packType}.json`;
	let worldPacks = [];
	try {
		worldPacks = JSON.parse(fs.readFileSync(path.join(worldPath, worldPacksPath)).toString());
	} catch { }
	worldPacks = worldPacks.filter(pack => pack.pack_id !== packHeaderUUID);
	if (!worldPacks.some(pack => pack.pack_id === uuidHeader)) worldPacks.push({ pack_id: uuidHeader, version: [0, 0, 0] });
	fs.writeFileSync(path.join(worldPath, worldPacksPath), JSON.stringify(worldPacks, null, 4));
});
