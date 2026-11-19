---
title: "Testing a mainframe-to-AWS migration"
order: 2
company: "Avis Budget Group, via StatusNeo"
problem: "A car-rental reservation platform was moving from a mainframe to AWS microservices, with 6,000+ legacy test cases and a slow, flaky Selenium suite."
solution: "I architected the UI framework and led the migration to Playwright (TypeScript) with Docker-based CI, and owned testing of the Kafka reservation flows, PostgreSQL and DB2 data replication."
impact:
  - "Regression went from 8 hours to 3"
  - "Flakiness dropped by ~60%"
  - "6,000+ legacy cases became ~1,200 layered tests"
diagram: ["DB2 mainframe", "Transform", "Kafka", "PostgreSQL", "APIs", "New website"]
tags: ["Playwright", "TypeScript", "Selenium", "REST Assured", "Kafka", "PostgreSQL", "Docker", "AWS"]
---
