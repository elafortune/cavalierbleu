# Architecture — Institut Le Cavalier Bleu

État au 11/11/2026. Ce document résume l'ensemble du site. Le détail de la plateforme membres (spécification, analyse de l'ancien site) est dans [`docs/plateforme-membres.md`](docs/plateforme-membres.md).

---

## 1. Vue d'ensemble

Un seul site Next.js, hébergé sur Vercel et relié au dépôt GitHub `elafortune/cavalierbleu`, qui se déploie automatiquement à chaque push sur `main`. Il comporte trois parties :

| Partie | URL | Public |
|---|---|---|
| Site vitrine | `/`, `/cours-a-distance`, `/tarifs`… | tout le monde |
| Espace élève | `/espace/…` | élèves connectés (modules achetés uniquement) |
| Espace Darko | `/admin/…` | administrateurs (`ADMIN_EMAILS`) |

```
Navigateur ──► Next.js 16 (Vercel)
                ├─ pages vitrine (statiques)
                ├─ /espace, /admin (rendu serveur, session Better Auth)
                ├─ /api/auth      → Better Auth (e-mail + mot de passe)
                ├─ /api/checkout  → Stripe Checkout
                ├─ /api/stripe/webhook → ouverture des modules payés
                └─ /api/contact   → Resend (e-mail)
                      │
      ┌───────────────┼──────────────────┬───────────────┐
  Postgres Neon   Vercel Blob (privé)   Gemini (IA)     Resend
  (PGlite en local) (PDF de cours ; disque en local)  (e-mails)
```

### Stack technique

| Rôle | Choix |
|---|---|
| Framework | Next.js 16.4 (App Router, `cacheComponents`), React 19, Tailwind CSS 4, TypeScript |
| Base de données | Postgres via Drizzle ORM. Neon en production ; PGlite (Postgres embarqué dans `.data/pglite`) en local, sans rien à installer |
| Authentification | Better Auth : e-mail + mot de passe, réinitialisation par e-mail, rôles `student` / `admin` |
| Fichiers | Vercel Blob en accès privé ; disque `.data/storage` en local |
| Échecs | `chessops` (lecture et écriture PGN, variantes, NAG, flèches et cases `%cal`/`%csl`), `chess.js` (coups légaux), `react-chessboard` |
| IA | Gemini via l'API REST, inactive tant que la clé n'est pas renseignée |
| Paiement | Stripe Checkout + webhook |
| E-mails | Resend |
| Import Word | `mammoth` (lecture des corrections `.docx`) |

---

## 2. Fonctionnalités

### 2.1 Site vitrine

- **Pages :**
  - accueil ;
  - l'institut, Darko Anic, pédagogie ;
  - cours à distance (les 9 modules), tarifs, ELAN 2026 ;
  - formation, entraînement ;
  - articles, FAQ, guide, liens ;
  - contact, conditions, plan du site.
- Un échiquier interactif d'exercices est intégré à l'accueil (`src/lib/puzzles.ts`).
- Témoignages, formulaire de contact (Resend), achat de modules (Stripe).
- `/espace-etudiant` : le bouton « Se connecter » mène à l'ancien espace élève, ou au nouveau quand `NEXT_PUBLIC_MEMBER_AREA=1`.
- Le site est adapté au mobile.

### 2.2 Espace élève (`/espace`)

- **Compte :**
  - connexion et création de compte (`/connexion`) ;
  - « mot de passe oublié », qui servira aussi d'activation des comptes migrés de l'ancien site.
- **Tableau de bord :** statistiques, modules achetés avec leur progression, dernières corrections.
- **Page module :**
  - cours PDF (`/espace/cours/[id]`, servi seulement si l'élève a accès au module) ;
  - dossiers d'exercices, avec un état par exercice : à faire / envoyé / corrigé + note.
- **Page exercice :**
  - l'élève joue sa solution sur l'échiquier, avec les réponses adverses et les variantes, et peut ajouter un texte ;
  - il peut répondre plusieurs fois et voit l'historique de ses tentatives et corrections ;
  - la solution PGN interactive (variantes, commentaires, cases colorées, notation française) est débloquée après la première correction publiée.
- **Accès :** sans limite de durée.

### 2.3 Espace Darko (`/admin`)

| Page | Rôle |
|---|---|
| `/admin` | Vue d'ensemble et état de la configuration (base, stockage, IA, e-mails) |
| `/admin/corrections` | File des réponses à corriger |
| `/admin/corrections/[id]` | Une correction à valider (détail ci-dessous) |
| `/admin/eleves`, `/admin/eleves/[id]` | Suivi des élèves : statistiques, réussite par thème, historique ; ouverture et retrait de modules |
| `/admin/contenus` | Import de fichiers (PGN, PDF, DOCX, MD, TXT), avancement par module, journal des imports |
| `/admin/exercices/[number]` | Banc d'essai : la vérification automatique est appliquée aux anciennes réponses importées |
| `/admin/expertise` | Base d'exemples et de consignes (activer / désactiver) |

Sur une correction à valider, Darko dispose de :
- la vérification automatique, coup par coup ;
- le brouillon de l'IA et le prompt exact qui lui a été envoyé ;
- les corrections types A)…E) ;
- le choix de la note ;
- une consigne à ajouter pour l'IA ;
- le bouton « Publier et suivante ».

