# AFRAP Compétences

Site éditorial responsive et statique. Astro + TypeScript + CSS, sans backend, base de données ni CMS. Source Sans 3, utilisée dans le support AFRAP, est hébergée localement via Fontsource. Aucun script applicatif n’est envoyé au navigateur.

Les huit programmes et les coordonnées proviennent du catalogue AFRAP de septembre 2026. Le logo et les visuels sont issus des références fournies, optimisés en WebP. Les présentations personnelles ont été retirées de toutes les pages et des données. Les trois articles restent des exemples clairement signalés.

## Installation et lancement

Node.js 24 LTS et npm sont requis.

```sh
npm install
npm run dev
```

Ouvrir l’adresse indiquée dans le terminal (habituellement `http://localhost:4321`). Sous Windows, si PowerShell bloque `npm.ps1`, utiliser `npm.cmd` à la place de `npm`.

```sh
npm run build
npm run verify
npm run preview
```

Le build vérifie les types et les fichiers Astro, puis produit le site dans `dist/`. La vérification contrôle les liens internes, assets, ancres, H1, métadonnées et emails de devis. Ne pas éditer `dist/`.

## Organisation

- `src/pages/` : accueil, présentation, catalogue, ressources, contact et 404.
- `src/components/` : composants communs et blocs éditoriaux.
- `src/layouts/Layout.astro` : structure HTML et SEO.
- `src/styles/global.css` : charte, espacements et adaptations mobile/tablette.
- `src/config/site.ts` : coordonnées, réservation, réseaux, valeurs et indicateurs qualité.
- `public/images/` : logo et visuels AFRAP optimisés.
- `src/content.config.ts` : schémas validant les Content Collections.
- `src/content/formations/` et `src/content/articles/` : contenus Markdown.

## Ajouter une formation

Dupliquer un fichier `.md` dans `src/content/formations/`. Modifier tous les champs du frontmatter et le texte sous le second `---`. Les valeurs entre guillemets et tableaux sont du YAML compatible JSON.

Le champ `slug` doit être unique, en minuscules sans accents et avec des tirets. Il détermine `/formations/mon-slug/`. La fiche et la carte du catalogue sont automatiquement créées. Le champ `order` suit l’ordre du catalogue ; les trois premières formations apparaissent à l’accueil. `sourcePages` indique la provenance du contenu, sans être affiché sur le site.

Les champs couvrent : titre, catégorie, description, durée, lieu, public, prérequis apprenant et techniques, format, capacité, objectifs, séquences, moyens, évaluation, accessibilité, tarif et accès. Les objectifs, méthodes et séquences sont des listes. Les programmes du catalogue sont renseignés avec `demo: false`. Pour un nouveau programme non validé, utiliser `demo: true` pour signaler la démonstration et empêcher l’indexation de la fiche.

Les champs `programUpdated` et `programVersion` sont actualisés automatiquement avant `npm run dev`, `npm run build` et `npm run preview`. Le script compare le contenu pédagogique de chaque fiche (en ignorant les visuels et les catégories) : à la première initialisation, il renseigne la date et la version `1.0`; après une modification du programme, il met la date à jour et incrémente la version mineure (par exemple `1.0` → `1.1`). Le champ technique `programHash` sert uniquement à détecter les changements.

Le bouton de devis encode automatiquement le titre et le corps du message. Il ouvre le logiciel de messagerie du visiteur, sans envoyer lui-même d’email.

## Ajouter un article

Dupliquer un `.md` dans `src/content/articles/`, renseigner `title`, `slug` unique, `date` (`AAAA-MM-JJ`), `description`, `category`, `readingTime`, `demo` et le corps Markdown. La page `/ressources/mon-slug/` est générée automatiquement. Les articles sont triés du plus récent au plus ancien.

Pour les liens de sources externes, conserver l’URL officielle et retirer les paramètres de tracking (par exemple `utm_source=chatgpt.com`, `gclid` ou `fbclid`).

