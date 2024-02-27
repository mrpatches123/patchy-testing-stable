import path from 'path';
import fs from 'fs';
const worlds = ['test'];
const vanillaDataPath = path.relative(process.cwd(), 'node_modules/@minecraft/vanilla-data/lib/');
const vanillaDataClonePath = path.relative(process.cwd(), 'src/libraries/vanilla-data/');