"use client";

import { useEffect } from "react";

export type Locale = "fr" | "en";

const french: Record<string, string> = {
  "Overview": "Aperçu",
  "Teams & captains": "Équipes et capitaines",
  "Teams": "Équipes",
  "Locations": "Lieux",
  "Locations & courts": "Lieux et terrains",
  "Schedule": "Calendrier",
  "Standings": "Classement",
  "Reports": "Rapports",
  "Home": "Accueil",
  "Matches": "Matchs",
  "Players": "Joueurs",
  "Results": "Résultats",
  "Rules": "Règles",
  "Seasons": "Saisons",
  "Opponents": "Adversaires",
  "More": "Plus",
  "Sign out": "Déconnexion",
  "League administrator": "Administrateur de la ligue",
  "Team captain": "Capitaine d’équipe",
  "League administration": "Administration de la ligue",
  "League reports": "Rapports de la ligue",
  "My team": "Mon équipe",
  "Good afternoon": "Bonjour",
  "Good afternoon,": "Bonjour,",
  "View all matches →": "Voir tous les matchs →",
  "YOUR NEXT MATCH": "VOTRE PROCHAIN MATCH",
  "Build lineup →": "Créer l’alignement →",
  "Build lineup": "Créer l’alignement",
  "Preparing…": "Préparation…",
  "No upcoming match": "Aucun match à venir",
  "View schedule →": "Voir le calendrier →",
  "TEAM": "ÉQUIPE",
  "SCHEDULED MATCHES": "MATCHS PLANIFIÉS",
  "ACTIVE PLAYERS": "JOUEURS ACTIFS",
  "NEXT LOCATION": "PROCHAIN LIEU",
  "No match scheduled": "Aucun match planifié",
  "Available for the next lineup": "Disponibles pour le prochain alignement",
  "Review →": "Vérifier →",
  "ALL SEASONS": "TOUTES LES SAISONS",
  "CURRENT SEASON": "SAISON ACTUELLE",
  "Selected season": "Saison sélectionnée",
  "Current season": "Saison actuelle",
  "Complete team history": "Historique complet de l’équipe",
  "Create match": "Créer un match",
  "Create match →": "Créer un match →",
  "Create first match": "Créer le premier match",
  "Edit match": "Modifier le match",
  "Edit scheduled match": "Modifier le match planifié",
  "Save schedule changes": "Enregistrer les modifications",
  "Save changes": "Enregistrer",
  "Cancel": "Annuler",
  "Remove": "Supprimer",
  "Edit": "Modifier",
  "Next": "Suivant",
  "Back": "Retour",
  "Close": "Fermer",
  "Clear": "Effacer",
  "Check": "Vérifier",
  "Active": "Actif",
  "Inactive": "Inactif",
  "Upcoming": "À venir",
  "Completed": "Terminé",
  "Pending": "En attente",
  "Ready": "Prêt",
  "Indoor": "Intérieur",
  "Outdoor": "Extérieur",
  "Local": "Local",
  "Visitor": "Visiteur",
  "Home team": "Équipe locale",
  "Visitor team": "Équipe visiteuse",
  "HOME": "LOCAL",
  "VISITOR": "VISITEUR",
  "Courts": "Terrains",
  "Court": "Terrain",
  "Division": "Division",
  "Season": "Saison",
  "Team": "Équipe",
  "Player": "Joueur",
  "Pair": "Duo",
  "Win": "Victoire",
  "Loss": "Défaite",
  "Tie": "Égalité",
  "Women": "Femmes",
  "Men": "Hommes",
  "Weaker": "Plus faible",
  "Equal": "Équivalent",
  "Stronger": "Plus fort",
  "Performance": "Performance",
  "Development": "Développement",
  "Senior": "Sénior",
  "Players confirmed. Your lineup is ready to review.": "Joueurs confirmés. Votre alignement est prêt à être vérifié.",
  "Lineup": "Alignement",
  "Lineup builder": "Créateur d’alignement",
  "LINEUP WORKSPACE": "ESPACE D’ALIGNEMENT",
  "Match workspace": "Espace du match",
  "Saved lineup": "Alignement enregistré",
  "Edit lineup": "Modifier l’alignement",
  "Finish editing": "Terminer la modification",
  "Save lineup": "Enregistrer l’alignement",
  "Lineup saved": "Alignement enregistré",
  "Review & print lineup": "Vérifier et imprimer l’alignement",
  "Print": "Imprimer",
  "Enter result": "Saisir le résultat",
  "View results": "Voir les résultats",
  "Save results": "Enregistrer les résultats",
  "Results can be saved at any time": "Les résultats peuvent être enregistrés à tout moment",
  "All results are complete": "Tous les résultats sont complets",
  "Results saved as a draft.": "Résultats enregistrés comme brouillon.",
  "Complete match →": "Terminer le match →",
  "Submit official result": "Envoyer le résultat officiel",
  "Confirm official result": "Confirmer le résultat officiel",
  "Correct official result": "Corriger le résultat officiel",
  "Correct result": "Corriger le résultat",
  "Official result pending": "Résultat officiel en attente",
  "Official result sent": "Résultat officiel envoyé",
  "OFFICIAL RESULT CONFIRMED": "RÉSULTAT OFFICIEL CONFIRMÉ",
  "AWAITING OFFICIAL RESULT": "EN ATTENTE DU RÉSULTAT OFFICIEL",
  "Official Interclub result submitted.": "Résultat officiel de l’Interclub envoyé.",
  "Add a player": "Ajouter un joueur",
  "Add player": "Ajouter le joueur",
  "Edit player": "Modifier le joueur",
  "Player name": "Nom du joueur",
  "Full name": "Nom complet",
  "Player ranking": "Classement des joueurs",
  "Pair ranking": "Classement des duos",
  "Actual results, without adjustment.": "Résultats réels, sans ajustement.",
  "Adjusted for opponent strength and number of games.": "Ajusté selon la force des adversaires et le nombre de parties.",
  "Adjusted score from 0 to 100": "Indice ajusté de 0 à 100",
  "Create season": "Créer la saison",
  "Create season & divisions": "Créer la saison et les divisions",
  "Create your first season": "Créer votre première saison",
  "Create next season": "Créer la prochaine saison",
  "Create the next season": "Créer la prochaine saison",
  "Season & divisions": "Saison et divisions",
  "Season & levels": "Saison et niveaux",
  "Manage season": "Gérer la saison",
  "New season name": "Nom de la nouvelle saison",
  "First season name": "Nom de la première saison",
  "Close current & start new →": "Fermer l’actuelle et commencer la suivante →",
  "Closed": "Fermée",
  "Add another level": "Ajouter une autre division",
  "Save division names": "Enregistrer les divisions",
  "Manage teams": "Gérer les équipes",
  "Add team & captain": "Ajouter une équipe et un capitaine",
  "Create team & access": "Créer l’équipe et l’accès",
  "Edit team & captain": "Modifier l’équipe et le capitaine",
  "Team name": "Nom de l’équipe",
  "Captain name": "Nom du capitaine",
  "Temporary password active": "Mot de passe temporaire actif",
  "Reset password": "Réinitialiser le mot de passe",
  "Manage locations": "Gérer les lieux",
  "Save location": "Enregistrer le lieu",
  "No address": "Aucune adresse",
  "Create a game night": "Créer une soirée de matchs",
  "Build schedule": "Créer le calendrier",
  "Save schedule": "Enregistrer le calendrier",
  "Automatically calculated from the official results submitted for each game night.": "Calculé automatiquement à partir des résultats officiels de chaque soirée de matchs.",
  "Official results only": "Résultats officiels seulement",
  "MATCH SCHEDULE": "CALENDRIER DES MATCHS",
  "Season schedule": "Calendrier de la saison",
  "SCHEDULE": "CALENDRIER",
  "FINAL STANDINGS": "CLASSEMENT FINAL",
  "LIVE STANDINGS": "CLASSEMENT EN DIRECT",
  "Round": "Manche",
  "ROUND": "MANCHE",
  "REST": "REPOS",
  "rest": "au repos",
  "MIXED": "MIXTE",
  "FIRST ACCESS": "PREMIER ACCÈS",
  "Create your password": "Créer votre mot de passe",
  "Choose a private password before opening the captain portal.": "Choisissez un mot de passe personnel avant d’ouvrir le portail du capitaine.",
  "Username": "Nom d’utilisateur",
  "Password": "Mot de passe",
  "New password": "Nouveau mot de passe",
  "Confirm password": "Confirmer le mot de passe",
  "Save password & continue": "Enregistrer et continuer",
  "Password updated": "Mot de passe mis à jour",
  "Passwords do not match": "Les mots de passe ne correspondent pas",
  "Sign in": "Connexion",
  "Register an Interclub": "Inscrire un Interclub",
  "LEAGUE REGISTRATION": "INSCRIPTION DE LA LIGUE",
  "SECURE ACCESS": "ACCÈS SÉCURISÉ",
  "Register your organization": "Inscrire votre organisation",
  "Welcome back": "Bon retour",
  "Organization name": "Nom de l’organisation",
  "Your name": "Votre nom",
  "Email": "Courriel",
  "Phone": "Téléphone",
  "Optional": "Facultatif",
  "Choose a username": "Choisissez un nom d’utilisateur",
  "Please wait…": "Veuillez patienter…",
  "Create Interclub administrator account": "Créer le compte administrateur Interclub",
  "View public schedule & standings →": "Voir le calendrier et le classement publics →",
  "Loading PicklePilot…": "Chargement de PicklePilot…",
  "Loading your team…": "Chargement de votre équipe…",
  "Loading competition…": "Chargement de la compétition…",
  "Unable to continue": "Impossible de continuer",
  "Invalid username or password": "Nom d’utilisateur ou mot de passe invalide",
  "The connection failed. Please try again.": "La connexion a échoué. Veuillez réessayer.",
  "The server returned an unexpected response.": "Le serveur a retourné une réponse inattendue.",
  "Unable to submit result": "Impossible d’envoyer le résultat",
  "Unable to save result": "Impossible d’enregistrer le résultat",
  "Unable to load competition": "Impossible de charger la compétition",
  "Unable to load league reports": "Impossible de charger les rapports de la ligue",
  "Save failed": "Échec de l’enregistrement",
  "Load failed": "Échec du chargement",
  "Update failed": "Échec de la mise à jour",
  "Delete failed": "Échec de la suppression",
  "Database unavailable": "Base de données indisponible",
  "No matches in this season": "Aucun match dans cette saison",
  "No results recorded": "Aucun résultat enregistré",
  "No lineup saved": "Aucun alignement enregistré",
  "No active season": "Aucune saison active",
  "Scheduled": "Planifié",
  "Week of": "Semaine du",
  "Sunday to Saturday": "Du dimanche au samedi",
  "HOME · SENDS RESULT": "LOCAL · ENVOIE LE RÉSULTAT",
  "VISITOR · DOES NOT SEND": "VISITEUR · N’ENVOIE PAS",
  "Game night": "Soirée de matchs",
  "Date": "Date",
  "Time": "Heure",
  "Location": "Lieu",
  "Address": "Adresse",
  "Venue type": "Type de lieu",
  "Add": "Ajouter",
  "Duplicate": "Dupliquer",
  "Copy": "Copier",
  "Preferred language": "Langue préférée",
  "French": "Français",
  "English": "Anglais",
  "Create": "Créer",
  "Creating…": "Création…",
  "Saving…": "Enregistrement…",
  "View current report →": "Voir le rapport actuel →",
  "View all-time report →": "Voir le rapport complet →",
  "PLAYER": "JOUEUR",
  "PAIR": "DUO",
  "Played": "Joués",
  "Wins": "Victoires",
  "Losses": "Défaites",
  "Rate": "Taux",
  "Score": "Indice",
  "Complete match": "Terminer le match",
  "Match completed": "Match terminé",
  "All 24 results saved. Match completed!": "Les 24 résultats sont enregistrés. Match terminé!",
  "Select a team": "Sélectionner une équipe",
  "All teams": "Toutes les équipes",
  "All divisions": "Toutes les divisions",
  "All seasons": "Toutes les saisons",
  "All teams and divisions": "Toutes les équipes et divisions",
  "Competition schedule & standings": "Calendrier et classement de la compétition",
  "Public competition pages": "Pages publiques de la compétition",
  "Competition divisions": "Divisions de la compétition",
  "SEASON SCHEDULE": "CALENDRIER DE LA SAISON",
  "RANK": "RANG",
  "CLUB": "CLUB",
  "POINTS": "POINTS",
  "DIFF.": "DIFF.",
  "TIE": "NUL",
  "Current": "Actuelle",
  "No matches found for this selection.": "Aucun match trouvé pour cette sélection.",
  "3 pts: victory with 16+ wins · 2 pts: victory 13–15 · 1 pt: loss with 8+ wins or tie.": "3 pts : victoire avec 16+ gains · 2 pts : victoire 13–15 · 1 pt : défaite avec 8+ gains ou égalité.",
  "The next match will appear here as soon as the league administrator adds it.": "Le prochain match apparaîtra ici dès que l’administrateur de la ligue l’ajoutera.",
  "The official final result has not been submitted. Review the match schedule.": "Le résultat final officiel n’a pas été envoyé. Vérifiez le calendrier.",
  "Manage the current competition from one clear workspace.": "Gérez la compétition actuelle depuis un espace de travail clair.",
  "Set up competition": "Configurer la compétition",
  "Everything is ready for the next step.": "Tout est prêt pour la prochaine étape.",
  "Create your first Interclub season": "Créer votre première saison Interclub",
  "Start with a season name and the competition divisions used by your organization.": "Commencez avec un nom de saison et les divisions utilisées par votre organisation.",
  "Create the season and its Performance, Development or other divisions.": "Créez la saison et ses divisions Performance, Développement ou autres.",
  "Add every team, captain login and temporary first-access password.": "Ajoutez chaque équipe, le compte du capitaine et son mot de passe temporaire.",
  "Centralize venues and the court numbers used by the whole league.": "Centralisez les lieux et les numéros de terrains utilisés par la ligue.",
  "Create home and visitor fixtures that appear automatically for captains.": "Créez les matchs locaux et visiteurs qui apparaissent automatiquement aux capitaines.",
  "Compare player and pair performance across every team and season.": "Comparez les performances des joueurs et des duos pour toutes les équipes et saisons.",
  "Create a match, confirm availability and build the lineup.": "Créez un match, confirmez les disponibilités et préparez l’alignement.",
  "Create a match to start selecting players and building the lineup.": "Créez un match pour sélectionner les joueurs et préparer l’alignement.",
  "Open an assigned match to select its eight players.": "Ouvrez un match attribué pour sélectionner ses huit joueurs.",
  "The league creates your schedule. Open an assigned match to prepare the team and lineup.": "La ligue crée votre calendrier. Ouvrez un match attribué pour préparer l’équipe et l’alignement.",
  "Active players are available in the Lineup Builder.": "Les joueurs actifs sont disponibles dans le créateur d’alignement.",
  "Best available lineup generated from pair rankings, game volume and active preferences.": "Meilleur alignement généré selon le classement des duos, le volume de parties et les préférences actives.",
  "All Always on rules are respected.": "Toutes les règles permanentes sont respectées.",
  "Avoid the same pair in consecutive rounds": "Éviter le même duo dans deux manches consécutives",
  "Prefer no more than 2 games with the same partner": "Préférer au maximum 2 parties avec le même partenaire",
  "Block more than 3 games with the same partner": "Bloquer plus de 3 parties avec le même partenaire",
  "Avoid back-to-back rests": "Éviter deux repos consécutifs",
  "Avoid long streaks without rest": "Éviter de longues séries sans repos",
  "Should not play together": "Ne devraient pas jouer ensemble",
  "Required": "Obligatoire",
  "Avoid": "Éviter",
  "Rule type": "Type de règle",
  "First player": "Premier joueur",
  "Second player": "Deuxième joueur",
  "Select two different players.": "Sélectionnez deux joueurs différents.",
  "Save the lineup before entering results.": "Enregistrez l’alignement avant de saisir les résultats.",
  "Save the lineup before printing.": "Enregistrez l’alignement avant d’imprimer.",
  "Open a real match to generate and save its lineup.": "Ouvrez un vrai match pour générer et enregistrer son alignement.",
  "Upload a score sheet to begin.": "Téléversez une feuille de pointage pour commencer.",
  "Uploaded score sheet": "Feuille de pointage téléversée",
  "Analyze again": "Analyser de nouveau",
  "Ready to analyze": "Prêt à analyser",
  "Ready to save": "Prêt à enregistrer",
  "Unreadable": "Illisible",
  "The original photo is never changed.": "La photo originale n’est jamais modifiée.",
  "Report analysis period": "Période d’analyse du rapport",
  "Complete the remaining courts later.": "Complétez les terrains restants plus tard.",
  "Enter your username. PicklePilot will open the correct administrator or captain portal.": "Entrez votre nom d’utilisateur. PicklePilot ouvrira le bon portail administrateur ou capitaine.",
  "This registration is only for an Interclub administrator. Team captains receive their access directly from the league.": "Cette inscription est réservée à un administrateur Interclub. Les capitaines reçoivent leur accès directement de la ligue.",
  "Captains do not register here. Your Interclub administrator provides your username and temporary password.": "Les capitaines ne s’inscrivent pas ici. L’administrateur Interclub fournit le nom d’utilisateur et le mot de passe temporaire.",
  "Contact and recovery": "Contact et récupération",
  "Optional phone number": "Numéro de téléphone facultatif",
  "Example: Fall 2026": "Exemple : Automne 2026",
  "Example: Interclub Rive-Sud": "Exemple : Interclub Rive-Sud",
  "Performance, Development…": "Performance, Développement…",
  "e.g. Boucherville": "p. ex. Boucherville",
  "e.g. Performance A": "p. ex. Performance A",
  "e.g. Sani Sport Boucherville": "p. ex. Sani Sport Boucherville",
  "Explain why this match was rescheduled. Captains will see this note.": "Expliquez pourquoi ce match a été déplacé. Les capitaines verront cette note.",
  "A team can play only once on the same date. Choose a different team.": "Une équipe ne peut jouer qu’une fois à la même date. Choisissez une autre équipe.",
  "A player with this name already exists.": "Un joueur portant ce nom existe déjà.",
  "Remove this location?": "Supprimer ce lieu?",
  "Remove this team and its captain access?": "Supprimer cette équipe et l’accès de son capitaine?",
  "Print / Save as PDF": "Imprimer / Enregistrer en PDF",
  "Date:": "Date :",
  "Home or visitor": "Local ou visiteur",
  "Category / team / location": "Catégorie / équipe / lieu",
  "Match start time:": "Heure début du match :",
  "Starting court:": "Terrain début séq. :",
  "TIMES": "HEURES",
  "COURT": "TERRAIN",
  "Warm-up": "Échauffement",
  "Pink cells are reserved for women players": "Cases roses réservées aux joueuses féminines",
  "Dashboard": "Tableau de bord",
  "Teams & players": "Équipes et joueurs",
  "Manage": "Gérer",
  "Manage players": "Gérer les joueurs",
  "Manage opponents": "Gérer les adversaires",
  "Create account": "Créer un compte",
  "Create account and team": "Créer le compte et l’équipe",
  "NEW CAPTAIN": "NOUVEAU CAPITAINE",
  "CAPTAIN ACCESS": "ACCÈS CAPITAINE",
  "Create your team": "Créer votre équipe",
  "Create your account now. No approval and no ChatGPT account are required.": "Créez votre compte maintenant. Aucune approbation ni compte ChatGPT n’est requis.",
  "Enter your PicklePilot email and password.": "Entrez votre courriel et votre mot de passe PicklePilot.",
  "Your full name": "Votre nom complet",
  "Example: Chambly A": "Exemple : Chambly A",
  "Captain": "Capitaine",
  "YOUR TEAM": "VOTRE ÉQUIPE",
  "TEAM MANAGEMENT": "GESTION DE L’ÉQUIPE",
  "SEASON RECORD": "BILAN DE LA SAISON",
  "WIN RATE": "TAUX DE VICTOIRE",
  "NEXT OPPONENT": "PROCHAIN ADVERSAIRE",
  "NEXT LINEUP": "PROCHAIN ALIGNEMENT",
  "YOUR NEXT ACTION": "VOTRE PROCHAINE ACTION",
  "Your first real lineup will appear here.": "Votre premier alignement apparaîtra ici.",
  "Chambly A roster": "Effectif de Chambly A",
  "results entered": "résultats saisis",
  "players selected": "joueurs sélectionnés",
  "Open match →": "Ouvrir le match →",
  "Open match": "Ouvrir le match",
  "View matches →": "Voir les matchs →",
  "No results yet": "Aucun résultat pour l’instant",
  "Go to matches": "Aller aux matchs",
  "Enter the first match results and this ranking will appear here automatically.": "Saisissez les premiers résultats et ce classement apparaîtra ici automatiquement.",
  "LINEUP CONFIGURATION": "CONFIGURATION DE L’ALIGNEMENT",
  "STEP 2 · 8 ROUNDS · 3 COURTS": "ÉTAPE 2 · 8 MANCHES · 3 TERRAINS",
  "Follow the steps below. PicklePilot keeps the whole match preparation in one place.": "Suivez les étapes ci-dessous. PicklePilot regroupe toute la préparation du match.",
  "Available players": "Joueurs disponibles",
  "Select exactly 8 players for this match.": "Sélectionnez exactement 8 joueurs pour ce match.",
  "+ Add players to complete the roster": "+ Ajouter des joueurs pour compléter l’effectif",
  "Generate the best lineup": "Générer le meilleur alignement",
  "Generate best lineup": "Générer le meilleur alignement",
  "Generate again ✦": "Générer de nouveau ✦",
  "PicklePilot compares possible combinations using pair rankings, game volume, required rules and active preferences.": "PicklePilot compare les combinaisons selon le classement des duos, le nombre de parties, les règles et les préférences.",
  "Ranking-based optimization": "Optimisation selon le classement",
  "Pairs without history start at a neutral score of 50.": "Les duos sans historique commencent avec un indice neutre de 50.",
  "Select at least 1 woman and 1 man to generate the required mixed courts.": "Sélectionnez au moins une femme et un homme pour les terrains mixtes obligatoires.",
  "TEAM CATEGORY": "CATÉGORIE DE L’ÉQUIPE",
  "Competition level": "Niveau de compétition",
  "Separate from the season name and shown on the printed match sheet.": "Distinct du nom de la saison et affiché sur la feuille de match imprimée.",
  "Save category": "Enregistrer la catégorie",
  "Review your lineup": "Vérifier l’alignement",
  "Swap players if needed, then save. Printing is optional.": "Échangez des joueurs au besoin, puis enregistrez. L’impression est facultative.",
  "Print lineup": "Imprimer l’alignement",
  "Back to lineup builder →": "Retour au créateur d’alignement →",
  "← All matches": "← Tous les matchs",
  "← Matches": "← Matchs",
  "← Dashboard": "← Tableau de bord",
  "← Matchs": "← Matchs",
  "Saved": "Enregistré",
  "Save the lineup when it is ready": "Enregistrez l’alignement quand il sera prêt",
  "Season history": "Historique des saisons",
  "Create and name each season yourself. Previous results remain saved.": "Créez et nommez chaque saison. Les résultats précédents restent enregistrés.",
  "ACTIVE SEASON": "SAISON ACTIVE",
  "HISTORY": "HISTORIQUE",
  "All-time": "Depuis le début",
  "View all-time reports": "Voir tous les rapports",
  "Enter any name": "Saisissez un nom",
  "Starting season…": "Démarrage de la saison…",
  "Create first season →": "Créer la première saison →",
  "Creating a new season closes the current one and preserves its complete history.": "Créer une saison ferme la saison actuelle et conserve tout son historique.",
  "Choose any name to create your first season and begin adding matches.": "Choisissez un nom pour créer votre première saison et ajouter des matchs.",
  "ACTIONS": "ACTIONS",
  "GENDER": "GENRE",
  "STATUS": "STATUT",
  "Total": "Total",
  "Player roster": "Effectif des joueurs",
  "Open Lineup Builder →": "Ouvrir le créateur d’alignement →",
  "+ Add player": "+ Ajouter un joueur",
  "+ New match": "+ Nouveau match",
  "MATCH LOCATIONS": "LIEUX DES MATCHS",
  "OPPONENT DIRECTORY": "RÉPERTOIRE DES ADVERSAIRES",
  "No locations yet": "Aucun lieu pour l’instant",
  "No opponents yet": "Aucun adversaire pour l’instant",
  "Location name": "Nom du lieu",
  "City": "Ville",
  "Default strength": "Force par défaut",
  "Select a location": "Sélectionnez un lieu",
  "Select an opponent": "Sélectionnez un adversaire",
  "Add location": "Ajouter un lieu",
  "+ Add location": "+ Ajouter un lieu",
  "Save the places used by your team. The selected location appears on the printed match sheet.": "Enregistrez les lieux utilisés par votre équipe. Le lieu choisi apparaît sur la feuille imprimée.",
  "Save each city and team once. Its default strength will be suggested when creating a match.": "Enregistrez chaque ville et équipe une fois. Sa force par défaut sera proposée pour les matchs.",
  "Add Chambly, Sani Sport Boucherville, ZAC Pickleball or any other place you use.": "Ajoutez Chambly, Sani Sport Boucherville, ZAC Pickleball ou tout autre lieu utilisé.",
  "Add a city, team and its usual strength. You can still override the strength for any match.": "Ajoutez une ville, une équipe et sa force habituelle. Vous pourrez la modifier pour chaque match.",
  "Opponent": "Adversaire",
  "opponent": "adversaire",
  "Opponent strength for this match": "Force de l’adversaire pour ce match",
  "The saved default is suggested automatically, but you can override it for this match.": "La valeur enregistrée est proposée, mais vous pouvez la modifier pour ce match.",
  "Court numbers": "Numéros des terrains",
  "Changing selected players may require adjusting the saved lineup.": "Changer les joueurs sélectionnés peut nécessiter un ajustement de l’alignement enregistré.",
  "Analysis period": "Période d’analyse",
  "Real ranking": "Classement réel",
  "Adjusted ranking": "Classement ajusté",
  "By pair": "Par duo",
  "By player": "Par joueur",
  "RECORDED GAMES": "PARTIES ENREGISTRÉES",
  "ACTIVE PAIRS": "DUOS ACTIFS",
  "PLAYED": "JOUÉS",
  "WINS": "VICTOIRES",
  "LOSSES": "DÉFAITES",
  "WIN %": "% VICTOIRES",
  "SCORE": "INDICE",
  "wins": "victoires",
  "losses": "défaites",
  "with saved results": "avec résultats enregistrés",
  "No specific player preferences yet.": "Aucune préférence de joueurs pour l’instant.",
  "PLAYER RELATIONSHIPS": "RELATIONS ENTRE JOUEURS",
  "Player preferences": "Préférences des joueurs",
  "Lineup preferences": "Préférences d’alignement",
  "Should play together": "Devraient jouer ensemble",
  "Games together": "Parties ensemble",
  "Add preference": "Ajouter une préférence",
  "Required rules": "Règles obligatoires",
  "Required mixed courts": "Terrains mixtes obligatoires",
  "Rounds 2, 3, 5 and 7.": "Manches 2, 3, 5 et 7.",
  "Six play, two rest": "Six jouent, deux se reposent",
  "One appearance per round": "Une présence par manche",
  "No player can be on two courts.": "Aucun joueur ne peut être sur deux terrains.",
  "These protect the competition format and cannot be disabled.": "Ces règles protègent le format de la compétition et ne peuvent pas être désactivées.",
  "ALWAYS ON": "TOUJOURS ACTIVES",
  "CUSTOMIZABLE": "PERSONNALISABLE",
  "Applied in every round.": "Appliquées à chaque manche.",
  "Set how PicklePilot should build and validate every lineup.": "Choisissez comment PicklePilot crée et valide chaque alignement.",
  "Choose preferred pairings. These create warnings and never block saving.": "Choisissez les duos préférés. Ils génèrent des avertissements sans bloquer l’enregistrement.",
  "Preferences generate warnings but never block saving.": "Les préférences génèrent des avertissements sans bloquer l’enregistrement.",
  "A complete roster is required.": "Un effectif complet est requis.",
  "0 · Avoid pairing": "0 · Éviter le duo",
  "50 · Neutral": "50 · Neutre",
  "100 · Strong pairing": "100 · Duo fort",
  "1 game": "1 partie",
  "2 games": "2 parties",
  "3 games": "3 parties",
  "ASSISTED PHOTO IMPORT · SIMULATION": "IMPORTATION ASSISTÉE DE PHOTO · SIMULATION",
  "Choose or take a photo": "Choisir ou prendre une photo",
  "Change photo": "Changer la photo",
  "JPG, PNG or phone camera": "JPG, PNG ou appareil photo",
  "Pick a photo, review every suggestion, then apply it to this match.": "Choisissez une photo, vérifiez chaque proposition, puis appliquez-la au match.",
  "Read V / D from the score sheet": "Lire V / D sur la feuille de pointage",
  "Apply confirmed results →": "Appliquer les résultats confirmés →",
  "Mark one result for each pair. You can save and finish later.": "Marquez un résultat par duo. Vous pouvez enregistrer et terminer plus tard.",
  "Results update automatically whenever a match is saved.": "Les résultats se mettent à jour après chaque enregistrement de match.",
  "Restore your Captain backup": "Restaurer votre sauvegarde Captain",
  "This replaces only the empty new workspace with the data from your existing Captain account.": "Cette opération remplace uniquement le nouvel espace vide par les données de votre compte Captain existant.",
  "Choose the Captain backup file first.": "Choisissez d’abord le fichier de sauvegarde Captain.",
  "Restore backup": "Restaurer la sauvegarde",
  "Restoring…": "Restauration…",
  "The backup could not be restored.": "La sauvegarde n’a pas pu être restaurée.",
  "Restore complete. Sign in again with your existing Captain account.": "Restauration terminée. Reconnectez-vous avec votre compte Captain existant.",
  "Edit rules →": "Modifier les règles →",
  "Eight selected players": "Huit joueurs sélectionnés",
  "Enter results": "Saisir les résultats",
  "Keep your roster ready for every match.": "Gardez votre effectif prêt pour chaque match.",
  "Required competition rules are always enforced.": "Les règles obligatoires de la compétition sont toujours appliquées.",
  "Save": "Enregistrer",
  "TEAM RESULTS": "RÉSULTATS DE L’ÉQUIPE",
  "vs": "contre",
  "▣ Import photo": "▣ Importer une photo",
  "+ Add opponent": "+ Ajouter un adversaire",
  "Go to seasons": "Aller aux saisons",
  "Green = clear · Amber = check · Red = unreadable": "Vert = clair · Orange = à vérifier · Rouge = illisible",
  "Match preparation progress": "Progression de la préparation du match",
  "Mobile navigation": "Navigation mobile",
  "Name your season before adding matches and results.": "Nommez votre saison avant d’ajouter des matchs et des résultats.",
  "No weighting: wins ÷ games played": "Sans pondération : victoires ÷ parties jouées",
  "Not applied": "Non appliqué",
  "Open the builder from Matches to save this lineup.": "Ouvrez le créateur à partir des matchs pour enregistrer cet alignement.",
  "Saving will complete this match.": "L’enregistrement terminera ce match.",
  "Select players": "Sélectionner les joueurs",
  "Simulate reading ✦": "Simuler la lecture ✦",
  "The season could not be created. Please try again.": "Impossible de créer la saison. Réessayez.",
  "Enter the new season name before continuing.": "Saisissez le nom de la nouvelle saison avant de continuer.",
  "✓ Saved": "✓ Enregistré",
  "back-to-back rest": "repos consécutifs",
  "The roster could not be loaded.": "Impossible de charger l’effectif.",
  "Team settings saved.": "Paramètres de l’équipe enregistrés.",
  "The settings could not be saved.": "Impossible d’enregistrer les paramètres.",
  "The location could not be saved.": "Impossible d’enregistrer le lieu.",
  "The location could not be updated.": "Impossible de modifier le lieu.",
  "The opponent could not be saved.": "Impossible d’enregistrer l’adversaire.",
  "The opponent could not be removed.": "Impossible de supprimer l’adversaire.",
  "The opponent could not be updated.": "Impossible de modifier l’adversaire.",
  "The player rule could not be saved.": "Impossible d’enregistrer la règle du joueur.",
  "Player rule saved.": "Règle du joueur enregistrée.",
  "Player rule removed.": "Règle du joueur supprimée.",
  "No valid lineup for this roster. Select at most four women.": "Aucun alignement valide pour cet effectif. Sélectionnez au plus quatre femmes.",
  "Player updated and saved.": "Joueur modifié et enregistré.",
  "Player added and saved.": "Joueur ajouté et enregistré.",
  "The player could not be saved. Please try again.": "Impossible d’enregistrer le joueur. Réessayez.",
  "The status could not be saved. Please try again.": "Impossible d’enregistrer le statut. Réessayez.",
  "The player could not be removed. Please try again.": "Impossible de supprimer le joueur. Réessayez.",
  "Create your first season before adding a match.": "Créez votre première saison avant d’ajouter un match.",
  "Match updated. Lineup and results were preserved.": "Match modifié. L’alignement et les résultats ont été conservés.",
  "Match created and saved.": "Match créé et enregistré.",
  "The match could not be saved. Please try again.": "Impossible d’enregistrer le match. Réessayez.",
  "Open the lineup from a saved match before saving.": "Ouvrez l’alignement d’un match enregistré avant de sauvegarder.",
  "Lineup saved to this match.": "Alignement enregistré pour ce match.",
  "The lineup could not be saved. Please try again.": "Impossible d’enregistrer l’alignement. Réessayez.",
  "The match results could not be loaded. Please try again.": "Impossible de charger les résultats du match. Réessayez.",
  "The results could not be saved. Please try again.": "Impossible d’enregistrer les résultats. Réessayez.",
  "This result could not be saved. Tap it again to retry.": "Impossible d’enregistrer ce résultat. Appuyez de nouveau pour réessayer.",
  "Create a season before creating a match": "Créez une saison avant de créer un match",
  "Select an active season before creating a match": "Sélectionnez une saison active avant de créer un match",
  "women cannot play together": "deux femmes ne peuvent pas jouer ensemble",
  "mixed doubles required": "duo mixte obligatoire",
};

