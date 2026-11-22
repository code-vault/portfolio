---
title: "Making a GenAI pipeline measurable"
order: 1
company: "KlearNow.AI"
period: "2026"
featured: true
problem: "Our AI read trade documents (invoices, bills of lading, customs filings), and its mistakes went straight into customer operations. \"It seems to work\" wasn't good enough."
solution: "I took ownership of the evaluation framework and evolved it into a release gate: a golden set drawn from real operations data, metrics for every document type, and checks on every change. I piloted DeepEval, RAGAS and Promptfoo, and brought in Arize so quality could be watched over time, not just at release."
also: "caught a regional regression before customers did."
metrics:
  - value: "5–6h → ~3h"
    label: "evaluation run time"
  - value: "~2,000"
    label: "real documents in the golden set"
  - value: "8"
    label: "document classes gated in CI"
diagram: ["Documents", "Classify", "Extract", "Eval gates", "Arize"]
tags: ["Python", "DeepEval", "RAGAS", "Promptfoo", "Arize", "Jenkins"]
---
