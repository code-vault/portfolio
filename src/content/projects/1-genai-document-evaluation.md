---
title: "Evaluating production GenAI document processing"
order: 1
company: "KlearNow.AI"
problem: "AI was classifying and extracting data from trade documents (invoices, bills of lading, customs filings), and errors flowed straight into customer operations."
solution: "I owned and strengthened our evaluation framework: a golden dataset of ~2,000 real and 400–500 synthetic documents across 8 classes and ~100 fields, scored with per-class precision/recall/F1, field-level exact-match and schema checks as CI quality gates. I piloted DeepEval, RAGAS and Promptfoo, and integrated Arize for observability."
impact:
  - "Run time cut from 5–6 hours to ~3"
  - "Region-specific misclassification caught before release"
diagram: ["Documents", "Classify", "Extract", "Eval gates (F1 · exact-match · schema)", "Arize dashboards"]
tags: ["Python", "DeepEval", "RAGAS", "Promptfoo", "Arize", "Jenkins"]
---
