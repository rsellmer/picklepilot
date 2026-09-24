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
};

const english = Object.fromEntries(
  Object.entries(french).map(([source, translated]) => [translated, source]),
) as Record<string, string>;

function translateValue(value: string, locale: Locale) {
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
      .replace(/^(.+) rest$/, "$1 au repos")
      .replace(/^Create (\d+) matches?$/, "Créer $1 match(s)")
      .replace(/^(.+) won · (.+)$/, "$1 a gagné · $2")
      .replace(/^Week of (.+)$/, "Semaine du $1")
      .replace(/^Sign out · (.+)$/, "Déconnexion · $1");
  }
  if (!translated && locale === "en") {
    translated = trimmed
      .replace(/^Bonjour, (.+)$/, "Good afternoon, $1")
      .replace(/^(\d+) terminé\(s\)$/, "$1 completed")
      .replace(/^Terrains (.+)$/, "Courts $1")
      .replace(/^Manche (\d+)$/, "Round $1")
      .replace(/^Terrain (\d+)$/, "Court $1")
      .replace(/^(.+) au repos$/, "$1 rest")
      .replace(/^Créer (\d+) match\(s\)$/, "Create $1 matches")
      .replace(/^(.+) a gagné · (.+)$/, "$1 won · $2")
      .replace(/^Semaine du (.+)$/, "Week of $1")
      .replace(/^Déconnexion · (.+)$/, "Sign out · $1");
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
