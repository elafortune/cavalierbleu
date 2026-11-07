# Institut Le Cavalier Bleu — site vitrine

Next.js (App Router) · Tailwind CSS · chess.js / react-chessboard · Stripe Checkout · Resend.

## Développement

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés (facultatif en local)
npm run dev                  # http://localhost:3000
```

Sans clés : le formulaire de contact affiche le message dans la console du serveur, et le paiement
répond « paiement pas encore activé ».

## Où modifier le contenu

| Contenu | Fichier |
| --- | --- |
| Prix et produits payables en ligne | `src/lib/catalog.ts` |
| Modules (textes, niveaux) | `src/content/modules.ts` |
| Témoignages (**fictifs, à remplacer**) | `src/content/testimonials.ts` |
| Articles migrés de l'ancien site | `src/content/lecons.json` + `public/lecons/` |
| Exercices de l'échiquier | `src/lib/puzzles.ts` |
| Contact, liens, menu | `src/lib/site.ts` |
| Anciennes URL → nouvelles pages | `next.config.ts` (redirections 308) |

Les visuels manquants (formation…) utilisent le composant `Placeholder`.

## Déploiement sur Vercel

1. Pousser le dossier sur GitHub, puis « Import Project » dans Vercel (détection Next.js automatique).
2. Renseigner les variables de `.env.example` dans *Settings → Environment Variables*.
3. Stripe : créer un webhook vers `https://<domaine>/api/stripe/webhook` (événement
   `checkout.session.completed`) et copier son secret dans `STRIPE_WEBHOOK_SECRET`.
4. Resend : vérifier le domaine `cavalierbleu.com` pour envoyer depuis `CONTACT_FROM`.
5. Brancher le domaine `cavalierbleu.com` dans *Settings → Domains*.
