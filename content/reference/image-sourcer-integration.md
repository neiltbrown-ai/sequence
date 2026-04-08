# Image Sourcer Integration Guide

How the image sourcer should inject images into In Sequence content MDX files.

---

## Case Studies

Case studies use **two frontmatter image fields**: a hero image (top of page) and a secondary image (renders automatically below the Timeline of Eras).

### Frontmatter Fields

```yaml
heroImage: "https://images.unsplash.com/photo-xxx?w=1600&q=80"
heroAlt: "Description of the hero image"
secondaryImage: "https://images.unsplash.com/photo-yyy?w=1600&q=80"
secondaryAlt: "Description of the secondary image"
```

### Image Specs

| Field | Aspect Ratio | Recommended Size | Notes |
|-------|-------------|-----------------|-------|
| `heroImage` | 21:9 | w=1600, q=80 | Full-width cinematic banner at top |
| `secondaryImage` | 21:9 | w=1600, q=80 | Same treatment, appears after timeline |

### Behavior

- `heroImage` renders at the top of the case study, above the stats bar
- `secondaryImage` renders automatically after the `<CbTimeline>` component in the MDX body
- Both display at 70% opacity with `object-fit: cover`
- If `secondaryImage` is omitted, nothing renders — no empty space
- `coverImage` (existing field) is used for card thumbnails in grids/lists — not displayed on the detail page

### What the Sourcer Should Do

1. Read the case study MDX file
2. Inject `heroImage`, `heroAlt`, `secondaryImage`, `secondaryAlt` into the YAML frontmatter
3. No changes needed to the MDX body — the secondary image renders automatically

---

## Articles

Articles use a **frontmatter `images` array** with slot-based rendering. The MDX body contains `<ArticleImage slot="N" />` placeholders that pull from this array.

### Frontmatter Schema

```yaml
images:
  - src: "https://images.unsplash.com/photo-aaa?w=1000&h=500&fit=crop"
    alt: "Description"
    type: breakout
    caption: "Optional caption text"
  - src: "https://images.unsplash.com/photo-bbb?w=1400&h=480&fit=crop&crop=center"
    alt: "Description"
    type: fullwidth
    caption: "Optional caption text"
  - src: "https://images.unsplash.com/photo-ccc?w=1000&h=500&fit=crop"
    alt: "Description"
    type: breakout
    caption: "Optional caption text"
```

### Image Types

| Type | Class | Width | Recommended Size |
|------|-------|-------|-----------------|
| `breakout` | `BreakoutImage` | Mid-width (~6 columns) | w=1000, h=500 |
| `fullwidth` | `FullWidthImage` | Full page width | w=1400, h=480 |

### Determining Image Count

The number of images should match the number of `<ArticleImage slot="N" />` tags in the MDX body. To determine this programmatically:

**Simple rule**: Count the `<ArticleImage` tags in the MDX body.

```
grep -c '<ArticleImage' content/articles/the-article.mdx
```

**If writing a new article from scratch**, use this formula based on word count:
- Under 1,000 words: 1-2 images (1 breakout)
- 1,000-2,000 words: 2-3 images (1 breakout + 1 fullwidth)
- Over 2,000 words: 3-4 images (2 breakout + 1 fullwidth, or 2 breakout + 1 fullwidth + 1 breakout)

**Recommended pattern for slot placement in MDX**:
- Slot 1 (breakout): After the first major section/subhead
- Slot 2 (fullwidth): At the midpoint of the article
- Slot 3 (breakout): In the final third, before the conclusion

### How Slots Work

The MDX body contains:
```mdx
<ArticleImage slot="1" />
```

This component reads `images[0]` from the frontmatter array. If the image exists, it renders as either `BreakoutImage` or `FullWidthImage` based on the `type` field. If no image exists at that index, it renders nothing.

### What the Sourcer Should Do

1. Read the article MDX file
2. Count how many `<ArticleImage slot="N" />` tags exist in the body
3. Find that many images
4. Inject them into the frontmatter `images` array in order (slot 1 = index 0, slot 2 = index 1, etc.)
5. No changes needed to the MDX body

### Existing Fields (Unchanged)

- `heroImage` — still used for the banner at the top of the article page. Separate from the `images` array.

---

## Summary

| Content Type | Hero | Secondary/Inline | Where Sourcer Writes |
|-------------|------|------------------|---------------------|
| Case Study | `heroImage` + `heroAlt` | `secondaryImage` + `secondaryAlt` | Frontmatter only |
| Article | `heroImage` | `images[]` array | Frontmatter only |

Both systems are **frontmatter-only** — the sourcer never needs to modify MDX body content.
