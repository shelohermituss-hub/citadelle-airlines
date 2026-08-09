# Citadelle Airlines — Site web + réservation en ligne

## Contexte
Site public de Citadelle Airlines, compagnie aérienne
INTERNATIONALE d'envergure mondiale — pas centrée sur Haïti. Le nom
et l'emblème « Citadelle » sont un héritage de marque (référence à
la Citadelle Laferrière), pas un positionnement géographique : ne
jamais présenter la compagnie comme « haïtienne » dans les textes.
Le PSS sera Amadeus — AUCUN appel réel : toute donnée vol passe par
une couche mock (src/data/bookingService.ts) qui reproduit la forme
des réponses Amadeus Flight Offers, pour pouvoir être remplacée par
de vrais appels sans toucher aux écrans. Un bandeau (`DemoBanner`)
rappelle en permanence qu'il s'agit d'une démo.

## Stack (projet Bolt.new — remplace l'ancienne base Next.js)
Vite + React 18 + TypeScript strict + react-router-dom + Tailwind
CSS (config classique `tailwind.config.js`, pas de shadcn/ui) +
lucide-react pour les icônes + date-fns. Contexte i18n maison
(src/i18n/I18nContext.tsx + translations.ts, locales : en par
défaut, fr, ht) — pas next-intl. Contexte de réservation maison
(src/contexts/BookingContext.tsx) porte l'état du tunnel entre les
pages. `@react-three/fiber`/`three` sont installés pour l'avion 3D
du hero (Airplane3D.tsx/ThreeAirplane.tsx). `@supabase/supabase-js`
est une dépendance installée mais non câblée à un backend réel —
tout reste mock tant que rule ci-dessus n'est pas levée.

Alias d'import : `@/` → `src/` (voir vite.config.ts /
tsconfig.app.json), ex. `@/components/Foo` == `src/components/Foo`.

## Design tokens Citadelle (OBLIGATOIRES)
Définis dans `tailwind.config.js` sous `colors.citadelle` :
- `citadelle-gold` #F2A81D (+ `gold-light`/`gold-dark`) — CTA et accents
- `citadelle-black` #141414 (+ `black-soft`) — texte, header
- `citadelle-cream` #F7F6F3 — fond · `citadelle-white` #FFFFFF — cartes
- `citadelle-success` #178A5B · `citadelle-error` #D14343
- Polices : `font-display` (Plus Jakarta Sans) pour les titres,
  `font-sans` (Inter) pour le texte courant, chiffres tabulaires
- Ombres dédiées : `shadow-card` / `shadow-card-hover` / `shadow-elevated`
- Coins arrondis généreux, ombres douces

## Animations
Pas de librairie externe (`motion`/framer-motion) dans ce projet —
tout passe par les utilitaires Tailwind définis dans
`tailwind.config.js` (`animate-fade-in`, `animate-slide-up`,
`animate-slide-down`, `animate-shimmer`, `animate-float`) et des
transitions CSS classiques. `prefers-reduced-motion` est déjà
respecté globalement dans `src/index.css` (désactivation complète
des animations/transitions, pas de version réduite). Toute nouvelle
animation doit suivre le même principe : rester dans ces utilitaires
Tailwind (ou en ajouter de similaires dans `tailwind.config.js`),
easing doux, jamais de rebond agressif, jamais bloquant pour
l'utilisateur.

## Règles absolues
1. Jamais de données vol en dur dans les composants : tout passe par
   src/data/ (`bookingService.ts` pour les opérations, `mockOffers.ts`
   pour la génération, `airports.ts`/`fareFamilies.ts` pour le
   référentiel, `types.ts` pour les types façon Amadeus).
2. Tunnel de réservation : `/search` → `/booking/fare` →
   `/booking/passengers` → `/booking/payment` →
   `/booking/confirmation` (voir src/App.tsx pour le routing complet,
   qui inclut aussi Destinations/Check-in/Statut vol/Gérer ma
   réservation/À propos/Aide/Contact/Légal).
3. En cas de conflit entre une skill de design et ce fichier, les
   tokens Citadelle de ce fichier gagnent toujours.
4. Tous les textes via le contexte i18n (`useI18n()` /
   src/i18n/translations.ts), jamais en dur — les 3 locales (en/fr/ht)
   doivent rester synchronisées clé pour clé.
5. Mobile-first, focus clavier visible (`*:focus-visible` géré
   globalement dans src/index.css).
6. Après chaque écran validé : proposer un commit git avec un
   message clair en français.
7. Sélecteur de devise USD/EUR dans le header (à côté des langues,
   voir `LanguageCurrencySelector.tsx`), appliqué à tous les prix
   affichés. Paiement en carte internationale uniquement (pas de
   moyen de paiement local).
8. Le champ « départ » de la recherche démarre toujours vide, avec
   autocomplétion sur les aéroports internationaux desservis (hub
   PAP) — jamais de ville présélectionnée par défaut.
