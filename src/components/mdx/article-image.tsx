"use client";

import { useArticleContext } from "./article-context";
import { BreakoutImage, FullWidthImage } from "./breakout-image";

interface ArticleImageProps {
  slot: string;
}

export function ArticleImage({ slot }: ArticleImageProps) {
  const { images } = useArticleContext();
  const index = parseInt(slot, 10) - 1;
  const image = images[index];

  if (!image || !image.src) return null;

  if (image.type === "fullwidth") {
    return (
      <FullWidthImage src={image.src} alt={image.alt} caption={image.caption} credit={image.credit} />
    );
  }

  return (
    <BreakoutImage src={image.src} alt={image.alt} caption={image.caption} credit={image.credit} />
  );
}
