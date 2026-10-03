# Guidelines

## Content

- **No user-facing string literals in rendering code**: every string a visitor reads is a `Text` in `src/data/` or `src/i18n.ts`, so each one is translated and reviewed in one place. Strings a visitor never reads (class names, log messages, test labels) may stay inline. The language and typography rules are in `documentation/requirements.md`.
