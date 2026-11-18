# Code secret en couleurs

Jeu solo inspiré du Mastermind, réalisé avec l’aide de Codex pour l’atelier de technologie émergente. Version logicielle 1.0.0, API commune 0.2. Le projet est indépendant du morpion et se trouve dans `code-secret/`.

- [Dépôt GitHub](https://github.com/Lea26541256/Projet-HEG/tree/main/code-secret)
- [Jouer](https://lea26541256.github.io/Projet-HEG/code-secret/)
- [Mode de test enseignant](https://lea26541256.github.io/Projet-HEG/code-secret/?test=1)

## Jouer et reprendre le projet

Choisir une couleur dans chacune des quatre listes, de gauche à droite, puis appuyer sur « Vérifier ma proposition ». Les choix restent modifiables avant validation. « Effacer » vide la proposition ; « Nouvelle partie » réinitialise tout. Tabulation, flèches des listes et Entrée permettent de jouer au clavier. Les noms restent lisibles sous les pions de l’historique.

Le site n’a besoin d’aucun compte, serveur applicatif, service d’IA, clé ou bibliothèque externe. Ouvrir `index.html` suffit pour jouer localement. Avec Node.js 18 ou supérieur, `npm start` ouvre un serveur à l’adresse `http://127.0.0.1:4173/` ; aucune installation n’est nécessaire pour le jeu et les tests du moteur.

## Règles et sources

Références fournies par le cours : « Projet — Code secret en couleurs, inspiré du Mastermind », édition 2.2 du 3 novembre 2026, annexe **code-couleurs-1.0** ; « API commune de test — Code secret en couleurs », contrat **0.2**, édition Google 1.5 du 28 octobre 2026 ; « Évaluation du projet — Critères, vérification de l’API et de l’interface », version 1.3 du 3 novembre 2026 ; atelier 4 du 11 novembre 2026, édition 1.25. Les documents d’origine restent dans les fichiers du cours, hors du dépôt public.

Le secret contient quatre couleurs tirées indépendamment parmi rouge, bleu, vert, jaune, orange et violet, dans cet ordre pour la palette. Les répétitions sont autorisées. Le code reste fixe et caché. Une proposition valide consomme un des dix essais. Une proposition invalide ne consomme rien et ne modifie pas l’historique.

On compte d’abord les couleurs bien placées, puis les couleurs mal placées parmi les occurrences restantes. Chaque occurrence compte au plus une fois et les indices ne désignent aucune position. Quatre bien placées donnent la victoire, y compris au dixième essai ; sinon le dixième essai donne la défaite. Après la fin, seul un redémarrage permet de jouer à nouveau. Le code n’est pas révélé séparément, même après la fin, conformément au contrat de l’API.

## Choix proposés avec Codex

La demande confiée à Codex couvre l’examen des sources, la création du jeu, les vérifications et la préparation du rendu. Les choix ci-dessous sont des propositions mises en œuvre par Codex ; ils doivent être relus et compris par l’étudiante avant d’être présentés comme ses décisions.

- Un moteur unique dans `engine.js` sert à la fois l’écran et l’API : une vérification de l’API porte donc sur la véritable partie affichée.
- Quatre listes natives et des noms de couleurs rendent les choix utilisables au clavier et sur écran tactile, sans dépendre uniquement de la perception des couleurs.
- Un comptage des occurrences restantes évite de compter plusieurs fois une même couleur. Le calcul est contrôlé par un second calcul indépendant dans les tests.
- Aucun stockage persistant ni PWA : le rechargement recommence le jeu et ne conserve jamais un code imposé.

L’IA aide à produire et vérifier le logiciel ; l’explication personnelle, la relecture et les essais sur appareil réel restent à effectuer par l’étudiante.

## API commune 0.2

Ouvrir le jeu avec `?test=1` expose `window.codeSecretTest`, initialement `not-started`. Sans ce paramètre, la partie démarre automatiquement et l’objet n’est pas exposé. `getConfig()` et `getState()` sont synchrones et renvoient des copies indépendantes. `startGame()` et `submitGuess()` renvoient des promesses résolues après la mise à jour de l’écran. Attendre chaque appel avant le suivant.

```js
const api = window.codeSecretTest;
await api.startGame({ secret: ["rouge", "rouge", "bleu", "vert"] });
await api.submitGuess(["rouge", "bleu", "rouge", "rouge"]);
// lastResult : { wellPlaced: 1, misplaced: 2 }
api.getState();
```

Les identifiants sont exactement les noms français minuscules. Les refus de proposition suivent la priorité `game-not-started`, `game-finished`, `invalid-type`, `invalid-length`, `invalid-color`. Seul `lastError` change lors d’un refus. Un démarrage invalide rejette une `Error` avec `code` et `message` sans toucher à l’état ni à l’écran.

## Vérifications réalisées

Vérifications automatisées du 11 novembre 2026, version logicielle 1.0.0. `npm test` : **19 tests réussis**, dont les neuf exemples T01–T09 et le calcul indépendant sur les **1 679 616 couples** de codes possibles. `node tests/browser.cjs` : **11 contrôles d’intégration réussis** en local, puis **les 11 mêmes contrôles réussis sur le site public** dans Chrome 157.0.8103.40, commit `3a171155f4553db1fb725c906a89307ee5ca372b`. Le déploiement GitHub Pages de ce commit a terminé avec succès. Les contrôles de largeur utilisent une simulation de navigateur mobile, pas un téléphone réel.

| Vérification | Attendu | Obtenu en local |
| --- | --- | --- |
| R R B V contre R B R R | 1 bien placée, 2 mal placées | 1 et 2 ; 1 essai |
| R R B V contre R R R R | 2 bien placées, 0 mal placée | 2 et 0 ; aucun double comptage |
| Trois choix dans l’interface | Refus expliqué, 0 essai, historique vide | Conforme ; sélection conservée |
| API puis interface, et inversement | Même proposition, mêmes indices et compteur | Conforme dans les deux sens |
| Neuf essais bleus, refus incomplet, puis code exact | Victoire à 10 ; refus ne consomme rien | `won`, 10 essais et 10 entrées |
| Dix propositions incorrectes | Défaite à 10 ; jeu bloqué | `lost`, commandes désactivées |
| Proposition après la fin, même `null` | `game-finished` ; historique inchangé | Conforme |
| Démarrage invalide après un refus | Rejet ; état et interface intégralement inchangés | Conforme, `lastError` inclus |
| Nouvelle partie et rechargement en mode test | Remise à zéro ; `not-started` au rechargement | Conforme |
| Copies retournées modifiées | Aucune altération du vrai jeu | Conforme |
| Largeurs 320, 390 et 768 px | Aucun débordement ; proposition utilisable | Conforme en simulation |

Pour reproduire les tests du navigateur : installer facultativement Playwright hors du code livré (`npm install --no-save --package-lock=false playwright`, puis `npx playwright install chromium`), lancer `npm start`, puis `node tests/browser.cjs`. Pour Chrome déjà installé : définir `TEST_BROWSER_CHANNEL=chrome`. `TEST_URL` permet de viser l’URL publiée, avec une barre oblique finale. Les résultats détaillés et captures sont générés dans `artifacts/`, exclu de Git.

## Correction vérifiée

Défaut observé pendant la revue de l’écran : après une victoire, la zone de l’historique indiquait encore « 9 disponibles » pour une victoire au premier essai, alors que le jeu était bloqué. Le test ajouté sur une victoire au dixième attendait « Partie terminée » et a échoué avec « 0 disponibles ».

Correction dans `app.js` : dès que l’état est `won` ou `lost`, afficher « Partie terminée ». Le compteur des essais réellement utilisés est conservé. Après correction, le même test réussit ; le cas de la victoire au premier essai en simulation mobile et celui de la défaite sont aussi contrôlés. Version avant correction : commit `9f4eda0a16d0b0083404b188673dbb3c63e03586`. La correction et son test sont identifiables dans l’historique Git suivant ce commit. Les fichiers locaux `artifacts/correction-avant.txt` et `artifacts/correction-apres.txt` conservent les sorties d’exécution.

## État du rendu et limites

- Publication GitHub Pages et vérifications sur l’URL publique : **réalisées le 11 novembre 2026**, y compris l’absence d’API en mode normal, l’état initial en mode test et la synchronisation entre API et écran. Version publiée : commit `3a171155f4553db1fb725c906a89307ee5ca372b`. Le présent README local ajoute les résultats publics ; sa dernière publication a été refusée par l’outil. Le tag `jalon-1` reste à créer avant J1 ; le tag `final` attend les preuves personnelles avant J2.
- Essai réel sur smartphone : **non réalisé**. Compléter ici le modèle, le navigateur, la date et le résultat après avoir joué sur le site publié. Vérifier la sélection, une proposition incomplète, l’historique et « Nouvelle partie ».
- Jeu d’un camarade : **non essayé**. Ajouter quelques lignes après un essai réel : jeu essayé, comportement observé et retour utile, sans publier de donnée personnelle inutile.
- Capsule individuelle de 4 à 5 minutes : **à enregistrer avec votre écran et votre voix**, puis à déposer séparément sur Cyberlearn. Le guide local de remise propose un déroulé.
- Relecture et explication personnelle des choix : à effectuer. Les tests automatisés apportent des preuves techniques, sans garantir la validation pédagogique.
- Partie perdue au rechargement ; pas de sauvegarde, PWA ni fonctionnement hors ligne garanti. Lecteur d’écran et Safari sur appareil réel non vérifiés.

J1 : 20 novembre 2026 au soir, tag `jalon-1`, Word avec les deux liens et le tag, sans vidéo. J2 : 18 décembre 2026 au soir, tag `final`, Word et vidéo séparée. Les heures précises sont celles de Cyberlearn. Le tag final doit correspondre à la version effectivement remise après ajout des preuves personnelles. Aucune conversation, vidéo ou clé n’est publiée dans le dépôt.
