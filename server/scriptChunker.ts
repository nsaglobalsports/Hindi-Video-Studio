/** Split a complete script into narration-sized pieces without imposing a character cap.
 * Sentence boundaries are preferred; exceptionally long sentences are split at word boundaries.
 * The original words and their order are preserved.
 */
export function splitFullScriptIntoScenes(script: string, maxChars = 560): Array<{ visualPrompt: string; voiceScript: string; screenText: string }> {
  const normalized = script.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];
  // Split only after sentence punctuation followed by whitespace; decimals and version numbers stay intact.
  const sentenceParts = normalized.split(/(?<=[.!?।])\s+|\n+/u);
  const chunks: string[] = [];
  let current = '';
  const flush = () => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = '';
  };
  for (const rawPart of sentenceParts) {
    const part = rawPart.trim();
    if (!part) continue;
    if (part.length > maxChars) {
      flush();
      const words = part.split(/\s+/u);
      let wordChunk = '';
      for (const word of words) {
        if (wordChunk && (wordChunk + ' ' + word).length > maxChars) {
          chunks.push(wordChunk);
          wordChunk = word;
        } else {
          wordChunk = wordChunk ? wordChunk + ' ' + word : word;
        }
      }
      if (wordChunk) current = wordChunk;
      continue;
    }
    if (current && (current.length + 1 + part.length) > maxChars) flush();
    current = current ? current + ' ' + part : part;
  }
  flush();
  return chunks.map((text) => ({
    visualPrompt: text,
    voiceScript: text,
    // Full narration is also captioned; ASS word timing animates it in sync with speech.
    screenText: text,
  }));
}

