# Scripts

## Overview
Auxiliary automation scripts for the repository, primarily managing documentation dashboards and tracking panels in `docs/Painéis`.

## Interface
- `main() -> None`: Main entry point for generating project documentation dashboard panels.
- `props(path: Path) -> dict[str, str | list[str]]`: Parses YAML frontmatter properties from markdown document notes.
- `s(v: Any) -> str`: Formats scalar frontmatter values into clean string representations.
- `st(v: Any) -> str`: Formats status strings with corresponding status emoji icons.
- `link(p: Path) -> str`: Converts a filesystem path into an Obsidian/Quartz internal markdown wiki-link.
- `barra(feitos: int, total: int, n: int = 10) -> str`: Generates text-based progress bars for completion tracking.
- `cab(titulo: str, desc: str) -> str`: Renders standardized header banners with generation timestamps.

## Invariants
- Relies exclusively on Python 3 standard library modules (`re`, `json`, `datetime`, `pathlib`, `collections`) without external third-party dependencies.
- Expects `projeto.json` in repository root declaring project slug, taxonomy, categories, and item directories.
- Frontmatter in tracked markdown files must be enclosed between leading `---` delimiters.
- Manual edits to `docs/Painéis/` must not be performed as they are overwritten automatically.

## Side Effects
- Reads `projeto.json` and markdown files from `docs/02 Requisitos`, `docs/03 Decisões`, `docs/04 Pedidos de Mudança`, and `docs/05 Registro/Sessões`.
- Creates `docs/Painéis/` if it does not already exist.
- Overwrites generated tracking files in `docs/Painéis/` (`Visão Geral do Projeto.md`, `Decisões.md`, `Pedidos de Mudança.md`, and requirements dashboards).
- Logs summary of generated items to standard output.

## Verification
- Run: `python3 scripts/gerar-paineis.py` (or `make docs`)
