# Content and SEO Standards

This file documents the standards for future portfolio, blog, image, and SEO
work in this repository. It is a project reference, not an agent prompt.

## Site Identity

- Site owner: Elif Sude Ateş
- Site URL: `https://elifsudeates.com`
- Primary topics: Kubernetes, DevOps, GitOps, platform engineering, backend
  systems, self-hosted infrastructure, AI integrations, and open-source tools
- Writing language for public technical posts: English
- Tone: practical, engineer-to-engineer, clear, production-aware, and not
  marketing-heavy

## Design System

Use the existing palette. Do not introduce a new dominant palette unless the
whole site is intentionally redesigned.

```text
Background: #ffffff
Soft background: #f6f7f9
Card background: #ffffff
Border: #e6e8eb
Text: #1a1d21
Soft text: #5c636e
Accent: #088395
Accent soft: #ebf4f6
Dark background: #0d1117
Dark soft background: #161b22
Dark card background: #161b22
Dark border: #21262d
Dark text: #e6edf3
Dark soft text: #8b949e
Dark accent: #7ab2b2
Dark accent soft: #0f2e35
```

Typography uses local `@fontsource-variable/inter`. UI icons should use local
Tabler SVGs through [src/components/Icon.astro](src/components/Icon.astro), not
an icon CDN.

## Blog Frontmatter

Every published blog post must include:

```yaml
---
title: "SEO-friendly post title"
description: "A clear search/social summary under roughly 155 characters."
pubDate: 2026-06-18
tags: ["kubernetes", "gitops", "devops"]
cover:
  src: "/blog/covers/example-cover.jpg"
  alt: "Specific description of what the cover image shows"
---
```

Rules:

- `title` should be readable, specific, and include the primary topic.
- `description` should summarize the reader value, not repeat the title.
- `pubDate` must use ISO date format: `YYYY-MM-DD`.
- `tags` should use lowercase technical terms.
- `cover.src` must point to a committed file under `public/blog/covers/`.
- `cover.alt` must describe the image content, not say "image of" or "cover".
- Use `draft: true` for unpublished work.

## Blog Writing Standards

- Use exactly one `#` title from the frontmatter rendered by the page.
- Use `##` sections for scanability.
- Keep the opening paragraph direct and keyword-relevant.
- Answer the main search intent in the first 150-250 words.
- Prefer concrete examples, YAML snippets, command snippets, and practical
  trade-offs.
- Use normal fenced Markdown code blocks. The site automatically adds local
  Tabler copy buttons to code blocks rendered inside `.prose` content.
- Avoid keyword stuffing. Use natural variations of the main topic.
- Include a conclusion that restates when the tool or technique is useful.
- Use descriptive link text when linking externally.

## SEO Standards

The layout automatically emits:

- canonical URL
- meta description
- Open Graph title, description, URL, type, image, and image alt
- Twitter summary large image tags
- article published time and tags for blog posts
- JSON-LD structured data
- sitemap via `@astrojs/sitemap`
- `robots.txt`

Content requirements:

- Every page must pass a meaningful `description` to `Base`.
- Blog posts must have a cover image so social cards are visually useful.
- Blog post descriptions should stay around 120-155 characters when possible.
- Titles should generally stay under 60-70 characters, unless clarity requires
  more.
- Canonical paths must match the final route, such as `/blog/my-post`.
- Do not publish duplicate pages with different URLs.
- Use useful alt text for every meaningful image.
- Decorative images should use empty alt text only when they add no content.

## Cover Image Standards

Current cover format:

```text
Directory: public/blog/covers/
Format: JPEG
Rendered size: 1400 x 788 px
Aspect ratio: 16:9
Quality target: about 80-90 JPEG quality
Typical file size: under 300 KB when possible
```

Composition:

- Keep the main subject inside the center safe area.
- Avoid important details near the edges.
- The image must work in three contexts: blog card, post hero, and social card.
- No readable text inside generated covers unless a post explicitly requires
  in-image text.
- No watermarks.
- Avoid official brand logos unless licensing and context are clear.
- Different visual styles are allowed per post, such as claymorphism,
  neumorphism, flat vector, soft 3D, editorial illustration, or technical
  diagram style.
- Even when styles differ, keep the portfolio palette in mind and make
  `#546B41` or `#99AD7A` feel like the primary accent.

## Image Alt Text Standards

Good alt text:

- describes what is visible
- includes the technical context when relevant
- is specific enough for a screen reader user
- stays concise

Examples:

```text
Claymorphism-style Kubernetes deployment pipeline where Keel watches a
container registry and updates a cluster

Workflow automation graph scanning academic job postings and sending
notifications
```

Avoid:

- "cover image"
- "nice graphic"
- "SEO image"
- keyword lists

## UI and Icon Standards

- Use [src/components/Icon.astro](src/components/Icon.astro) for UI icons.
- Add new Tabler SVG imports to that component when needed.
- Do not use CDN-hosted UI icon libraries.
- Skill cards must always show an icon and a readable label underneath.
- Navigation and footer links should use icon + text or accessible icon-only
  links with `aria-label`.

## Verification Checklist

Before finishing content or SEO work:

- Run `npm run build`.
- Confirm the new post appears on `/blog` and, if recent enough, on the home
  page.
- Confirm the post page includes its cover image.
- Inspect generated HTML for `og:title`, `og:description`, `og:image`,
  `twitter:card`, `canonical`, and JSON-LD.
- Check image file size and dimensions.
- Confirm there are no broken external icon/image dependencies.