Utiliser des titres `##` et `###` dans les contenus : le H1 est déjà généré par la page. Vérifier et sourcer tout contenu réglementaire avant publication. Les dates des exemples sont illustratives.

## Modifier les coordonnées et la charte

Tout est centralisé dans `src/config/site.ts` : `EMAIL`, `PHONE`, `BOOKING_URL`, `SITE_URL`, nom et réseaux sociaux. Les coordonnées du catalogue sont `contact@afrap.fr` et `06 36 38 86 82`. Les liens d’appel utilisent `tel:`.

`BOOKING_URL` reste vide jusqu’au choix d’un agenda en ligne. En attendant, « Prendre rendez-vous » ouvre un email prérempli demandant les disponibilités, conformément au fonctionnement décrit dans le catalogue. Renseigner la constante pour activer un agenda externe.

Renseigner les `value` de `qualityMetrics` et `qualityPeriod` uniquement avec des données réelles et leur période/méthode. `null` affiche « Données prochainement disponibles ».

La charte est définie en CSS custom properties au début de `global.css` : pétrole `#074550`, terracotta `#CB694C`, sauge `#8CAB98` et ivoire `#F4F1ED`, relevés dans le support. Un terracotta plus foncé est utilisé pour les textes afin de préserver leur contraste. Les photographies et les compositions organiques sont reprises des documents fournis.

Le dossier local `références/` est ignoré par Git et n’est pas exposé dans le site. Le catalogue PDF complet n’est pas proposé au téléchargement, car il contient les présentations personnelles à ne pas publier. Seuls les visuels sélectionnés sont copiés dans `public/`.

## Déployer sur GitHub Pages

1. Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Pousser les fichiers sur `main`. Le workflow `.github/workflows/deploy.yml` installe via `npm ci`, contrôle, construit, vérifie les liens et publie `dist/`.
3. L’URL de déploiement est indiquée dans le job `deploy`. Pour le dépôt actuel, l’adresse attendue est `https://elisacdc.github.io/ioko/`, sous réserve de l’activation de Pages.

`actions/configure-pages` fournit automatiquement l’origine et le sous-chemin : le même code fonctionne pour un dépôt projet (`/ioko/`), un dépôt utilisateur (`/`) ou un domaine personnalisé configuré dans Pages. Tous les liens internes et assets utilisent le helper `url()` qui respecte ce sous-chemin. L’origine alimente les URLs canoniques, Open Graph et sitemap. Aucun serveur Node n’est nécessaire en production.

Pour reproduire localement le build GitHub Pages sous PowerShell :

```powershell
$env:SITE_URL = 'https://elisacdc.github.io'
$env:BASE_PATH = '/ioko'
npm.cmd run build
npm.cmd run verify
npm.cmd run preview
```

Ouvrir alors `/ioko/`. Pour revenir au serveur local à la racine, supprimer ces variables dans le terminal (`Remove-Item Env:SITE_URL, Env:BASE_PATH`). Hors CI, `SITE_URL` utilise `https://www.afrap.fr`, l’adresse figurant dans le catalogue. Le domaine personnalisé doit être configuré dans GitHub Pages avant de l’utiliser en production ; sa présence dans le catalogue ne constitue pas une configuration DNS.

## À valider avant publication officielle

- Effectifs, lieux et conditions matérielles non précisés dans le catalogue, ainsi que le prérequis apprenant de la formation TMS.
- Éventuelle URL de réservation en ligne et tarifs, actuellement proposés sur devis.
- Formulations du partenariat E-Octopus et modalités de financement. AFRAP n’est jamais présentée comme certifiée Qualiopi.
- Contenus/dates des articles et retrait des mentions de démonstration après validation.
- Informations juridiques réelles et mentions légales à fournir : elles n’ont pas été inventées.
- Réglage Pages dans GitHub. Le workflow préparé ne vaut pas déploiement déjà réalisé.

Référence technique : [déploiement Astro sur GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
