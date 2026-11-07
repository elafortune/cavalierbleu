// ⚠️ TÉMOIGNAGES FICTIFS — à remplacer par de vrais avis d'élèves avant la mise en ligne.
// Tant que PLACEHOLDER_TESTIMONIALS vaut true, une mention « exemples » s'affiche sous la section
// (publier de faux avis comme authentiques est une pratique commerciale trompeuse).
export const PLACEHOLDER_TESTIMONIALS = true;

export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  formula: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Après deux ans à stagner autour de 1600, le Module Vert m'a enfin donné une méthode. Les corrections personnalisées pointent exactement mes faiblesses. +180 Elo en une saison.",
    name: "Julien M.",
    detail: "Joueur de club, Lyon",
    formula: "Module Vert",
  },
  {
    quote:
      "Les cours en direct avec Darko sont d'une clarté rare. Il comprend en quelques minutes comment vous pensez, et corrige la racine du problème plutôt que le symptôme.",
    name: "Sophie L.",
    detail: "Compétitrice, 1850 Elo",
    formula: "Forfait 20 heures",
  },
  {
    quote:
      "Le coaching m'a surtout appris à gérer la pression en tournoi. Je perds beaucoup moins de parties gagnées dans le zeitnot. Un vrai déclic mental.",
    name: "Thomas R.",
    detail: "Joueur de Nationale 3",
    formula: "Coaching",
  },
  {
    quote:
      "J'utilise les fiches pédagogiques avec mes groupes d'enfants depuis trois ans. Un gain de temps énorme pour préparer mes séances, et une progression vraiment structurée.",
    name: "Nathalie B.",
    detail: "Animatrice de club, DAFFE",
    formula: "Fiches pédagogiques",
  },
  {
    quote:
      "J'ai commencé de zéro à 45 ans avec le Module Jaune. Les dossiers sont progressifs et le suivi bienveillant : je joue maintenant mes premiers tournois.",
    name: "Philippe D.",
    detail: "Adulte débutant",
    formula: "Module Jaune",
  },
  {
    quote:
      "Préparation d'ouvertures sur mesure avant le championnat de France jeunes : notre fils est arrivé confiant et bien armé. Un entraîneur exigeant et très humain.",
    name: "Famille G.",
    detail: "Parents d'un joueur U14",
    formula: "Stage intensif",
  },
];
