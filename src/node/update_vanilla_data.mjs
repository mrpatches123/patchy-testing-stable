import path from 'path';
import fs from 'fs';
const vanillaDataPath = path.relative(process.cwd(), 'node_modules/@minecraft/vanilla-data/lib/');
const vanillaDataClonePath = path.relative(process.cwd(), 'src/libraries/vanilla-data/');
fs.readdirSync(vanillaDataPath).forEach((file) => {
	if (!file.endsWith('.d.ts')) return;

	const filePath = path.join(vanillaDataPath, file);
	console.log(filePath);
	const fileData = fs.readFileSync(filePath).toString().replaceAll('declare', 'const');
	fs.writeFileSync(path.join(vanillaDataClonePath, file.replaceAll('.d', '')), fileData);
});