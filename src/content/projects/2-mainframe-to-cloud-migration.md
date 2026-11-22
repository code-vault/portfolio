---
title: "Testing a mainframe-to-cloud migration"
order: 2
company: "Avis Budget Group, via StatusNeo"
period: "2022–2025"
problem: "Reservations were moving off a mainframe onto AWS microservices, with thousands of legacy test cases and a UI suite that was slow and flaky."
solution: "I designed the UI test architecture and led the move to Playwright with TypeScript, running in containers in CI. Underneath, I owned how the new services, event streams and migrated data were verified."
metrics:
  - value: "8h → 3h"
    label: "full regression"
  - value: "~60%"
    label: "less flakiness"
  - value: "6,000 → 1,200"
    label: "legacy cases turned into layered tests"
diagram: ["DB2 mainframe", "Transform", "Kafka", "PostgreSQL", "APIs", "Website"]
tags: ["Playwright", "TypeScript", "Selenium", "REST Assured", "Kafka", "PostgreSQL", "Docker", "AWS"]
---
