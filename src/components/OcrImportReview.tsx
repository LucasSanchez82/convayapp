import { useState } from "react";
import type { OcrRow } from "../ocr/parseChildrenList";

type OcrImportReviewProps = {
  rows: OcrRow[];
  onConfirm: (rows: OcrRow[]) => void;
  onCancel: () => void;
};

const invisibleInputClass =
  "bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-400 rounded px-1";

function OcrImportReview({ rows: initialRows, onConfirm, onCancel }: OcrImportReviewProps) {
  const [rows, setRows] = useState(initialRows);

  const updateRow = (index: number, patch: Partial<OcrRow>) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="container m-auto mt-8 p-4">
      <h2 className="text-2xl mb-2">Relecture de l'import — vérifiez avant d'ajouter</h2>
      <p className="text-gray-600 mb-4">
        L'OCR peut se tromper : corrigez les noms/numéros ou retirez une ligne avant de valider.
      </p>
      <table className="border text-lg border-collapse text-left w-full">
        <tr className="bg-neutral-primary border-b border-default">
          <td className="px-4 py-2 border-r border-default font-bold">Nom</td>
          <td className="px-4 py-2 border-r border-default font-bold">Numéro de téléphone</td>
          <td className="px-4 py-2"></td>
        </tr>
        {rows.map((row, index) => (
          <tr key={index} className="bg-neutral-primary border-b border-default">
            <td className="px-4 py-2 border-r border-default">
              <input
                className={invisibleInputClass}
                value={row.name}
                onChange={e => updateRow(index, { name: e.target.value })}
              />
            </td>
            <td className="px-4 py-2 border-r border-default">
              <input
                className={invisibleInputClass}
                value={row.phoneNumber}
                onChange={e => updateRow(index, { phoneNumber: e.target.value })}
              />
            </td>
            <td className="px-4 py-2">
              <button
                onClick={() => removeRow(index)}
                aria-label={`Retirer ${row.name || "cette ligne"}`}
                className="text-gray-500 hover:text-red-700 hover:cursor-pointer"
              >
                ×
              </button>
            </td>
          </tr>
        ))}
      </table>
      {rows.length === 0 && <p className="text-gray-500 mt-4">Toutes les lignes ont été retirées.</p>}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onConfirm(rows)}
          disabled={rows.length === 0}
          className="bg-gray-300 border p-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmer l'ajout ({rows.length} enfant{rows.length > 1 ? "s" : ""})
        </button>
        <button onClick={onCancel} className="bg-gray-300 border p-2 hover:cursor-pointer">
          Annuler
        </button>
      </div>
    </main>
  );
}

export default OcrImportReview;
