export type ListField = "drugs" | "allergies" | "ilnesses";

export type ProcessingStatus = "not_started" | "in_progress" | "done";

export const PROCESSING_STATUS_LABELS: Record<ProcessingStatus, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  done: "Terminé",
};

export type Child = {
  id: string;
  name: string;
  phone: boolean;
  phoneNumber: string;
  phoneNumberCorrected: string;
  processingStatus: ProcessingStatus;
  pocketMoney: number;
  drugs: string[];
  allergies: string[];
  ilnesses: string[];
  notes: string;
};

export const LIST_FIELD_LABELS: Record<ListField, string> = {
  drugs: "Médicaments",
  allergies: "Allergies",
  ilnesses: "Maladies",
};

// TODO: remplacer par les vraies listes de référence
export const DEFAULT_OPTIONS: Record<ListField, string[]> = {
  drugs: ["Paracétamol", "Ibuprofène", "Amoxicilline", "Doliprane", "Aspirine", "Ventoline"],
  allergies: ["Arachides", "Pénicilline", "Pollen", "Lactose", "Gluten", "Latex"],
  ilnesses: ["Diabète", "Asthme", "Hypertension", "Épilepsie", "Migraine"],
};

export function makeEmptyChild(name: string): Child {
  return {
    id: crypto.randomUUID(),
    name,
    phone: false,
    phoneNumber: "",
    phoneNumberCorrected: "",
    processingStatus: "not_started",
    pocketMoney: 0,
    drugs: [],
    allergies: [],
    ilnesses: [],
    notes: "",
  };
}
