# Code secret en couleurs

Jeu solo inspiré du Mastermind, réalisé avec l’aide de Codex pour l’atelier de technologie émergente. Version logicielle 1.0.0, API commune 0.2. Le projet est indépendant du morpion et se trouve dans `code-secret/`.

- [Dépôt GitHub](https://github.com/Lea26541256/Projet-HEG/tree/main/code-secret)
- [Jouer](https://lea26541256.github.io/Projet-HEG/code-secret/)
- [Mode de test enseignant](https://lea26541256.github.io/Projet-HEG/code-secret/?test=1)

## Jouer et reprendre le projet

Choisir une couleur dans chacune des quatre listes, de gauche à droite, puis appuyer sur « Vérifier ma proposition ». Les choix restent modifiables avant validation. « Effacer » vide la proposition ; « Nouvelle partie » réinitialise tout. Tabulation, flèches des listes et Entrée permettent de jouer au clavier. Les noms restent lisibles sous les pions de l’historique.

Le site n’a besoin d’aucun compte, serveur applicatif, service d’IA, clé ou bibliothèque externe. Ouvrir `index.html` suffit pour jouer localement. Avec Node.js 18 ou supérieur, `npm start` ouvre un serveur à l’adresse `http://127.0.0.1:4173/` ; aucune installation n’est nécessaire pour le jeu et les tests du moteur.

## Règles et sources

#### Composez un code
Le programme tire quatre couleurs parmi les six, avec répétitions possibles. Ce code reste fixe et caché pendant la partie.

#### Lisez les indices
Bien placée : bonne couleur, bonne position. 
Mal placée : bonne couleur, ailleurs. 
Chaque occurrence compte une seule fois, les bien placées d’abord.

#### Affinez votre intuition
Retrouvez les quatre positions en dix essais. 
Une proposition incomplète ne coûte aucun essai. 
Après la fin, lancez une nouvelle partie pour rejouer.

## Choix proposés avec Codex

- Les consignes du cours ont été confiées à Codex pour lui faire comprendre l'objectif
- Le design du jeu n'a pas été précisé, Codex l'a choisi seul
- Il a été demandé à Codex de réaliser différents tests. Ces tests ont aussi été vérifiés manuellement afin de confronter les résultats avec ceux de l'IA

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

## Limites

- Le jeu n'a pas été testé sur tout les types de machines
- Le jeu a été testé sur Firefox (portable) et Edge, les autres navigateurs n'ont pas été testés

## Tests effectués sur différents appareils

- Le jeu et l'API ont été testés sur Lenovo, aucun bug constaté
- Le jeu et l'API ont été testés sur Fairphone 6, aucun bug constaté

## Certification d'un camarade

Le jeu et l'API ont été testés par un camarade, aucun bug constaté.

J1 : 20 novembre 2026 au soir, tag `jalon-1`, Word avec les deux liens et le tag, sans vidéo. J2 : 18 décembre 2026 au soir, tag `final`, Word et vidéo séparée. Les heures précises sont celles de Cyberlearn. Le tag final doit correspondre à la version effectivement remise après ajout des preuves personnelles. Aucune conversation, vidéo ou clé n’est publiée dans le dépôt.
