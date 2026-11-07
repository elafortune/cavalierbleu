import data from "./lecons.json";

// Articles migrés depuis l'ancien site (lecons/leconXXXYY.html) : texte + diagrammes d'origine.
export type Block = { t: "p"; x: string } | { t: "img"; src: string };
export type Article = {
  slug: string;
  title: string;
  theme: string;
  excerpt: string;
  cover: string;
  pages: { blocks: Block[] }[];
};

export const ARTICLES = data as Article[];
export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
