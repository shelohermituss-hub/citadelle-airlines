# Citadelle Airlines — Site web + réservation en ligne

## Contexte
Site public de Citadelle Airlines, compagnie aérienne haïtienne
(vols internationaux). Le PSS sera Amadeus — AUCUN appel réel :
toute donnée vol passe par une couche mock au format Amadeus
Flight Offers.

## Stack
Next.js 15 (App Router) + TypeScript strict + Tailwind + shadcn/ui
+ next-intl (locales : fr par défaut, ht, en) + TanStack Query
+ Zod + date-fns.

## Design tokens Citadelle (OBLIGATOIRES)
- Or Citadelle #F2A81D — CTA et accents
- Noir Citadelle #141414 — texte, header
- Fond #F7F6F3 · Cartes #FFFFFF · Succès #178A5B · Erreur #D14343
- Titres : Fraunces (serif) · Texte : Inter · chiffres tabulaires
- Coins arrondis généreux (cartes 20px), ombres douces
- Référence de composants : docs/design-system.html (sa palette
  bleue est OBSOLÈTE — seuls les tokens or/noir ci-dessus comptent,
  reprendre uniquement la structure des composants)

## Animations
- Librairie : `motion` (successeur de Framer Motion) — import depuis
  `"motion/react"`, jamais `"framer-motion"`.
- Durées : 150–300 ms pour les micro-interactions (survol, clic,
  apparition d'un élément) ; 400–600 ms pour les transitions de
  page/écran.
- Easing doux (`easeOut`) — jamais de rebond ni d'accélération
  agressive.
- Respect strict de `prefers-reduced-motion` : si l'utilisateur l'a
  activé, aucune animation (pas de version réduite, désactivation
  complète).
- Jamais d'animation qui bloque une action utilisateur : un bouton
  reste cliquable, un formulaire reste soumettable, même pendant une
  transition en cours.

## Règles absolues
1. Jamais de données vol en dur dans les composants : tout passe
   par src/services/amadeus/ (interface IAmadeusClient,
   implémentation mock.client.ts).
2. Structure des écrans : suivre docs/anatomie-tunnel.md.
3. Les images de docs/references/ servent UNIQUEMENT de référence
   de structure — ne jamais reprendre leurs couleurs, logos, textes
   ou marque (Navan).
4. En cas de conflit entre une skill de design et ce fichier, les
   tokens Citadelle de ce fichier gagnent toujours.
5. Tous les textes via next-intl (fr/ht/en), jamais en dur.
6. Stepper « trajectoire de vol » (pointillés + avion) sur les
   étapes 2 à 5 du tunnel.
7. Mobile-first, focus clavier visible.
8. Après chaque écran validé : proposer un commit git avec un
   message clair en français.
