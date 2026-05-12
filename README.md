# Cubage Bois Terrain — PWA

Application PWA installable sur iPhone, utilisable hors ligne, avec stockage local et export CSV/PDF.

## Règle métier intégrée

- Bille de pied qualité supérieure : cubée séparément avec Adrian I.
- Reste de grume sciable : cubé avec Adrian II.
- Total bois d’œuvre arbre = qualité supérieure + sciage courant.
- Tête/houppier : calculée uniquement en synthèse finale, par essence : total bois d’œuvre × 1,5.

## Publication GitHub Pages

1. Créez un dépôt GitHub, par exemple `cubage-bois-terrain`.
2. Déposez tous les fichiers du dossier dans le dépôt : `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, `icons/`.
3. Dans GitHub : Settings > Pages.
4. Dans “Build and deployment”, choisissez : Deploy from a branch.
5. Branche : `main` ; dossier : `/root`.
6. Cliquez sur Save.
7. L’application sera disponible à l’adresse GitHub Pages indiquée.

## Installation iPhone

1. Ouvrez l’adresse GitHub Pages avec Safari.
2. Appuyez sur le bouton Partager.
3. Choisissez “Sur l’écran d’accueil”.
4. L’application se lance ensuite comme une application classique.

## Remarque importante

La formule Adrian I est ici paramétrée comme un cylindre simple. Si vous avez la formule exacte que vous utilisez pour Adrian I, remplacez la fonction `adrianI()` dans `app.js`.