const english = Object.fromEntries(
  Object.entries(french).map(([source, translated]) => [translated, source]),
) as Record<string, string>;

export function translateValue(value: string, locale: Locale) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const dictionary = locale === "fr" ? french : english;
  let translated = dictionary[trimmed];
  if (!translated && locale === "fr") {
    const matchCount = trimmed.match(/^(\d+) matches?$/);
    if (matchCount)
      translated = `${matchCount[1]} match${matchCount[1] === "1" ? "" : "s"}`;
    else translated = trimmed
      .replace(/^Good afternoon, (.+)$/, "Bonjour, $1")
      .replace(/^(\d+) completed$/, "$1 terminé(s)")
      .replace(/^Courts (.+)$/, "Terrains $1")
      .replace(/^Division (.+)$/, "Division $1")
      .replace(/^Round (\d+)$/, "Manche $1")
      .replace(/^Court (\d+)$/, "Terrain $1")
      .replace(/^COURT (\d+)$/, "TERRAIN $1")
      .replace(/^(.+) rest$/, "$1 au repos")
      .replace(/^Create (\d+) matches?$/, "Créer $1 match(s)")
      .replace(/^(.+) won · (.+)$/, "$1 a gagné · $2")
      .replace(/^Week of (.+)$/, "Semaine du $1")
      .replace(/^Sign out · (.+)$/, "Déconnexion · $1")
      .replace(/^(\d+) completed matches?$/, "$1 matchs terminés")
      .replace(/^(\d+) wins in (\d+) recorded games$/, "$1 victoires en $2 parties enregistrées")
      .replace(/^(\d+) results entered$/, "$1 résultats saisis")
      .replace(/^(\d+)\/24 results$/, "$1/24 résultats")
      .replace(/^(\d+)\/8 players$/, "$1/8 joueurs")
      .replace(/^(\d+) photo results applied\. Review the remaining courts\.$/, "$1 résultats de la photo appliqués. Vérifiez les autres terrains.")
      .replace(/^Round (\d+), court (\d+): women cannot play together$/, "Manche $1, terrain $2 : deux femmes ne peuvent pas jouer ensemble")
      .replace(/^Round (\d+), court (\d+): mixed doubles required$/, "Manche $1, terrain $2 : duo mixte obligatoire")
      .replace(/^(.+) is now the active season\.$/, "$1 est maintenant la saison active.");
    if (translated === trimmed) translated = trimmed
      .replace(/^Round (\d+): (.+) appears more than once$/, "Manche $1 : $2 apparaît plus d’une fois")
      .replace(/^Round (\d+): (.+) is not in this roster$/, "Manche $1 : $2 ne fait pas partie de l’effectif")
      .replace(/^Round (\d+): back-to-back rest$/, "Manche $1 : repos consécutifs")
      .replace(/^Round (\d+): (.+) also played together in the previous round$/, "Manche $1 : $2 ont aussi joué ensemble à la manche précédente")
      .replace(/^(.+) rests (\d+) times$/, "$1 est au repos $2 fois")
      .replace(/^(.+) play together (\d+) times$/, "$1 jouent ensemble $2 fois")
      .replace(/^(.+) and (.+) should not play together$/, "$1 et $2 ne devraient pas jouer ensemble")
      .replace(/^(.+) and (.+) should play together at least (\d+) times?$/, "$1 et $2 devraient jouer ensemble au moins $3 fois")
      .replace(/^(.+) is now active and saved\.$/, "$1 est maintenant actif et enregistré.")
      .replace(/^(.+) is now inactive and saved\.$/, "$1 est maintenant inactif et enregistré.")
      .replace(/^(.+) added\.$/, "$1 ajouté.")
      .replace(/^(.+) removed\.$/, "$1 supprimé.")
      .replace(/^(.+) updated\.$/, "$1 modifié.");
  }
  if (!translated && locale === "en") {
    translated = trimmed
      .replace(/^Bonjour, (.+)$/, "Good afternoon, $1")
      .replace(/^(\d+) terminé\(s\)$/, "$1 completed")
      .replace(/^Terrains (.+)$/, "Courts $1")
      .replace(/^Manche (\d+)$/, "Round $1")
      .replace(/^Terrain (\d+)$/, "Court $1")
      .replace(/^TERRAIN (\d+)$/, "COURT $1")
      .replace(/^(.+) au repos$/, "$1 rest")
      .replace(/^Créer (\d+) match\(s\)$/, "Create $1 matches")
      .replace(/^(.+) a gagné · (.+)$/, "$1 won · $2")
      .replace(/^Semaine du (.+)$/, "Week of $1")
      .replace(/^Déconnexion · (.+)$/, "Sign out · $1")
      .replace(/^(\d+) matchs terminés$/, "$1 completed matches")
      .replace(/^(\d+) victoires en (\d+) parties enregistrées$/, "$1 wins in $2 recorded games")
      .replace(/^(\d+) résultats saisis$/, "$1 results entered")
      .replace(/^(\d+)\/24 résultats$/, "$1/24 results")
      .replace(/^(\d+)\/8 joueurs$/, "$1/8 players")
      .replace(/^(\d+) résultats de la photo appliqués\. Vérifiez les autres terrains\.$/, "$1 photo results applied. Review the remaining courts.")
      .replace(/^Manche (\d+), terrain (\d+) : deux femmes ne peuvent pas jouer ensemble$/, "Round $1, court $2: women cannot play together")
      .replace(/^Manche (\d+), terrain (\d+) : duo mixte obligatoire$/, "Round $1, court $2: mixed doubles required")
      .replace(/^(.+) est maintenant la saison active\.$/, "$1 is now the active season.");
    if (translated === trimmed) translated = trimmed
      .replace(/^Manche (\d+) : (.+) apparaît plus d’une fois$/, "Round $1: $2 appears more than once")
      .replace(/^Manche (\d+) : (.+) ne fait pas partie de l’effectif$/, "Round $1: $2 is not in this roster")
      .replace(/^Manche (\d+) : repos consécutifs$/, "Round $1: back-to-back rest")
      .replace(/^Manche (\d+) : (.+) ont aussi joué ensemble à la manche précédente$/, "Round $1: $2 also played together in the previous round")
      .replace(/^(.+) est au repos (\d+) fois$/, "$1 rests $2 times")
      .replace(/^(.+) jouent ensemble (\d+) fois$/, "$1 play together $2 times")
      .replace(/^(.+) et (.+) ne devraient pas jouer ensemble$/, "$1 and $2 should not play together")
      .replace(/^(.+) et (.+) devraient jouer ensemble au moins (\d+) fois$/, "$1 and $2 should play together at least $3 times")
      .replace(/^(.+) est maintenant actif et enregistré\.$/, "$1 is now active and saved.")
      .replace(/^(.+) est maintenant inactif et enregistré\.$/, "$1 is now inactive and saved.")
      .replace(/^(.+) ajouté\.$/, "$1 added.")
      .replace(/^(.+) supprimé\.$/, "$1 removed.")
      .replace(/^(.+) modifié\.$/, "$1 updated.");
  }
  if (!translated || translated === trimmed) return value;
  return value.replace(trimmed, translated);
}

