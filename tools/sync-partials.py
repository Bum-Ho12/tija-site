#!/usr/bin/env python3
"""Copy the shared header, footer and sidebar into every page.

The site has no build step: each page is complete, static HTML. Shared markup
lives in partials/ and is copied between markers like

    <!-- PARTIAL:header -->
    ...
    <!-- /PARTIAL:header -->

Edit a file in partials/, then run from the repo root:

    python3 tools/sync-partials.py

{root} in a partial becomes the relative path to the site root ("" or "../").
The current page's links get aria-current="page".
"""

import pathlib
import re
import sys

SITE = "https://bum-ho12.github.io/tija-site/"
ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials"
SKIP_DIRS = {"partials", "tools", ".git"}
MARKER = re.compile(
    r"(<!-- PARTIAL:(?P<name>[a-z-]+) -->\n)(?P<body>.*?)(\n?[ \t]*<!-- /PARTIAL:(?P=name) -->)",
    re.S,
)


def section_for(rel: pathlib.PurePosixPath) -> str:
    if rel.parts[0] == "guide":
        return "guide"
    return rel.stem


def social_meta(page: str, rel: pathlib.PurePosixPath) -> str:
    """Canonical URL, Open Graph and Twitter tags from the page's own
    <title> and meta description."""
    title = re.search(r"<title>(.*?)</title>", page, re.S).group(1).strip()
    desc = re.search(r'<meta name="description" content="(.*?)">', page, re.S).group(1)
    path = "" if rel.as_posix() == "index.html" else rel.as_posix()
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    url = SITE + path
    lines = [
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Tija">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{desc}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE}assets/img/og-image.png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="Tija: notes, tasks and plans in one calm place">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    return "\n".join("  " + line for line in lines)


def render(name: str, rel: pathlib.PurePosixPath, page: str) -> str:
    if name == "meta":
        return social_meta(page, rel)
    text = (PARTIALS / f"{name}.html").read_text(encoding="utf-8").rstrip("\n")
    root = "../" * (len(rel.parts) - 1)
    if rel.as_posix() == "404.html":
        # GitHub Pages serves 404.html for a missing URL at any depth, so its
        # links must be absolute.
        root = "/tija-site/"
    if name == "header":
        section = section_for(rel)
        text = text.replace(
            f'data-section="{section}">', f'data-section="{section}" aria-current="page">'
        )
    if name == "guide-sidebar":
        text = text.replace(
            f'href="{{root}}{rel.as_posix()}">', f'href="{{root}}{rel.as_posix()}" aria-current="page">'
        )
    return text.replace("{root}", root)


def main() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        rel = pathlib.PurePosixPath(path.relative_to(ROOT).as_posix())
        if rel.parts[0] in SKIP_DIRS:
            continue
        original = path.read_text(encoding="utf-8")
        updated = MARKER.sub(
            lambda m: m.group(1) + render(m.group("name"), rel, original) + "\n" + m.group(4).lstrip("\n"),
            original,
        )
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"updated {rel}")
    print(f"{changed} file(s) changed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
