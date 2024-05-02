import path from 'path';
import fs from 'fs';

const vanillaDataPath = path.resolve('./node_modules/@minecraft/vanilla-data/lib/');
const vanillaDataClonePath = path.resolve('./src/patchy-stable-api/libraries/vanilla-data/');
console.warn(vanillaDataPath, vanillaDataClonePath);
const imports = [];
fs.readdirSync(vanillaDataPath).forEach((file) => {
	if (!file.endsWith('.d.ts')) return;
	imports.push(`export * from './${file.replaceAll('.d.ts', '.js')}';`);
	const filePath = path.join(vanillaDataPath, file);
	console.log(filePath);
	const fileData = fs.readFileSync(filePath).toString().replaceAll('declare', 'const');
	fs.writeFileSync(path.join(vanillaDataClonePath, file.replaceAll('.d', '')), fileData);
});
fs.writeFileSync(path.join(vanillaDataClonePath, 'index.ts'), imports.join('\n'));