function localize(root: ParentNode, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, [data-no-i18n]")) continue;
    const next = translateValue(node.nodeValue ?? "", locale);
    if (next !== node.nodeValue) node.nodeValue = next;
  }
  root.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label]").forEach((element) => {
    for (const attribute of ["placeholder", "title", "aria-label"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const next = translateValue(value, locale);
      if (next !== value) element.setAttribute(attribute, next);
    }
  });
  document.documentElement.lang = locale;
}

export function useDomLocalization(locale: Locale) {
  useEffect(() => {
    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      localize(document.body, locale);
      applying = false;
    };
    apply();
    const observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
}

export function LanguageSelector({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="language-switch" data-no-i18n aria-label="Language / Langue">
      <button className={locale === "fr" ? "active" : ""} onClick={() => onChange("fr")} type="button" aria-pressed={locale === "fr"}>
        FR
      </button>
      <button className={locale === "en" ? "active" : ""} onClick={() => onChange("en")} type="button" aria-pressed={locale === "en"}>
        EN
      </button>
    </div>
  );
}

export function localizeDivision(name: string, locale: Locale) {
  if (locale === "fr" && name === "Development") return "Développement";
  if (locale === "fr" && name === "Senior") return "Sénior";
  if (locale === "en" && name === "Développement") return "Development";
  if (locale === "en" && name === "Sénior") return "Senior";
  return name;
}

export function localeCode(locale: Locale) {
  return locale === "fr" ? "fr-CA" : "en-CA";
}
