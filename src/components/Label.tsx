type LabelProps = {
  text: string;
  onRemove?: () => void;
};

function Label({ text, onRemove }: LabelProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-200 rounded-full px-3 py-1 text-base mr-1 mb-1">
      {text}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-500 hover:text-gray-800 hover:cursor-pointer leading-none"
          aria-label={`Retirer ${text}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Label;
