import { EMAIL } from "../config/site";
export function url(path = "") {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
export function mailto(subject: string, body: string) {
  const bodyParameter = body ? `&body=${encodeURIComponent(body)}` : "";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${bodyParameter}`;
}
export function quoteMail() {
  return mailto(
    "Demande de devis",
    "Bonjour,\n\nJe vous écris pour une demande de devis. Seriez-vous disponible pour échanger ?\n\nMerci,",
  );
}
export function formationQuoteMail(title: string) {
  return mailto(
    `Demande de devis formation ${title}`,
    `Bonjour,\n\nJe vous contacte concernant la formation ${title}. Serait-il possible d’échanger sur les besoins de ma structure afin d’établir un devis ?\n\nMerci,`,
  );
}
