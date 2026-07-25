import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Label from "./components/Label";
import ChildDetail from "./components/ChildDetail";
import RosterList from "./components/RosterList";
import OcrImport from "./components/OcrImport";
import OcrImportReview from "./components/OcrImportReview";
import { useChildren } from "./hooks/useChildren";
import { Child, DEFAULT_OPTIONS, LIST_FIELD_LABELS, ListField } from "./types";
import type { OcrRow } from "./ocr/parseChildrenList";

function App() {
  const { children, isLoaded, addChild, removeChild, updateChild, bulkAddChildren } = useChildren();
  const [currentId, setCurrentId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [optionsByField, setOptionsByField] = useState<Record<ListField, string[]>>(DEFAULT_OPTIONS);
  const [view, setView] = useState<"roster" | "ocrReview">("roster");
  const [pendingOcrRows, setPendingOcrRows] = useState<OcrRow[]>([]);

  const roster = Array.from(children.values());
  const currentChild = children.get(currentId);

  const handleUpdateCurrent = (patch: Partial<Child>) => {
    if (!currentId) return;
    updateChild(currentId, patch);
  };

  const handleAddChild = (name: string) => {
    const child = addChild(name);
    setCurrentId(child.id);
  };

  const handleRemoveChild = (id: string) => {
    removeChild(id);
    if (id === currentId) setCurrentId("");
  };

  const addOptionToList = (field: ListField, value: string) => {
    setOptionsByField(prev =>
      prev[field].some(option => option.toLowerCase() === value.toLowerCase())
        ? prev
        : { ...prev, [field]: [...prev[field], value] }
    );
  };

  const removeOptionFromList = (field: ListField, value: string) => {
    setOptionsByField(prev => ({ ...prev, [field]: prev[field].filter(option => option !== value) }));
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const generateRecapPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      const payload = roster.map(({ id, processingStatus, ...rest }) => rest);
      const bytes = await invoke<number[]>("generate_children_recap_pdf", { children: payload });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "recapitulatif-enfants.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(String(err));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOcrExtracted = (rows: OcrRow[]) => {
    setPendingOcrRows(rows);
    setView("ocrReview");
  };

  const handleConfirmOcrImport = (rows: OcrRow[]) => {
    bulkAddChildren(rows);
    setPendingOcrRows([]);
    setView("roster");
  };

  const handleCancelOcrImport = () => {
    setPendingOcrRows([]);
    setView("roster");
  };

  if (view === "ocrReview") {
    return (
      <OcrImportReview
        rows={pendingOcrRows}
        onConfirm={handleConfirmOcrImport}
        onCancel={handleCancelOcrImport}
      />
    );
  }

  return (
    <main>
      <div className="flex items-center justify-between w-full px-4">
        <span>{currentChild && `name: ${currentChild.name}`}</span>
        <div className="flex items-center gap-2">
          {pdfError && <span className="text-red-600 text-sm">{pdfError}</span>}
          <button
            onClick={generateRecapPdf}
            disabled={isGeneratingPdf}
            className="bg-gray-300 border p-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? "Génération…" : "Générer le PDF récapitulatif"}
          </button>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="bg-gray-300 border p-2 hover:cursor-pointer"
          >
            {showSettings ? "Fermer les paramètres" : "Paramètres"}
          </button>
        </div>
      </div>
      {showSettings && (
        <div className="container m-auto mt-4 border border-default p-4 bg-neutral-primary">
          <h2 className="text-2xl mb-4">Listes de suggestions — retirer un élément ajouté par erreur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(LIST_FIELD_LABELS) as ListField[]).map(field => (
              <div key={field}>
                <h3 className="text-xl mb-2">{LIST_FIELD_LABELS[field]}</h3>
                <div className="flex flex-wrap">
                  {optionsByField[field].map(option => (
                    <Label key={option} text={option} onRemove={() => removeOptionFromList(field, option)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between w-full gap-2 px-4 mt-2">
        <RosterList
          roster={roster}
          currentId={currentId}
          onSelect={setCurrentId}
          onAdd={handleAddChild}
          onRemove={handleRemoveChild}
        />
        <OcrImport onExtracted={handleOcrExtracted} />
      </div>

      {!isLoaded && <p className="text-gray-500 text-center mt-8">Chargement…</p>}
      {isLoaded && roster.length === 0 && (
        <p className="text-gray-500 text-center mt-8">Aucun enfant pour l'instant — ajoutez-en un ci-dessus.</p>
      )}

      {currentChild && (
        <ChildDetail
          child={currentChild}
          optionsByField={optionsByField}
          onUpdate={handleUpdateCurrent}
          onCreateOption={addOptionToList}
        />
      )}
    </main>
  );
}

export default App;
