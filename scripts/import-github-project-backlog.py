#!/usr/bin/env python3
"""Create GitHub Issues from the TROPEX Project backlog CSV.

Usage:
  python3 scripts/import-github-project-backlog.py \
    --repo OWNER/REPOSITORY \
    --project "Sprint marketplace - Semana 1"

The script uses the GitHub CLI already authenticated on the machine.
"""

from __future__ import annotations

import argparse
import csv
import subprocess
import sys
from pathlib import Path


DEFAULT_CSV = Path(__file__).resolve().parents[1] / "docs/github-projects-backlog.csv"


def run(command: list[str], *, dry_run: bool = False) -> str:
    printable = " ".join(command)
    if dry_run:
        print(f"$ {printable}")
        return ""

    result = subprocess.run(command, check=True, text=True, capture_output=True)
    return result.stdout.strip()


def build_issue_command(row: dict[str, str], repo: str, project: str) -> list[str]:
    command = [
        "gh",
        "issue",
        "create",
        "--repo",
        repo,
        "--project",
        project,
        "--title",
        row["Title"],
        "--body",
        (
            f"{row['Body']}\n\n"
            f"**Estado inicial:** {row['Status']}\n"
            f"**Prioridad:** {row['Priority']}\n"
            f"**Estimación humana:** {row['Estimate (hours)']} h\n"
            f"**Área:** {row['Area']}\n"
            f"**Rol:** {row['Role']}\n"
            f"**Inicio:** {row['Start date']}\n"
            f"**Objetivo:** {row['Target date']}\n"
            f"**Dependencias:** {row['Dependencies'] or 'Ninguna'}"
        ),
    ]

    for label in filter(None, (value.strip() for value in row["Labels"].split(","))):
        command.extend(["--label", label])

    return command


def ensure_labels(rows: list[dict[str, str]], repo: str, *, dry_run: bool = False) -> None:
    labels = sorted({
        label.strip()
        for row in rows
        for label in row["Labels"].split(",")
        if label.strip()
    })

    for label in labels:
        run(
            [
                "gh",
                "label",
                "create",
                label,
                "--repo",
                repo,
                "--color",
                "1E5126",
                "--force",
            ],
            dry_run=dry_run,
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, help="GitHub repository, e.g. owner/repo")
    parser.add_argument("--project", required=True, help="GitHub Project title")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV, help="Backlog CSV path")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing them")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.csv.exists():
        print(f"CSV no encontrado: {args.csv}", file=sys.stderr)
        return 1

    with args.csv.open(newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))

    ensure_labels(rows, args.repo, dry_run=args.dry_run)

    for index, row in enumerate(rows, start=1):
        print(f"[{index}/{len(rows)}] {row['Title']}")
        command = build_issue_command(row, args.repo, args.project)
        issue_url = run(command, dry_run=args.dry_run)

        if issue_url and row["Status"].lower() == "done":
            run(["gh", "issue", "close", issue_url, "--repo", args.repo])

    print("Importación finalizada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
