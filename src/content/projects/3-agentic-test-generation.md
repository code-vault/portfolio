---
title: "Spec-driven agentic test generation"
order: 3
company: "KlearNow.AI"
problem: "Writing test cases and scripts took the QA team 2–3 days every sprint."
solution: "Playwright Test Agents with an Atlassian MCP server read Jira stories and Confluence specs, then generated test cases and scripts. Healing was limited to locator fixes, and a person reviewed every one."
impact:
  - "~500 test cases generated"
  - "The team's time moved from writing tests to reviewing them"
diagram: ["Jira + Confluence", "Planner agent", "Generator agent", "Human review", "CI"]
tags: ["Playwright Test Agents", "MCP", "TypeScript", "Jira", "Confluence"]
---
