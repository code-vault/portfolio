---
title: "Agents on the first draft, people on the final say"
order: 3
company: "KlearNow.AI"
period: "2026"
featured: true
problem: "Writing tests every sprint was eating days of the team's time."
solution: "I put agents on the first draft: Playwright Test Agents reading the same Jira stories and Confluence pages the team did. People stayed in charge. Agents could only repair locators, and every test was reviewed before it counted."
metrics:
  - value: "~500"
    label: "generated test cases"
  - value: "1d + 1d"
    label: "generate + human review per sprint (was 2–3 days)"
  - value: "100%"
    label: "human-reviewed"
diagram: ["Jira + Confluence", "Planner agent", "Generator agent", "Human review", "CI"]
tags: ["Playwright Test Agents", "MCP", "TypeScript", "Jira", "Confluence"]
---
