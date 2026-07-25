import * as Tesseract from "tesseract.js";
import { parseChildrenList, type OcrRow, type OcrWord } from "./parseChildrenList";

const { createWorker, PSM } = Tesseract;

function flattenWords(page: Tesseract.Page): OcrWord[] {
  const words: OcrWord[] = [];
  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs) {
      for (const line of paragraph.lines) {
        for (const word of line.words) {
          words.push({ text: word.text, bbox: word.bbox });
        }
      }
    }
  }
  return words;
}

// Runs fully offline: langPath/workerPath/corePath point at files bundled
// under public/tessdata and public/tesseract (see README/plan), no CDN calls.
export async function extractChildrenFromImage(image: Blob): Promise<OcrRow[]> {
  const worker = await createWorker("fra", 1, {
    langPath: "/tessdata",
    gzip: true,
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract/tesseract-core-lstm.wasm.js",
  });

  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
    const { data } = await worker.recognize(image, {}, { blocks: true });
    const words = flattenWords(data);
    return parseChildrenList(words);
  } finally {
    await worker.terminate();
  }
}
