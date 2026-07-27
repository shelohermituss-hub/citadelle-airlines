# Étapes 1 & 2 — Inventaire des flows Navan et anatomie du tunnel de réservation

## Étape 1 — Inventaire organisé (197 écrans, 25 flows)

### 📁 TUNNEL DE RÉSERVATION — ta priorité (phase 1 du projet)

| Flow | Écrans | À quoi ça sert pour ton projet |
|---|---|---|
| Searching for flight | 8 | Formulaire de recherche : champs, calendrier, sélecteur passagers |
| **Booking flight** | **26** | **Le tunnel complet — ta référence n°1, étudié en détail ci-dessous** |
| Filtering search results | 2 | Système de filtres de la page résultats |
| Adding flight to trip | 4 | Ajout d'un vol retour / multi-destinations |

### 📁 ADMIN — garde pour la phase 2 (systèmes administrateurs)

| Flow | Écrans | Réutilisable pour |
|---|---|---|
| Signing up & onboarding | 18 | Création de compte client + onboarding agents |
| Setting up travel policy | 9 | Modèle pour la config des règles tarifaires internes |
| Inviting team members / Inviting user | 9 + 4 | Gestion des agents et rôles du back-office |
| Adding / Deleting payment method | 8 + 3 | Gestion des moyens de paiement |
| Updating member permissions | 4 | Système de rôles et permissions |
| Adding info to company profile | 4 | Paramètres de la compagnie |
| Creating department | 4 | Structure organisationnelle |
| Logging in / Resetting password | 8 + 7 | Authentification |
| Uploading profile photo | 4 | Profil utilisateur |

### 📁 AUTRES — inspiration secondaire

Booking/Searching/Filtering hotels (35 écrans), Rental car (8), Group event (20), tours guidés et feedback (11). Utile plus tard si la compagnie veut vendre des packages vol+hôtel, mais hors périmètre pour l'instant.

---

## Étape 2 — Anatomie du tunnel de réservation (patterns à reproduire)

Voici la structure extraite des 26 écrans du flow « Booking flight » + les 8 de « Searching for flight ». **Ce sont les patterns à reproduire avec l'identité de ta compagnie — pas les pixels de Navan.**

### Le parcours en 7 étapes

```
1. Accueil / Recherche
2. Résultats aller (+ filtres)
3. Sélection du tarif (classes)
4. Résultats retour (même pattern)
5. Récapitulatif + infos passagers
6. Paiement
7. Confirmation
```

### 1. Formulaire de recherche (accueil)

- **Titre display en serif** très grand (« Where to? ») — donne la personnalité de la marque
- Carte blanche flottante par-dessus une image, coins très arrondis (~24px)
- Onglets type "pill" pour le contexte (chez toi : **Aller-retour / Aller simple / Multi-destinations**)
- Champs : Origine ⇄ Destination (avec bouton d'inversion), Dates, Passagers
- **Calendrier double mois** avec plage sélectionnée surlignée + curseurs d'heure de départ
- Bouton de recherche = cercle avec icône, couleur d'accent forte
- Cartes de raccourcis sous le formulaire (chez toi : Enregistrement en ligne, Ma réservation, Statut du vol)

### 2. Page de résultats

- **Layout 2 colonnes** : filtres à gauche (~280px), liste des vols à droite
- Filtres : escales, horaires (sliders), compagnies, aéroports, bagages — chez toi ce sera plus simple (une seule compagnie) : escales, horaires, classe
- **Anatomie d'une carte de vol** (l'élément le plus important à maîtriser) :
  - Ligne 1 : heure départ → heure arrivée, codes aéroports (PAP → JFK)
  - Ligne 2 : durée totale, direct / nombre d'escales
  - Badges : classe, bagages inclus, conformité (chez toi : « Modifiable », « Bagage 23kg inclus »)
  - À droite : **prix en gros + bouton Sélectionner**
- Barre de tri en haut : prix / durée / heure de départ
- Bandeau de suggestion (« vol recommandé ») en tête de liste

### 3. Sélection du tarif

- Après le clic sur un vol : panneau ou page comparant les **classes tarifaires côte à côte** (Éco / Éco Flex / Business)
- Chaque colonne : prix, ce qui est inclus (bagages, modification, remboursement, sélection de siège) avec icônes ✓/✗
- C'est ici que la compagnie fait sa marge — soigne particulièrement cet écran

### 5. Récapitulatif + infos passagers

- **Layout 2 colonnes inversé** : formulaire à gauche, **carte récapitulative sticky à droite** (vols choisis + total qui se met à jour)
- Formulaire passager : nom exactement comme sur le passeport, date de naissance, sexe, n° passeport + expiration (obligatoire international), contact
- Programme de fidélité en option
- ⚠️ Un formulaire par passager, avec accordéon si plusieurs

### 6. Paiement

- Moyens de paiement en onglets ou liste (chez toi : Carte internationale / MonCash)
- Champs carte + adresse de facturation
- Rappel du total + détail taxes dans la colonne récap
- Case CGV + politique tarifaire à cocher

### 7. Confirmation

- Grand ✓ de succès, **code de réservation (PNR) en très gros**
- Récap complet du voyage + bouton « Télécharger le billet » / envoi email
- Prochaines actions : ajouter au calendrier, gérer ma réservation

### Patterns transversaux observés

- **Stepper visible** en haut du tunnel indiquant l'étape courante
- Densité faible : beaucoup d'espace blanc, une seule action principale par écran
- Cartes blanches sur fond gris très clair, ombres douces, coins arrondis généreux
- Prix toujours à droite, toujours en gras
- Serif réservé aux grands titres, sans-serif pour tout le reste
- Retour arrière toujours possible sans perdre les données saisies

### Adaptations nécessaires pour ta compagnie (ce que Navan n'a pas)

1. **Page d'accueil vitrine** : destinations, promos, image de marque (Navan est un outil, pas une vitrine)
2. **Sélection de sièges** (plan de cabine) — absente du flow Navan, à concevoir
3. **Trilinguisme FR / Kreyòl / EN** dès le header
4. **Gestion de réservation publique** (code PNR + nom) sans compte
5. Paiement MonCash pour le marché local
