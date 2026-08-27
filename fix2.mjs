import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/components/NeighborhoodMap.tsx', 'utf8');

// Each mojibake sequence is valid UTF-8 text that should be the emoji.
// We do direct text replacement.
const fixes = [
  // Multi-char combos first (most specific)
  ['\u00f0\u009f\u008d\u0094\u00f0\u009f\u0090\u009d', '🍔🐝'],  // ðŸ"ðŸ
  ['\u00f0\u009f\u008d\u009f\u00f0\u009f\u008d\u0094', '🍟🍔'],  // ðŸŸðŸ"
  ['\u00f0\u009f\u00a5\u00a2\u00f0\u009f\u00a5\u009f', '🥢🥟'],
  ['\u00f0\u009f\u009b\u008d\u00ef\u00b8\u008f\u00f0\u009f\u008f\u00a2', '🛍️🏢'],
  ['\u00f0\u009f\u009b\u0092\u00f0\u009f\u0090\u009f', '🛒🐟'],
  ['\u00f0\u009f\u009f\u00a1\u00f0\u009f\u009b\u0092', '🟡🛒'],
  ['\u00f0\u009f\u009b\u008d\u00ef\u00b8\u008f\u00f0\u009f\u008f\u00ac', '🛍️🏬'],
  ['\u00f0\u009f\u0097\u00ba\u00ef\u00b8\u008f', '🗺️'],
  ['\u00f0\u009f\u009b\u00b0\u00ef\u00b8\u008f', '🛰️'],
  ['\u00f0\u009f\u0091\u0081\u00ef\u00b8\u008f', '👁️'],
  ['\u00f0\u009f\u0097\u0091\u00ef\u00b8\u008f', '🗑️'],
  ['\u00e2\u009a\u00a0\u00ef\u00b8\u008f', '⚠️'],
  ['\u00e2\u00ac\u0086\u00ef\u00b8\u008f', '⬆️'],
  ['\u00e2\u00ac\u0087\u00ef\u00b8\u008f', '⬇️'],
  ['\u00f0\u009f\u009b\u008d\u00ef\u00b8\u008f', '🏛️'],
  // Single emojis
  ['\u00f0\u009f\u008e\u0093', '🎓'],
  ['\u00f0\u009f\u008c\u00b3', '🌳'],
  ['\u00f0\u009f\u008c\u008a', '🌊'],
  ['\u00f0\u009f\u008f\u00ab', '🏫'],
  ['\u00e2\u009b\u00aa', '⛪'],
  ['\u00f0\u009f\u008f\u00b0', '🏰'],
  ['\u00f0\u009f\u008f\u00a2', '🏢'],
  ['\u00f0\u009f\u009a\u008c', '🚌'],
  ['\u00f0\u009f\u008d\u0094', '🍔'],
  ['\u00f0\u009f\u0090\u009d', '🐝'],
  ['\u00f0\u009f\u009f\u00a1', '🟡'],
  ['\u00f0\u009f\u008d\u009f', '🍟'],
  ['\u00f0\u009f\u00a5\u00a2', '🥢'],
  ['\u00f0\u009f\u00a5\u009f', '🥟'],
  ['\u00f0\u009f\u009b\u0092', '🛒'],
  ['\u00f0\u009f\u008f\u00ac', '🏬'],
  ['\u00f0\u009f\u008f\u00a0', '🏠'],
  ['\u00f0\u009f\u009a\u0080', '🚀'],
  ['\u00f0\u009f\u009a\u0090', '🚐'],
  ['\u00f0\u009f\u0094\u008d', '📍'],
  ['\u00e2\u0082\u00b1', '₱'],
  ['\u00e2\u0086\u0097', '↗'],
  ['\u00e2\u009c\u0095', '✕'],
  ['\u00e2\u009c\u0093', '✓'],
  ['\u00f0\u009f\u0099\u0088', '🙈'],
  ['\u00f0\u009f\u0092\u00be', '💾'],
  ['\u00f0\u009f\u0094\u0084', '🔄'],
  ['\u00e2\u009e\u0095', '➕'],
  ['\u00f0\u009f\u008f\u00a5', '🏥'],
  ['\u00f0\u009f\u0094\u008b', '📋'],
  ['\u00f0\u009f\u0094\u009c', '📜'],
  ['\u00f0\u009f\u0094\u0085', '📅'],
  ['\u00f0\u009f\u0094\u008d', '🔍'],
  ['\u00e2\u0086\u0092', '→'],
  ['\u00c2\u00b0', '°'],
  ['\u00f0\u009f\u009a\x8c', '🚌'],  // alternate bus
  ['Pe\u00c3\u00b1afrancia', 'Peñafrancia'],
  ['Ta\u00c3\u00b1ada', 'Tañada'],
  ['\u00e2\u0080\u0094', '—'],
  ['\u00e2\u0080\u0099', "'"],
  ['\u00c3\u00b1', 'ñ'],
  ['\u00c2\u00b0', '°'],
  // Map icon
  ['\u00f0\u009f\u0097\u00ba', '🗺'],
];

let count = 0;
for (const [from, to] of fixes) {
  const before = content;
  content = content.split(from).join(to);
  if (content !== before) count++;
}

writeFileSync('src/components/NeighborhoodMap.tsx', content, 'utf8');
console.log(`Done. Applied ${count} replacements.`);

// Verify line 27
const lines = content.split('\n');
console.log('Line 27:', lines[26]);
