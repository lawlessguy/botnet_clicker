# AGENTS.md

## Cursor Cloud specific instructions

**CodeBreak: Botnet Domination** is a pure static HTML/CSS/vanilla-JS browser game with zero external dependencies, no build step, no package manager, and no backend.

### Running the game

Serve the repository root as static files and open `index.html` in a browser:

```
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

### Lint / Test / Build

There is no linter, test suite, or build system configured in this repository. Code quality checks must be done by manual review. Any future additions of ESLint, Prettier, or similar tools should be documented here.

### Project structure

All game code lives under `js/` with modules loaded via `<script>` tags in `index.html` (order matters). See `README.md` for the full module breakdown.
