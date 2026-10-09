import type { ContentKey } from "./default-content";
export const contentFields: Record<
  ContentKey,
  { label: string; hint: string; group: "home" | "guides" | "seo" | "blogs" }
> = {
  hero_eyebrow: {
    label: "Petit texte au-dessus du titre",
    hint: "La courte phrase qui présente la marque en haut de la page d’accueil.",
    group: "home",
  },
  hero_headline: {
    label: "Titre principal — première ligne",
    hint: "La première ligne du grand titre de la page d’accueil.",
    group: "home",
  },
  hero_headline2: {
    label: "Titre principal — deuxième ligne",
    hint: "La suite du grand titre, sous la première ligne.",
    group: "home",
  },
  hero_intro: {
    label: "Présentation de la boutique",
    hint: "Le paragraphe sous le grand titre qui présente vos balances et la livraison.",
    group: "home",
  },
  collection_title: {
    label: "Titre de la collection",
    hint: "Le titre au-dessus des trois modèles PRIMA.",
    group: "home",
  },
  collection_intro: {
    label: "Introduction de la collection",
    hint: "La phrase qui aide le client à comparer les modèles.",
    group: "home",
  },
  closing_title: {
    label: "Invitation à commander",
    hint: "Le titre du dernier bloc de la page d’accueil.",
    group: "home",
  },
  usage_title: {
    label: "Titre des conseils d’utilisation",
    hint: "Le titre de la rubrique de conseils sur la boutique.",
    group: "guides",
  },
  usage_intro: {
    label: "Introduction des conseils",
    hint: "Le paragraphe qui présente les conseils d’utilisation.",
    group: "guides",
  },
  tip_floor: {
    label: "Conseil : choisir le bon sol",
    hint: "Le texte de la carte concernant le placement de la balance.",
    group: "guides",
  },
  tip_routine: {
    label: "Conseil : garder les mêmes repères",
    hint: "Le texte de la carte concernant la régularité des mesures.",
    group: "guides",
  },
  tip_reading: {
    label: "Conseil : obtenir une lecture stable",
    hint: "Le texte de la carte concernant la position pendant la pesée.",
    group: "guides",
  },
  tip_wellbeing: {
    label: "Conseil : préserver son bien-être",
    hint: "Des conseils généraux, sans promesses médicales.",
    group: "guides",
  },
  seo_meta_title: {
    label: "Titre dans Google et les partages",
    hint: "Le titre de la page d’accueil dans l’onglet du navigateur, Google et les aperçus sociaux. Visez environ 50 à 60 caractères.",
    group: "seo",
  },
  seo_meta_description: {
    label: "Description dans Google et les partages",
    hint: "Un résumé clair de la boutique pour les moteurs de recherche et les réseaux sociaux. Visez environ 140 à 160 caractères.",
    group: "seo",
  },
  seo_title: {
    label: "Titre du paragraphe de référencement",
    hint: "Ce titre est visible sur la page d’accueil, dans le bloc consacré aux balances à Marrakech.",
    group: "seo",
  },
  seo_body: {
    label: "Texte de référencement visible sur le site",
    hint: "Le paragraphe visible sur la boutique. Décrivez naturellement les produits et la livraison, sans répéter artificiellement les mots-clés.",
    group: "seo",
  },
  blog_choose: {
    label: "Choisir une balance électronique à Marrakech",
    hint: "Contenu du guide consacré au choix d’une balance.",
    group: "blogs",
  },
  blog_use: {
    label: "Bien utiliser un pèse-personne à la maison",
    hint: "Contenu du guide d’utilisation de la balance.",
    group: "blogs",
  },
  blog_wellbeing: {
    label: "Poids et bien-être : garder du recul",
    hint: "Contenu du guide consacré au poids et au bien-être.",
    group: "blogs",
  },
};
