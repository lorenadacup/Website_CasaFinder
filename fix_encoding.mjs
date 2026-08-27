import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/NeighborhoodMap.tsx';

// Read raw bytes
const rawBytes = readFileSync(path);

// The file was written as latin-1 bytes but contains UTF-8 encoded content
// Try to decode as UTF-8 first to check if already fixed
const asUtf8 = rawBytes.toString('utf8');

// Check if it's already mojibaked (contains the tell-tale sequences)
if (asUtf8.includes('\u00f0\u009f') || asUtf8.includes('\u00c3\u00b1')) {
  // File contains mojibake - re-interpret bytes as latin-1 then decode as utf-8
  const asLatin1 = rawBytes.toString('latin1');
  const reencoded = Buffer.from(asLatin1, 'latin1');
  
  try {
    const fixed = reencoded.toString('utf8');
    writeFileSync(path, fixed, 'utf8');
    console.log('SUCCESS: Re-encoding fix applied. File saved as UTF-8.');
    
    // Verify
    const verify = readFileSync(path, 'utf8');
    if (verify.includes('\u00f0\u009f') || verify.includes('ðŸ')) {
      console.log('WARNING: Some broken sequences may remain');
    } else {
      console.log('VERIFIED: File looks clean!');
    }
  } catch (e) {
    console.error('Re-encoding failed:', e.message);
  }
} else {
  console.log('File appears to already be valid UTF-8, no fix needed.');
}
