import { Child, LIST_FIELD_LABELS, ListField, PROCESSING_STATUS_LABELS, ProcessingStatus } from "../types";
import LabelMultiSelect from "./LabelMultiSelect";

const STATUS_OPTIONS: ProcessingStatus[] = ["not_started", "in_progress", "done"];

const STATUS_BUTTON_CLASS: Record<ProcessingStatus, string> = {
  not_started: "bg-gray-300 hover:bg-gray-400",
  in_progress: "bg-blue-200 hover:bg-blue-300",
  done: "bg-yellow-200 hover:bg-yellow-300",
};

type ChildDetailProps = {
  child: Child;
  optionsByField: Record<ListField, string[]>;
  onUpdate: (patch: Partial<Child>) => void;
  onCreateOption: (field: ListField, value: string) => void;
};

const invisibleInputClass =
  "bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-400 rounded px-1";

function ChildDetail({ child, optionsByField, onUpdate, onCreateOption }: ChildDetailProps) {
  const hasPhoneDiscrepancy =
    child.phoneNumberCorrected !== "" && child.phoneNumberCorrected !== child.phoneNumber;

  const listFields = Object.keys(LIST_FIELD_LABELS) as ListField[];

  const labelCellClass =
    "px-4 py-2 sm:px-6 sm:py-4 sm:border-r border-default block sm:table-cell font-semibold sm:font-normal text-sm sm:text-3xl";
  const valueCellClass = "px-4 pb-3 pt-0 sm:px-6 sm:py-2 block sm:table-cell text-base sm:text-3xl";
  const rowClass = "bg-neutral-primary border-b border-default block sm:table-row";

  return (
    <table className="container border border-collapse text-left rtl:text-right text-body m-auto mt-8 block sm:table w-full sm:w-auto">
      <tr className={rowClass}>
        <td className={labelCellClass}>Statut de traitement</td>
        <td className={valueCellClass}>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => onUpdate({ processingStatus: status })}
                className={`text-sm sm:text-base border p-1.5 hover:cursor-pointer ${STATUS_BUTTON_CLASS[status]} ${
                  child.processingStatus === status ? "ring-2 ring-inset ring-black" : ""
                }`}
              >
                {PROCESSING_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </td>
      </tr>
      <tr className={rowClass}>
        <td className={labelCellClass}>Téléphone</td>
        <td className={valueCellClass}>
          <input
            type="checkbox"
            className="w-6 h-6 hover:cursor-pointer"
            checked={child.phone}
            onChange={() => onUpdate({ phone: !child.phone })}
          />
        </td>
      </tr>
      <tr className={rowClass}>
        <td className={labelCellClass}>Numéro de téléphone</td>
        <td className={valueCellClass}>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              className={invisibleInputClass}
              placeholder="Numéro"
              value={child.phoneNumber}
              onChange={e => onUpdate({ phoneNumber: e.target.value })}
            />
            <span className="text-sm sm:text-base text-gray-500">Correction si erroné :</span>
            <input
              className={`${invisibleInputClass} ${hasPhoneDiscrepancy ? "ring-1 ring-red-400" : ""}`}
              placeholder="Numéro corrigé"
              value={child.phoneNumberCorrected}
              onChange={e => onUpdate({ phoneNumberCorrected: e.target.value })}
            />
            {hasPhoneDiscrepancy && (
              <span className="text-red-600 text-sm sm:text-base">⚠ différent du numéro saisi</span>
            )}
          </div>
        </td>
      </tr>
      {listFields.map(field => (
        <tr key={field} className={rowClass}>
          <td className={labelCellClass}>{LIST_FIELD_LABELS[field]}</td>
          <td className={valueCellClass}>
            <LabelMultiSelect
              options={optionsByField[field]}
              selected={child[field]}
              onChange={next => onUpdate({ [field]: next })}
              onCreateOption={value => onCreateOption(field, value)}
            />
          </td>
        </tr>
      ))}
      <tr className={rowClass}>
        <td className={labelCellClass}>Argent de poche</td>
        <td className={valueCellClass}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              className={invisibleInputClass}
              value={child.pocketMoney}
              onChange={e => onUpdate({ pocketMoney: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-sm sm:text-base text-gray-500">€</span>
          </div>
        </td>
      </tr>
      <tr className={rowClass}>
        <td className={labelCellClass}>Notes</td>
        <td className={valueCellClass}>
          <input
            className={`${invisibleInputClass} w-full`}
            value={child.notes}
            onChange={e => onUpdate({ notes: e.target.value })}
          />
        </td>
      </tr>
    </table>
  );
}

export default ChildDetail;
