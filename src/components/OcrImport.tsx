import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { extractChildrenFromImage } from "../ocr/runOcr";
import type { OcrRow } from "../ocr/parseChildrenList";

type OcrImportProps = {
  onExtracted: (rows: OcrRow[]) => void;
};

function guessMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function OcrImport({ onExtracted }: OcrImportProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    try {
      const path = await open({
        multiple: false,
        filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp"] }],
      });
      if (!path) return;

      setIsRunning(true);
      const bytes = await readFile(path);
      const blob = new Blob([bytes], { type: guessMimeType(path) });
      const rows = await extractChildrenFromImage(blob);
      if (rows.length === 0) {
        setError("Aucun nom/numéro n'a pu être détecté sur cette image.");
        return;
      }
      onExtracted(rows);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleImport}
        disabled={isRunning}
        className="bg-gray-300 border p-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? "Analyse en cours…" : "Importer depuis une photo"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}

export default OcrImport;
