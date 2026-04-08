"use client";

import { createContext, useContext, ReactNode } from "react";

interface ArticleImageData {
  src: string;
  alt: string;
  type: "breakout" | "fullwidth";
  caption?: string;
  credit?: string;
}

interface ArticleContextValue {
  images: ArticleImageData[];
}

const ArticleContext = createContext<ArticleContextValue>({ images: [] });

export function ArticleProvider({
  images,
  children,
}: {
  images?: ArticleImageData[];
  children: ReactNode;
}) {
  return (
    <ArticleContext.Provider value={{ images: images || [] }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticleContext() {
  return useContext(ArticleContext);
}
