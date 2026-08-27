import { readFileSync } from 'fs';
const str = readFileSync('src/components/NeighborhoodMap.tsx', 'utf8');
const lines = str.split('\n');
console.log('Line 26:', JSON.stringify(lines[26]));
console.log('Line 27:', JSON.stringify(lines[27]));