### 2.4 Chaîne de correction

```
Réponse élève (PGN joué + texte)
  → vérification automatique (src/lib/chess/check.ts) : coup clé, défenses couvertes, réfutations → note suggérée
  → brouillon IA (Gemini) en arrière-plan : rédige le commentaire, n'invente jamais le verdict
  → Darko valide ou modifie, puis publie → l'élève est prévenu par e-mail
  → la correction publiée devient un exemple dans la base d'expertise (+ consigne éventuelle)
  → les exemples et consignes sont réinjectés dans les prompts suivants (few-shot) ; à terme, ils serviront à affiner l'IA
```

Légende de Darko :

| Note | Sens |
|---|---|
| `+` | juste |
| `-` | faux ou pas de réponse |
| `!?` | bonne idée mais exécution imprécise |
| `?!` | douteux |
| `?` | incomplet |

### 2.5 Paiement → accès

Le webhook Stripe `checkout.session.completed` crée une ligne `entitlements` (e-mail + module). L'accès est rattaché à l'e-mail : il fonctionne même si l'élève crée son compte après l'achat. Les formules ELAN donnent accès à plusieurs modules.

---

## 3. Organisation du code

```
src/
  app/                       pages et routes (vitrine, espace, admin, api)
    espace/actions.ts        action serveur : envoyer une réponse
    admin/actions.ts         actions serveur : publier, brouillon IA, accès, import, consignes
  components/
    chess/                   Board, AnswerBoard, PgnViewer, MoveTree
    member/                  formulaires d'auth, de réponse, de correction, d'admin ; UI commune
  content/
    curriculum.ts            9 modules, dossiers, numérotation 1–2396 de l'ancien site
    modules.ts, articles.ts, testimonials.ts, lecons.json   contenus du site vitrine
  db/schema.ts, db/index.ts  schéma Drizzle ; connexion Neon / PGlite (création paresseuse)
  lib/
    auth.ts, session.ts      Better Auth (création paresseuse), requireUser / requireAdmin
    chess/                   pgn.ts (arbre PGN), french.ts (notation libre FR/EN), check.ts (vérification)
    content/                 import.ts (pipeline d'import), text.ts (réparation d'encodage), sample-pdf.ts
    platform/                access.ts (droits), corrections.ts (soumission, IA, publication), queries.ts
    ai/                      provider.ts (Gemini), correction-prompt.ts
    storage.ts, email.ts, stripe.ts, catalog.ts, site.ts
scripts/                     migrate, seed, import, dev-accounts, env
drizzle/                     migrations SQL
fixtures/exercices-exemple.pgn   exercices fictifs (placeholders)
contenus/                    vrais contenus (ignoré par Git — contenus payants)
```

### Tables principales

- `user`, `session`, `account`, `verification` : authentification.
- `modules`, `dossiers`, `exercises` : le contenu pédagogique. Chaque exercice a un statut :
  - `placeholder` : contenu pas encore importé ;
  - `sample` : exemple fictif ;
  - `ready` : vrai contenu.
- `course_documents` : les PDF de cours.
- `correction_templates` : les corrections types A)…E).
- `entitlements` : qui a accès à quel module.
- `attempts`, `corrections` : les réponses des élèves et leurs corrections.
- `expertise` : les exemples et consignes de Darko.
- `legacy_answers` : les anciennes réponses importées.
- `import_runs` : le journal des imports.

---

## 4. Ajouter les contenus

Les fichiers se déposent dans `contenus/` :

```
contenus/modules/<module>/cours/*.pdf            cours (D1, N°3, dossier-12… dans le nom → rattaché au dossier)
contenus/modules/<module>/exercices/*.pgn        exercices (numéro lu dans [Exercise "0825"] ou « MV-0825 » ou le nom du fichier)
contenus/corrections/<module>/*.docx|.md|.txt    corrections types A)…E) + anciennes réponses [n] [date] [exercice: NNNN] … [fin-n]
```

Les valeurs possibles de `<module>` sont `jaune`, `orange`, `rouge`, `vert`, `azur`, `turquoise`, `indigo`, `violet`, `bleu`.

Pour importer, on lance `npm run content:import`, ou on passe par Administration → Contenus.
- L'import peut être relancé autant de fois que nécessaire : un contenu inchangé est ignoré et il n'y a pas de doublon.
- Un exemple n'écrase jamais un vrai contenu.
- Les réponses des élèves ne sont jamais modifiées.

### Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Site local |
| `npm run db:setup` | Migrations + squelette (modules, 2 396 exercices) + exemples |
| `npm run content:import` | Import de `contenus/` |
| `npm run dev:accounts` | Comptes de test locaux (admin + élève) ; mots de passe dans `.env.local` |

⚠️ En local, PGlite n'accepte qu'un seul processus : arrêtez `next dev` avant de lancer un script `npm run db:*` ou `content:import`.

---

## 5. Placeholders en place

| Où | Placeholder | À remplacer par |
|---|---|---|
| `fixtures/exercices-exemple.pgn` | 11 exercices fictifs (n° 0001, 0002, 0253, 0254, 0553, 0826–0828, 1205, 1589, 1961), statut `sample`, badge « exemple » | Les PGN réels de Darko (ChessBase) |
| Base : `exercises.status = placeholder` | 2 396 exercices numérotés, vides : « contenu à venir » | Import des PGN |
| `scripts/seed.ts` + `src/lib/content/sample-pdf.ts` | Un PDF de cours fictif par module (`isSample`) | Les PDF de cours réels |
| `src/content/curriculum.ts` | Découpage en dossiers repris des pages d'aide de l'ancien site ; Jaune = un seul dossier ; Violet et Bleu sans dossiers ; codes « DTC » / « EXE » conservés sans explication | Le découpage réel fourni par Darko |
| Module Vert, exercice 0825 | Seul exercice réel (fichier `MV-0825_D1-003_1996.pgn`) + 5 corrections types + 80 anciennes réponses | Tous les exercices et corrections |
| IA (`src/lib/ai/provider.ts`) | Désactivée : le brouillon IA est remplacé par la seule vérification automatique | Clé et modèle Gemini |
| `src/content/testimonials.ts` | Témoignages fictifs (`PLACEHOLDER_TESTIMONIALS = true`, mention « exemples » affichée) | Vrais avis d'élèves |
| `src/app/formation/page.tsx` | Composant `Placeholder` : photo de session, calendrier, dossier d'inscription (PDF), grille des interventions (PDF) | Photo et documents |
| Photo de Darko | Photo actuelle en basse résolution | Photo HD |
| Stripe / Resend | Clés vides : les boutons d'achat et le formulaire de contact affichent un message de repli | Clés de test, puis clés live |
| `NEXT_PUBLIC_MEMBER_AREA` | Non activée : « Se connecter » mène encore à l'ancien espace | `1` au lancement |

---

## 6. Données et éléments manquants

**Contenus (Darko) :**
- [ ] Exercices PGN de tous les modules (export ChessBase), avec consigne et thèmes si possible (en-têtes `[Consigne]`, `[Themes]`).
- [ ] PDF de cours de chaque module.
- [ ] Corrections types et anciennes réponses notées pour les autres exercices (format du `.docx` de l'exercice 0825).
- [ ] Contenu des modules Violet et Bleu (absents en ligne sur l'ancien site).
- [ ] Signification des dossiers « DTC » / « EXE » et découpage exact des dossiers.
- [ ] Vraies notes de Darko sur les 79 anciennes réponses du 0825, pour calibrer la vérification automatique (le banc d'essai propose 43 « + », 13 « ? », 23 « - »).

**Données de l'ancien site :**
- [ ] Export de la base des élèves (e-mails, modules achetés, historique des réponses et notes). Le script de migration est à écrire dès réception.

**Clés et configuration (production) :**
- [ ] `GEMINI_API_KEY` et `GEMINI_MODEL`.
- [ ] Base Neon et Vercel Blob (intégrations Vercel), puis `npm run db:migrate`, `db:seed` et `content:import` sur la production.
- [ ] `BETTER_AUTH_SECRET` et `ADMIN_EMAILS` (e-mail de Darko).
- [ ] `RESEND_API_KEY`, `CONTACT_FROM` (domaine vérifié).
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- [ ] Domaine `cavalierbleu.com` à brancher sur Vercel.

**Site vitrine :**
- [ ] Vrais témoignages, photo HD de Darko, documents de la page Formation.

---

## 7. Limites connues et suites prévues

- **Gros PDF :** un PDF de plus de 4 Mo ne passe pas par le formulaire d'admin (limite Vercel) ; il faut utiliser `content:import`. Un envoi direct vers Blob reste à ajouter.
- **Coups hors solution :** ils sont marqués « à juger ». Une évaluation par Stockfish est prévue.
- **Promotion :** elle se fait toujours en dame sur l'échiquier de réponse.
- **Recommandations :** l'écran (exercices similaires, outils, module suivant) reste à faire. Les données (thèmes, notes) sont déjà collectées.
- **Migration :** le script de migration de l'ancienne base est à écrire quand l'export sera disponible.
- **Fine-tuning :** l'export de la base d'expertise (JSONL) pour un futur entraînement de l'IA est à faire.
