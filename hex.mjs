import { readFileSync } from 'fs';
const str = readFileSync('src/components/NeighborhoodMap.tsx', 'utf8');
const lines = str.split('\n');
const line = lines[26];
// Get hex codepoints of first 20 chars
const chars = [...line].slice(0, 20);
chars.forEach((c, i) => {
  console.log(i, c.codePointAt(0).toString(16).padStart(4,'0'), JSON.stringify(c));
});
