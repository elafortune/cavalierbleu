# Plateforme membres — cahier des charges et plan

> Statut : **cadrage** (10/11/2026). Ce document regroupe ce qui est connu, les décisions prises et les points restant à éclaircir.
> Mis à jour au fil de l'analyse de l'ancien espace étudiant.

## 1. Objectif

Ajouter au site vitrine un **espace membre**. L'élève y retrouve les modules achetés et y résout des exercices sur un **échiquier interactif**, chargé depuis un fichier PGN, au lieu de diagrammes figés.
Ses réponses sont **corrigées par l'IA** avec la légende et les corrections types du GMI Darko Anic. Darko valide ces corrections, et chacune de ses retouches enrichit en continu la base qui guide l'IA.

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Correcteur | Darko est le **seul correcteur** humain |
| Durée d'accès | **Illimitée** après l'achat |
| Réponses | L'élève peut **revenir** sur un exercice et **répondre plusieurs fois** (toutes les tentatives sont gardées) |
| Contenu | Selon le client : dans l'espace étudiant et/ou en **PDF**. L'analyse montre que seuls les **diagrammes** sont en ligne ; cours et énoncés sont envoyés par courrier (voir §3.1) |
| Validation IA | Au début, **Darko relit** chaque correction et peut ajouter des consignes ; ses retouches alimentent une base d'exemples (logique proche du SFT) |
| Ancienne base | Pas d'information ; on suppose qu'une base des élèves **existe et pourra être exportée** |
| Format clé | **PGN** standard (position de départ, variantes, annotations, cases surlignées) |

## 3. L'ancien espace étudiant

Ce qui suit vient des pages publiques `adherents.html` et `demo.html`.

