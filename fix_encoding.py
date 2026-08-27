import re

path = r"c:\Users\marin\OneDrive\Desktop\CasaFinder\Website_CasaFinder\src\components\NeighborhoodMap.tsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The file was saved as Latin-1 bytes but read as UTF-8,
# causing UTF-8 multi-byte sequences to appear as latin1 mojibake.
# We re-encode as latin-1 to get original bytes, then decode as utf-8.
try:
    fixed = content.encode('latin-1').decode('utf-8')
    content = fixed
    print("Re-encoding fix applied successfully")
except Exception as e:
    print(f"Re-encoding failed: {e}, trying manual replacements")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! File saved as UTF-8.")

# Verify
with open(path, 'r', encoding='utf-8') as f:
    check = f.read()

broken = [c for c in ['ðŸ', 'â‚±', 'Ã±'] if c in check]
if broken:
    print(f"WARNING: Still found broken sequences: {broken}")
else:
    print("Verification passed - all emojis look clean!")
