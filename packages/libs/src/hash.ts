const textEncoder = new TextEncoder();
const HEX_STRINGS = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0"),
);

export async function hashString(str: string) {
  const bytes = textEncoder.encode(str);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  const hashArray = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < hashArray.length; i++) {
    hex += HEX_STRINGS[hashArray[i]];
  }
  return hex;
}