- Connexion par identifiant et mot de passe (`logtest.html`, puis `connexion.php` ; en cas d'échec, `stop1.html`).
- Tableau de bord personnel : informations de l'élève, nombre d'exercices à résoudre et restants, liste des exercices déjà répondus.
- Pour chaque dossier : l'élève envoie ses solutions à son rythme, sous forme de **diagramme image + zone de texte libre**.
- « Quelques jours plus tard » : les résultats et le **Suivi Individuel** rédigés par l'entraîneur, avec un calcul des performances.
- Les kits de connexion sont envoyés après l'inscription et le règlement.

### 3.1 Espace connecté (analysé le 10/11/2026 avec le compte de test, Module Vert)

Page `espace-clients/vert/moduleVert.php` (un dossier et une page PHP par module) :

- **Tableau de bord** : nom, prénom, date limite (« 28/07/12 » sur ce compte), nombre total d'exercices (380), réponses envoyées (7), exercices restants, numéros déjà répondus (0825 à 0831), et un graphique de progression (image GIF générée).
- **Saisie d'une réponse** : une liste déroulante des 380 numéros (0825 à 1204) affiche le diagramme `positions/NNNN.gif` (image 150×150, sans indication du trait). L'élève tape sa solution dans une zone de texte, puis le formulaire l'envoie à `sauvegarde.php`.
- **« Dossier terminé ! »** : l'élève choisit le dossier et clique ; un e-mail part via `sendmail.php` pour prévenir l'entraîneur.
- **Cours et énoncés : pas en ligne.** « Vous avez reçu votre Formation Individuelle **par courrier**… Retrouvez l'énoncé des exercices dans le kit de connexion. » Le site ne contient que les diagrammes et la saisie des réponses.
- **Corrections** : envoyées **par e-mail**, avec le Suivi Individuel, deux fois par mois (du 1er au 5 et du 15 au 20). Il n'y a pas de page de résultats en ligne.
- **Rythme conseillé** : 1 dossier tous les 15 jours, en 8 mois au maximum.

### 3.2 Contenu des modules (numérotation globale continue)

D'après les pages `aideN.html` et la présence des fichiers `positions/NNNN.gif` :

| Module | Exercices | Numéros | Dossiers |
|---|---|---|---|
| Jaune | 252 | 0001–0252 | page d'aide non trouvée |
| Orange | 300 | 0253–0552 | N°1–4, DTC, N°5–8, EXE |
| Rouge | 272 (la page d'aide annonce 270) | 0553–0824 | N°1–4, DTC, N°5–8, EXE |
| Vert | 380 | 0825–1204 | N°1–6, DTC, N°7–12, EXE |
| Azur | 384 | 1205–1588 | N°1–6, DTC, N°7–12, EXE |
| Turquoise | 372 | 1589–1960 | N°1–6, DTC, N°7–12, EXE |
| Indigo | 436 | 1961–2396 | N°1–7, DTC, N°8–14, EXE |
| Violet, Bleu | — | — | absents de l'espace en ligne |
| **Total** | **≈ 2 396 exercices** | | |

Détail des dossiers (premier et dernier numéro) :
- Vert : 825-848, 849-876, 877-904, 905-928, 929-952, 953-976, DTC 977-1008, 1009-1032, 1033-1060, 1061-1084, 1085-1108, 1109-1136, 1137-1164, EXE 1165-1204.
- Les tables des autres modules sont dans les pages `espace-clients/<module>/aideN.html` et seront importées automatiquement.
- « DTC » et « EXE » sont des dossiers spéciaux (probablement un contrôle intermédiaire et des exercices de synthèse, à confirmer).
- Le fichier d'exemple « E1-FP-d1 / MV-0825 / D1-003 » se lit : Module **V**ert, exercice 0825, **D**ossier **1**, position 003.

### 3.3 Conséquences pour la migration

- **Positions** : les 2 396 diagrammes GIF ont tous le même format (150×150, même jeu de pièces). On peut les **convertir automatiquement en FEN** par reconnaissance d'image, avec une vérification par échantillon. Le **trait** et la **solution** ne figurent pas sur l'image : ils doivent venir des PGN de Darko ou des énoncés papier.
- **Source idéale** : le fichier d'exemple a l'air d'un export ChessBase (champs `GameId`, `Event "E1-FP-d1"`). Si Darko a une base ChessBase de tous les exercices, un export PGN complet remplace la conversion d'images et apporte directement le trait, les solutions et les variantes.
- **Cours** : ils sont distribués sur papier ou en PDF, donc il faut récupérer les fichiers sources (Word, PDF) pour les mettre en ligne.
- **Sécurité de l'ancien site** : les diagrammes sont accessibles sans connexion. Le formulaire de réponse **renvoie l'identifiant et le mot de passe dans des champs cachés** de la page. C'est une raison de plus de migrer, et de ne pas réutiliser les mots de passe actuels : les élèves recevront un e-mail d'activation.

## 4. Fichiers d'exemple fournis

### 4.1 `PGN vjezbe MV-0825_D1-003_1996.pgn` (exercice 0825)

- En-têtes : `[SetUp "1"]` et `[FEN "2k5/8/8/8/1PK5/8/8/8 b - - 0 1"]`, donc une position de départ (finale Roi + pion, trait aux Noirs).
- Commentaire avec cases surlignées : `{[%csl Ga6,Gb6,Gc6]}`, les cases clés.
- Arbre de variantes avec annotations NAG : `1... Kb8 $1 $10 (1... Kc7 $2 2. Kc5 $1 …) (1... Kb7 $2 …)`.
- Le fichier est en UTF-8 avec BOM et fins de ligne CRLF. Le lecteur doit gérer ces deux points.

**Contrainte technique :** `chess.js` (déjà utilisé sur le site) **supprime les variantes**. Il faut un vrai lecteur PGN qui conserve l'arbre, par exemple `@mliebelt/pgn-parser` ou `chessops`. `chess.js` reste utilisé pour valider les coups.

### 4.2 `Corrections-legende-les réponses des étudiants.docx`

- **Légende de notation** : `+` réponse correcte · `-` incorrecte ou absente · `!?` bonne idée, exécution imprécise · `?!` réponse douteuse, ne suit pas l'idée · `?` réponse incomplète.
- **Solution de référence**, en notation française (R, D, T, F, C).
- **5 corrections types (A à E)**, une par genre d'erreur. Elles font référence aux fiches de cours (« Fiche C1-FP-002, diag.4 »).
- **Environ 80 réponses d'élèves, de 2006 à 2025**, sous la forme `[n] [date] [exercice: 0825] … [fin-n]`.
  - Notations très variées : `Rb8`, `1...Rb8`, `RB7`, `Kb8`, `RC5,RC7.B5`, une réponse en serbo-croate.
  - Mauvais encodage (mojibake) : `aprÃ¨s` au lieu de `après`, `l\'opposition`.
  - **Atout** : ce corpus sert de jeu d'évaluation pour l'IA, et d'exemples pour la constituer.

## 5. Fonctionnalités

| # | Fonction | Pour qui | Phase |
|---|---|---|---|
| F1 | Connexion, compte, modules achetés (accès ouvert par le webhook Stripe) | Élève | 1 |
| F2 | Lecteur PGN interactif : position, variantes cliquables, annotations, flèches et cases surlignées | Élève | 1 |
| F3 | Réponse jouée **sur l'échiquier** (variantes comprises) + explication en texte ; plusieurs tentatives | Élève | 1 |
| F4 | Cours du module (pages HTML et/ou PDF intégrés) | Élève | 1 |
| F5 | File de corrections, correction manuelle, édition des exercices (dépôt de PGN) | Darko | 2 |
| F6 | Tableau de suivi : réussite par élève, par exercice, par thème | Darko | 2 |
| F7 | Correction par l'IA (voir §7) | Élève et Darko | 3 |
| F8 | Recommandations : exercices similaires, outils complémentaires, module suivant (avec lien vers l'achat) | Élève et vente | 4 |
| F9 | Migration des comptes, des achats et de l'historique ; activation par e-mail | Les deux | 5 |

## 6. Architecture

```
cavalierbleu.com — Next.js 16 (projet existant, Vercel)
├── site vitrine (existant)
├── /espace   → élève : tableau de bord, modules, exercices, résultats, recommandations
├── /admin    → Darko : file de corrections, suivi des élèves, contenus, consignes à l'IA
└── /api      → webhook Stripe (accès), réponses, correction IA, import PGN

Postgres (Neon via Vercel Marketplace) · connexion (Auth.js : lien e-mail + mot de passe)
Stockfish WASM (navigateur) · API Claude (rédaction des corrections) · Vercel Blob (PDF)
```

**Données principales (première version) :**
- `User` (rôle : élève ou admin) et `Purchase`/`Entitlement` (lien avec le paiement Stripe et le module).
- `Module` > `Dossier` > `Exercise` : chaque exercice a un PGN de référence, ses thèmes, ses corrections types et des renvois vers les fiches de cours.
- `Attempt` : élève, exercice, coups joués (PGN), texte, date. Plusieurs tentatives par exercice.
- `Correction` : tentative, résultat de la vérification automatique, note de la légende, brouillon de l'IA, texte final, statut (`brouillon`, `validée`, `modifiée`), et la différence entre le brouillon et le texte final.
- `Expertise` : exemples et consignes de Darko, chacun lié à un exercice ou à un thème. C'est la mémoire qui guide l'IA.

## 7. Correction par l'IA

Pour chaque réponse d'élève :

1. **Vérification automatique des coups, sans IA.** Les coups de l'élève sont comparés à l'arbre de référence. Un coup absent de l'arbre est évalué par Stockfish. Le résultat donne pour chaque ligne : juste, réfutée (avec la réfutation) ou non couverte.
2. **Rédaction par l'IA.** Elle reçoit la position, le résultat de l'étape 1, le texte de l'élève, la légende, les corrections types de l'exercice et les **k exemples de Darko les plus proches** (recherche dans la base d'expertise). Elle produit une **note de la légende** et un **commentaire** qui adapte la correction type la plus pertinente.
3. **Relecture par Darko.** Il valide, modifie, ou ajoute une consigne générale (exemple : « finales R+P : toujours rappeler les cases clés »).
4. **Amélioration continue.** Chaque retouche devient un nouvel exemple dans la base d'expertise. Les données sont stockées au format entrée/sortie, prêtes pour un éventuel fine-tuning.

**Principe : l'IA ne décide jamais si un coup est juste.** Les modèles de langage calculent mal aux échecs. La vérification de l'étape 1 fait foi, et l'IA ne fait que rédiger.

**Ouverture progressive :** la correction automatique sans relecture n'est ouverte qu'exercice par exercice, quand le taux de validations sans retouche dépasse un seuil (par exemple 90 %). Avant toute mise en service, on rejoue la correction sur les réponses historiques et on compare avec les notes réelles de Darko.

## 8. Plan par phases

| Phase | Contenu | Livrable |
|---|---|---|
| 0. Recueil | Analyse de l'espace connecté, format d'import des exercices, démo de l'exercice 0825 (lecteur PGN + réponse sur l'échiquier) | Format du contenu figé |
| 1. Espace élève | Base de données, connexion, accès via Stripe, lecteur PGN, réponses, cours et PDF, tableau de bord | Les élèves peuvent travailler |
| 2. Outils de Darko | File de corrections, correction manuelle, suivi des élèves, gestion des exercices | Darko corrige sur la nouvelle plateforme |
| 3. Correction IA | Vérification automatique + Stockfish, rédaction IA, validation, base d'expertise, évaluation sur l'historique | Corrections plus rapides, avec relecture |
| 4. Recommandations | Classement des exercices par thème (proposé par l'IA, validé par Darko), exercices similaires, module suivant | Progression et ventes |
| 5. Migration | Import des élèves, achats et historique, réparation de l'encodage, e-mail d'activation | Bascule depuis l'ancien site |

## 9. Points ouverts, à reprendre plus tard

- [x] Analyse de l'espace connecté (Module Vert) : voir §3.1 à §3.3.
- [ ] **Darko a-t-il une base ChessBase/PGN de tous les exercices** (trait, solutions, variantes) ? Sinon : conversion des GIF en FEN, puis saisie des solutions.
- [ ] Fichiers sources des cours (Word ou PDF) pour chaque module.
- [ ] Modules Violet et Bleu : contenu et numérotation (absents de l'espace en ligne).
- [ ] Module Jaune : table des dossiers. Rouge : 270 ou 272 exercices ?
- [ ] Signification exacte des dossiers DTC et EXE.
- [ ] Où sont stockées les réponses (`sauvegarde.php`) et les corrections déjà envoyées par e-mail ? Il faut le savoir pour l'export de l'historique.
- [ ] Les dossiers d'un module s'ouvrent-ils tous d'un coup, ou un par un ?
- [ ] L'élève voit-il la solution après avoir répondu ?
- [ ] Hébergeur et accès à la base de données de l'ancien site, pour l'export.
- [ ] Format des modules PDF : cours seulement, ou exercices aussi ?

---

## 10. Architecture construite (11/11/2026)

Tout fonctionne avec des **contenus d'exemple**. Les vrais fichiers s'insèrent sans modifier le code (§10.3).

### 10.1 Stack validée

| Brique | Choix | Fichiers |
|---|---|---|
| Base de données | Postgres **Neon** en production, **PGlite** (embarqué, `.data/pglite`) en local | `src/db/schema.ts`, `src/db/index.ts`, `drizzle/` (migrations) |
| Accès aux données | **Drizzle ORM** + drizzle-kit | `drizzle.config.ts`, `npm run db:generate` / `db:migrate` |
| Connexion | **Better Auth** : e-mail + mot de passe, réinitialisation par e-mail, rôles `student` / `admin` (`ADMIN_EMAILS`) | `src/lib/auth.ts`, `src/lib/session.ts`, `/connexion`, `/mot-de-passe-oublie` |
| Cours PDF | **Vercel Blob privé** en production, disque local en développement ; servis par `/espace/cours/[id]` après contrôle d'accès | `src/lib/storage.ts` |
| PGN | **chessops** (garde variantes, NAG, `[%csl]`/`[%cal]`), notation française | `src/lib/chess/pgn.ts`, `french.ts` |
| Vérification des réponses | Comparaison avec l'arbre de référence (sans IA) | `src/lib/chess/check.ts` |
| IA | **Gemini** (API REST), interchangeable, inactive sans clé | `src/lib/ai/provider.ts`, `correction-prompt.ts` |
| Accès aux modules | Droits rattachés à l'**e-mail** (achat avant compte possible) ; ouverts par le webhook Stripe, par Darko ou par la migration | `src/lib/platform/access.ts`, `api/stripe/webhook` |

### 10.2 Parcours

- **Élève** (`/espace`) :
  1. Tableau de bord (statistiques, modules, dernières corrections).
  2. Module : cours PDF, puis dossiers et exercices colorés par état (à faire, envoyé, corrigé).
  3. Exercice : échiquier de réponse avec variantes, explication en texte, historique des tentatives et corrections. La solution PGN interactive apparaît après la première correction.
- **Darko** (`/admin`) :
  - vue d'ensemble et configuration ;
  - **file de corrections** : réponse, vérification automatique ligne par ligne, brouillon IA et instructions envoyées à l'IA, boutons « Utiliser A) … E) », note de la légende, consigne pour l'IA, « Publier et passer à la suivante » ;
  - **élèves** : statistiques, ouverture et retrait de modules, réussite par thème, historique ;
  - **contenus** : import de fichiers, état par module, journal des imports ;
  - **fiche exercice** avec **banc d'essai** sur les réponses historiques ;
  - **base d'expertise** : exemples, consignes, taux de brouillons IA modifiés.
- **Correction** : envoi → vérification automatique (`checked`) → brouillon IA (`ai_draft`, si Gemini est configuré) → publication par Darko (`published`), puis e-mail à l'élève. Chaque publication ajoute un **exemple** à la base d'expertise : brouillon IA, texte final, indicateur « modifié ». Ces données servent dès la correction suivante, et plus tard pour un éventuel fine-tuning.

### 10.3 Insérer les vrais contenus

Déposer les fichiers dans `web/contenus/`. Ce dossier est **exclu de Git**, car les contenus sont payants.

```
contenus/
├── modules/<jaune|orange|rouge|vert|azur|turquoise|indigo|violet|bleu>/
│   ├── cours/*.pdf          → cours du module (rattaché à un dossier si le nom contient D1, N°3, DTC, EXE…)
│   └── exercices/*.pgn      → un ou plusieurs exercices par fichier
└── corrections/**/*.docx|.md|.txt  → corrections types A), B)… + réponses historiques [n] [date] [exercice: 0825] … [fin-n]
```

Puis lancer `npm run content:import`. Le site local doit être arrêté (PGlite) ; sinon, passer par **Administration → Contenus**.

- **Numéro d'exercice** : lu dans l'en-tête `[Exercise "0825"]`, ou dans la référence ChessBase `MV-0825` (champs White, Black, Event), ou dans le nom du fichier.
- **En-têtes facultatifs reconnus** :
  - `[Consigne "…"]` ; à défaut, la consigne est déduite du trait et du résultat ;
  - `[Themes "opposition; cases clés"]` : thèmes utilisés pour le suivi et les recommandations ;
  - `[Title "…"]`.
- **Garanties** :
  - un import peut être relancé autant de fois que nécessaire, sans créer de doublon ;
  - un contenu d'exemple ne remplace jamais un contenu réel ;
  - les réponses des élèves ne sont jamais modifiées ;
  - chaque import produit un rapport avec les erreurs (FEN invalide, coup illégal, numéro inconnu).
- **Testé** avec les fichiers fournis :
  - l'exercice 0825 est importé, avec ses variantes et les cases a6, b6, c6 surlignées ;
  - les 5 corrections types sont lues, ainsi que 80 réponses historiques, avec réparation des caractères mal encodés (« aprÃ¨s » devient « après »).
- **Banc d'essai sur l'exercice 0825** : appliquée aux 79 réponses historiques, la vérification automatique propose 43 « + », 13 « ? » et 23 « - ». À comparer avec les notes réelles de Darko quand on les aura.

### 10.4 Commandes

| Commande | Rôle |
|---|---|
| `npm run db:setup` | Migrations + squelette (9 modules, 2 396 exercices) + exemples |
| `npm run db:seed` | Squelette + exemples (relançable) |
| `npm run content:import [-- dossier]` | Import des vrais contenus (`contenus/` par défaut) |
| `npm run dev:accounts` | Local uniquement : comptes de test admin et élève (identifiants dans `.env.local`) |
| `npm run db:generate` | Nouvelle migration après une modification de `schema.ts` |

### 10.5 Mise en production (à faire, avec votre accord)

1. Vercel → Storage : créer une base **Neon**, qui ajoute `DATABASE_URL`, et un store **Blob privé**, qui ajoute `BLOB_READ_WRITE_TOKEN`.
2. Variables à ajouter : `BETTER_AUTH_SECRET`, `ADMIN_EMAILS` (e-mail de Darko), `RESEND_API_KEY` et `CONTACT_FROM` (e-mails de réinitialisation et de correction).
3. Depuis le poste, avec `DATABASE_URL` et `BLOB_READ_WRITE_TOKEN` de production : `npm run db:migrate`, `npm run db:seed`, puis `npm run content:import`.
4. Tant que `NEXT_PUBLIC_MEMBER_AREA` n'est pas à `1`, le bouton « Se connecter » du site mène toujours à l'**ancien** espace. Le nouvel espace reste accessible directement par `/connexion` pour les tests.
5. Gemini : renseigner `GEMINI_API_KEY` et `GEMINI_MODEL` pour activer les brouillons IA.

### 10.6 Limites connues et suites

- **PDF de plus de 4 Mo** : à importer en ligne de commande. L'envoi direct du navigateur vers Blob est à ajouter si Darko doit en déposer lui-même.
- **Coups hors de la référence** : marqués « à juger » ; l'évaluation par un moteur (Stockfish) est à ajouter.
- **Promotion** : toujours en Dame sur l'échiquier de réponse.
- **Recommandations** (exercices similaires, module suivant) : les données nécessaires sont collectées (thèmes, réussite par thème) ; l'interface reste à faire.
- **Migration** des élèves de l'ancienne base : script d'import à écrire dès réception de l'export. Les élèves activeront leur compte via « Mot de passe oublié ».
- **Dossiers « DTC » et « EXE »** : ces codes viennent des pages d'aide de l'ancien site (`aideN.html`). Le client ne les connaît pas ; à confirmer avec Darko.
