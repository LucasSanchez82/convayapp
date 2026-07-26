import { Child } from "./types";

function phoneDisplay(child: Child): string {
  const { phoneNumber, phoneNumberCorrected } = child;
  if (phoneNumberCorrected && phoneNumberCorrected !== phoneNumber) {
    return `${phoneNumber || "—"} -> ${phoneNumberCorrected}`;
  }
  return phoneNumber || "—";
}

function listOrDash(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "—";
}

export function buildRecapText(roster: Child[]): string {
  const lines: string[] = ["Récapitulatif des enfants", ""];

  roster.forEach((child, index) => {
    if (index > 0) lines.push("");
    lines.push(`Nom : ${child.name}`);
    lines.push(`Téléphone : ${child.phone ? "Oui" : "Non"}`);
    lines.push(`Numéro : ${phoneDisplay(child)}`);
    lines.push(`Argent de poche : ${child.pocketMoney} €`);
    lines.push(`Médicaments : ${listOrDash(child.drugs)}`);
    lines.push(`Allergies : ${listOrDash(child.allergies)}`);
    lines.push(`Maladies : ${listOrDash(child.ilnesses)}`);
    if (child.notes) lines.push(`Notes : ${child.notes}`);
  });

  return lines.join("\n");
}
