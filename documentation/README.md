# Tomodachi Documentation

This directory contains the Fumadocs-powered documentation site for the Tomodachi project.

## Quick Start

```bash
# From the documentation directory
npm install
npm run dev
```

Visit **http://localhost:3000/docs** to view the documentation.

## Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## Setup

### First Time Setup

1. **Install dependencies:**
   ```bash
   cd documentation
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000/docs](http://localhost:3000/docs)

### Port Configuration

By default, the documentation runs on port **3000**. If this conflicts with other services:

1. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Set your preferred port:**
   ```bash
   # .env
   DOCS_PORT=3001  # Or any available port
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
documentation/
├── content/
│   └── docs/                    # All documentation content
│       ├── getting-started/     # Setup and installation guides
│       ├── concepts/            # Core concepts and architecture
│       ├── project-docs/        # Project specifications and roadmap
│       ├── systems/             # System documentation (mood, etc.)
│       ├── guides/              # How-to guides
│       ├── development/         # Development docs
│       └── sessions/            # Session notes and changelog
├── app/                         # Next.js app structure
├── lib/                         # Utility functions
├── package.json                 # Dependencies and scripts
├── source.config.ts             # Fumadocs configuration
└── next.config.mjs              # Next.js configuration
```

## Adding Documentation

### Create a New Page

1. **Add an MDX file** in the appropriate section:
   ```bash
   # Example: Add a new guide
   touch content/docs/guides/my-guide.mdx
   ```

2. **Add frontmatter:**
   ```mdx
   ---
   title: My Guide
   description: A helpful guide about something
   ---

   # My Guide

   Content goes here...
   ```

3. **Update navigation** in the section's `meta.json`:
   ```json
   {
     "title": "Guides",
     "pages": [
       "campground-ui",
       "my-guide"
     ]
   }
   ```

### Create a New Section

1. **Create directory:**
   ```bash
   mkdir -p content/docs/my-section
   ```

2. **Add `meta.json`:**
   ```json
   {
     "title": "My Section",
     "pages": [
       "page-1",
       "page-2"
     ]
   }
   ```

3. **Update main navigation** in `content/docs/meta.json`:
   ```json
   {
     "title": "Documentation",
     "pages": [
       "index",
       "---My Section---",
       "my-section"
     ]
   }
   ```

## MDX Syntax Notes

Fumadocs uses **MDX** (Markdown + JSX). Important considerations:

### Special Characters

- **Less-than signs** must be escaped: `<50` → `&lt;50`
- **Wildcards in tables** must be escaped: `*.log` → `\*.log`

### Frontmatter Required

Every MDX file needs frontmatter:
```mdx
---
title: Page Title
description: Brief description for SEO and navigation
---
```

### Code Blocks

Use triple backticks with language:
````mdx
```python
def hello():
    print("Hello!")
```
````

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run postinstall` - Generate MDX content (runs automatically)

## Production Deployment

### Build Static Site

```bash
npm run build
```

This creates an optimized production build in `.next/`.

### Start Production Server

```bash
npm run start
```

### Deploy Options

The documentation can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any static hosting** (after `npm run build`)
- **Self-hosted** (with `npm run start`)

## Troubleshooting

### Port Already in Use

```bash
# Option 1: Change port
echo "DOCS_PORT=3001" > .env
npm run dev

# Option 2: Kill the process
lsof -i :3000
kill <PID>
```

### MDX Syntax Errors

Check the terminal output for specific line numbers and errors. Common issues:
- Missing frontmatter
- Unescaped `<` characters
- Unclosed code blocks

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next .source
npm run build
```

## Integration with Main Project

The documentation is **independent** of the main Tomodachi services but can run alongside them:

- **Main Services**: Ports 5003, 8080, 5173 (configurable via main `.env`)
- **Documentation**: Port 3000 (configurable via `documentation/.env`)

To run everything:
```bash
# Terminal 1: Start main services
./start.sh

# Terminal 2: Start documentation
cd documentation && npm run dev
```

## Contributing

When adding new documentation:

1. ✅ Add proper frontmatter (title, description)
2. ✅ Update relevant `meta.json` for navigation
3. ✅ Escape special characters in MDX
4. ✅ Test locally before committing
5. ✅ Keep sections organized and focused

## Tech Stack

- **[Fumadocs](https://fumadocs.vercel.app/)** - Documentation framework
- **[Next.js 16](https://nextjs.org/)** - React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[MDX](https://mdxjs.com/)** - Markdown with JSX

## Learn More

- **Main Project**: [../README.md](../README.md)
- **Setup Guide**: [content/docs/getting-started/installation.mdx](content/docs/getting-started/installation.mdx)
- **Fumadocs Docs**: https://fumadocs.vercel.app/docs

---

*Part of the Tomodachi (友達) project - Your AI companion in a spatial computing environment.*
