// Coordonnées issues du catalogue AFRAP de septembre 2026.
export const EMAIL = "contact@afrap.fr";
export const PHONE = "06 36 38 86 82";
export const BOOKING_URL = "https://calendly.com/afrap-competences";
export const LINKEDIN_URL = "https://www.linkedin.com/company/afrap-competences";
export const NEWSLETTER_URL = "https://09e7a59f.sibforms.com/serve/MUIFAMRRGv76fmNC97IKVkOc2LuefcBHNxBKnGDyDmbl616jVfvAECY_tSqouZHjuseGpBwajg0_EzksaZuhxagj2llOvcmLFoKc8DkoeQa6tkxSUkUFHvidThA7Bx9niDLi1CxpzkTMbkFo_VewjMNd7PxZTWcDEnszwBBJeUqONgjOSt87Qs5KykpSNQjz5ZhdDpxy82PZ2MY3iA==";
export const SITE_URL = "https://www.afrap.fr";
export const site = {
  name: "AFRAP Compétences",
  fullName:
    "Agence de Formation, de Ressources et d’Accompagnement des Professionnels",
  email: EMAIL,
  phone: PHONE,
  bookingUrl: BOOKING_URL,
  url: SITE_URL,
  socialLinks: [] as { label: string; url: string }[],
};
export const qualityMetrics: { label: string; value: string | null }[] = [
  { label: "Satisfaction des participants", value: null },
  { label: "Participants formés", value: null },
  { label: "Taux de recommandation", value: null },
  { label: "Taux d’abandon", value: null },
  { label: "Retour aux questionnaires", value: null },
];
export const qualityPeriod = "";
export const values = [
  {
    title: "Bienveillance",
    text: "Placer la personne, ses besoins et son expérience au cœur de chaque échange.",
  },
  {
    title: "Professionnalisme",
    text: "Renforcer des pratiques éclairées, respectueuses et sécurisantes.",
  },
  {
    title: "Expertise terrain",
    text: "Travailler à partir des situations réellement rencontrées au domicile.",
  },
  {
    title: "Transmission",
    text: "Partager des repères et des outils utiles dès le retour sur le terrain.",
  },
];
