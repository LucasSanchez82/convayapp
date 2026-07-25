import { useState } from "react";
import { Child, ProcessingStatus } from "../types";

type RosterListProps = {
  roster: Child[];
  currentId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
};

const STATUS_BUTTON_CLASS: Record<ProcessingStatus, string> = {
  not_started: "bg-gray-300 hover:bg-gray-400",
  in_progress: "bg-blue-200 hover:bg-blue-300",
  done: "bg-yellow-200 hover:bg-yellow-300",
};

function RosterList({ roster, currentId, onSelect, onAdd, onRemove }: RosterListProps) {
  const [newChildName, setNewChildName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdd = () => {
    const name = newChildName.trim();
    if (!name) return;
    onAdd(name);
    setNewChildName("");
  };

  const handleRemove = (child: Child) => {
    if (window.confirm(`Retirer ${child.name} de la liste ? Ses informations seront perdues.`)) {
      onRemove(child.id);
    }
  };

  const filteredRoster = roster.filter(child =>
    child.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        className="bg-transparent border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-gray-400 max-w-xs"
        placeholder="Rechercher un enfant…"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-1 w-full">
        {filteredRoster.map(child => (
          <span key={child.id} className="inline-flex items-stretch">
            <button
              onClick={() => onSelect(child.id)}
              className={`border-b-black border p-2 hover:cursor-pointer ${STATUS_BUTTON_CLASS[child.processingStatus]} ${
                child.id === currentId ? "ring-2 ring-inset ring-black" : ""
              }`}
            >
              {child.name}
            </button>
            <button
              onClick={() => handleRemove(child)}
              aria-label={`Retirer ${child.name}`}
              className="bg-gray-300 border-b-black border border-l-0 px-2 text-gray-600 hover:text-red-700 hover:cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        {roster.length > 0 && filteredRoster.length === 0 && (
          <span className="text-gray-500 text-sm">Aucun résultat pour « {searchQuery} »</span>
        )}
        <span className="inline-flex items-center gap-1">
          <input
            className="bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-400 rounded px-1"
            placeholder="Nom de l'enfant"
            value={newChildName}
            onChange={e => setNewChildName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-gray-300 border p-2 hover:cursor-pointer"
          >
            Ajouter
          </button>
        </span>
      </div>
    </div>
  );
}

export default RosterList;
