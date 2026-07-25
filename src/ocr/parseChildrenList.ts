export type OcrWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

export type OcrRow = {
  name: string;
  phoneNumber: string;
};

// Matches French mobile/landline numbers written as "06 12 34 56 78",
// "06.12.34.56.78", "0612345678" or with a "+33" prefix.
const FR_PHONE_REGEX = /(?:\+33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/;

type Row = { words: OcrWord[]; avgY: number };

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function yCenter(word: OcrWord): number {
  return (word.bbox.y0 + word.bbox.y1) / 2;
}

// Groups words into text rows by clustering on vertical center, using the
// median word height (not a fixed pixel value) so this works regardless of
// the photo's resolution.
function clusterRows(words: OcrWord[]): { rows: Row[]; medianHeight: number } {
  const medianHeight = median(words.map(w => w.bbox.y1 - w.bbox.y0)) || 10;
  const threshold = medianHeight * 0.6;

  const sorted = [...words].sort((a, b) => yCenter(a) - yCenter(b));
  const rows: Row[] = [];
  for (const word of sorted) {
    const yc = yCenter(word);
    const last = rows[rows.length - 1];
    if (last && Math.abs(yc - last.avgY) <= threshold) {
      last.words.push(word);
      last.avgY = (last.avgY * (last.words.length - 1) + yc) / last.words.length;
    } else {
      rows.push({ words: [word], avgY: yc });
    }
  }
  for (const row of rows) {
    row.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
  }
  return { rows, medianHeight };
}

// Keeps only the first cluster of words reading left-to-right, cutting at the
// first gap wide enough to be a column boundary rather than normal
// word-to-word spacing (e.g. "BARUTEL Noha" | "Aventuriers des Pyrénées").
function firstColumnWords(words: OcrWord[], medianHeight: number): OcrWord[] {
  if (words.length === 0) return [];
  const gapThreshold = medianHeight * 2;
  const result = [words[0]];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].bbox.x0 - words[i - 1].bbox.x1;
    if (gap > gapThreshold) break;
    result.push(words[i]);
  }
  return result;
}

type PhoneMatch = { text: string; startX: number };

// Concatenates the row's words (tracking each word's character range) so the
// regex can span multiple OCR word tokens, then maps the match back to the
// word whose bounding box marks where the phone-number column starts.
function matchPhoneNumber(rowWords: OcrWord[]): PhoneMatch | null {
  let concatenated = "";
  const ranges: { start: number; end: number; word: OcrWord }[] = [];
  for (const word of rowWords) {
    if (concatenated.length > 0) concatenated += " ";
    const start = concatenated.length;
    concatenated += word.text;
    ranges.push({ start, end: concatenated.length, word });
  }

  const match = FR_PHONE_REGEX.exec(concatenated);
  if (!match) return null;

  const matchStart = match.index;
  const matchEnd = match.index + match[0].length;
  const matchedWords = ranges
    .filter(r => r.start < matchEnd && r.end > matchStart)
    .map(r => r.word);
  if (matchedWords.length === 0) return null;

  return {
    text: match[0],
    startX: Math.min(...matchedWords.map(w => w.bbox.x0)),
  };
}

/**
 * Extracts (name, phoneNumber) pairs from OCR word data for a printed table
 * where the name is the leftmost column and the phone number is anywhere
 * else on the same row. Every other column (group, gender, birthdate, notes)
 * is ignored implicitly: only words left of the phone-number match are kept.
 */
export function parseChildrenList(words: OcrWord[]): OcrRow[] {
  if (words.length === 0) return [];
  const { rows, medianHeight } = clusterRows(words);
  const continuationTolerance = medianHeight * 3;

  const results: OcrRow[] = [];
  let lastNameColumnX: number | null = null;

  for (const row of rows) {
    const match = matchPhoneNumber(row.words);

    if (match) {
      const wordsBeforePhone = row.words.filter(w => w.bbox.x1 <= match.startX);
      const nameWords = firstColumnWords(wordsBeforePhone, medianHeight);
      const name = nameWords
        .map(w => w.text)
        .join(" ")
        .trim();
      if (name) {
        results.push({ name, phoneNumber: match.text.trim() });
        lastNameColumnX = nameWords[0]?.bbox.x0 ?? null;
      }
      continue;
    }

    // No phone number on this row: if it's aligned with the name column of
    // the previous entry, treat it as a wrapped second line of that name
    // (e.g. a long surname spilling onto its own line).
    if (results.length > 0 && lastNameColumnX !== null) {
      const firstWordX0 = row.words[0]?.bbox.x0;
      if (
        firstWordX0 !== undefined &&
        Math.abs(firstWordX0 - lastNameColumnX) <= continuationTolerance
      ) {
        const continuation = row.words
          .map(w => w.text)
          .join(" ")
          .trim();
        if (continuation) {
          results[results.length - 1].name = `${results[results.length - 1].name} ${continuation}`.trim();
        }
      }
    }
  }

  return results;
}

export { FR_PHONE_REGEX };
