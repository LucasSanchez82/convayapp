import { useEffect, useRef, useState } from "react";
import Label from "./Label";

type LabelMultiSelectProps = {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  onCreateOption?: (value: string) => void;
};

function LabelMultiSelect({ options, selected, onChange, onCreateOption }: LabelMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedQuery = query.trim();

  const availableOptions = options.filter(
    option => !selected.includes(option) && option.toLowerCase().includes(query.toLowerCase())
  );

  const isNewValue =
    trimmedQuery.length > 0 &&
    !selected.some(item => item.toLowerCase() === trimmedQuery.toLowerCase()) &&
    !options.some(option => option.toLowerCase() === trimmedQuery.toLowerCase());

  const addOption = (option: string, isNew: boolean) => {
    onChange([...selected, option]);
    if (isNew) onCreateOption?.(option);
    setQuery("");
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (availableOptions.length === 1) {
      addOption(availableOptions[0], false);
    } else if (isNewValue) {
      addOption(trimmedQuery, true);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-wrap items-center">
        {selected.map(item => (
          <Label key={item} text={item} onRemove={() => removeOption(item)} />
        ))}
        <input
          className="bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-400 rounded px-1 w-32 text-lg"
          placeholder="+ ajouter"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && (availableOptions.length > 0 || isNewValue) && (
        <ul className="absolute z-10 mt-1 max-h-48 w-56 max-w-[90vw] overflow-auto rounded border border-default bg-white text-lg shadow">
          {availableOptions.map(option => (
            <li key={option}>
              <button
                type="button"
                className="w-full text-left px-3 py-1 hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => addOption(option, false)}
              >
                {option}
              </button>
            </li>
          ))}
          {isNewValue && (
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-1 text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => addOption(trimmedQuery, true)}
              >
                + Ajouter « {trimmedQuery} »
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default LabelMultiSelect;
