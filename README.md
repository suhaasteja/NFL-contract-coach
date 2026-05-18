# ContractCoach

AI-powered contract review built specifically for athletes, helping them navigate NIL (Name, Image, Likeness) and professional sports agreements with confidence and clarity.

**Live App:** [https://contractcoach-340515072895.us-east1.run.app/](https://contractcoach-340515072895.us-east1.run.app/)

---

## 🏟️ The Problem
Most college and pro athletes are 18–22 years old, signing high-stakes deals worth millions without legal representation. Professional legal review costs $400–$800/hour, and NIL agents remain unregulated in most states. This leaves athletes vulnerable to predatory clauses that can steal their IP rights, lock them into unfair exclusivity, or demand massive buyouts.

## 🛡️ The Solution
ContractCoach acts as a digital guardrail. It uses advanced AI to:
- **Analyze Native PDFs:** Reads legal documents directly using Gemini's native multimodal processing.
- **Flag Risks:** Identifies predatory clauses (exclusivity, liquidated damages, IP sublicensing) based on a deep sports-law risk taxonomy.
- **Speak Athlete:** Translates legalese into blunt, direct English—no corporate jargon.
- **Interactive Chat:** Allows athletes to ask follow-up questions about specific clause exposure.

## 🏗️ Architecture
- **Frontend:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS 4.0 + Motion for editorial-grade animations.
- **AI Core:** Google Gemini 3.1 Pro (native multimodal support for PDF/Images).
- **Protocol:** Uses JSON Mode for reliable structured analysis and a stateful chat interface for follow-ups.

## 🚀 Key Features
1. **Instant Risk Verdict:** Favorable, Mixed, or Predatory status with punchy summaries.
2. **Taxonomy-Driven Analysis:** Scans for 10 critical red-flag categories.
3. **Market Comparison:** Benchmarks terms against current industry standards.
4. **Sample Mode:** One-click loading of a predatory contract for demonstration.

---

*Note: This app is a prototype designed for demonstration purposes. In a production environment, API keys must be handled server-side to ensure security.*
