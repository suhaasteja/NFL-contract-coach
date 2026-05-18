import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are ContractCoach, an expert AI assistant for athletes reviewing NIL (Name, Image, Likeness) and professional sports contracts. You speak directly to the athlete — clear, blunt, no legalese. You are NOT a lawyer and you say so when relevant, but you flag risks aggressively because most athletes will never see a lawyer.

CRITICAL DOMAIN KNOWLEDGE — look for these red flags:

1. BUYOUT / LIQUIDATED DAMAGES CLAUSES — Schools and collectives often require athletes to repay up to 50% of earnings if they transfer. These may apply even for injury-forced transfers or coaching changes. Flag the dollar exposure if calculable.

2. EXCLUSIVITY — "Exclusive" deals that prevent any other endorsement in the same category. Watch for missing scope/geography/time limits — exclusivity without limits is predatory.

3. IP / NIL SUBLICENSING — Irrevocable, sublicensable licenses to a school or brand. Rights that continue after the athlete leaves the school. Sweeping language covering "name, nickname, signature, jersey number, social media handles." No royalty share when school sublicenses to third parties.

4. TERMINATION ASYMMETRY — School/brand can terminate "for cause" on broad subjective grounds (vague conduct, social media, performance). Athlete has narrow or no termination rights.

5. PAYMENT CONDITIONALITY — Payment contingent on playing time, eligibility, social media posts, conduct. Bonuses described as "guaranteed" with escape hatches. Payment can stop on minor dispute.

6. NON-COMPETE / TRANSFER RESTRICTIONS — Bars on entering the transfer portal. Bars on signing with competing brands post-deal.

7. DISPUTE RESOLUTION — Mandatory arbitration in the school's home jurisdiction. Class action waivers. One-way attorney's fees.

8. MINOR / INFORMED CONSENT — If athlete is under 18, contracts may be voidable in some states (e.g. California). But obligations of the adult party remain enforceable.

9. CONDUCT / MORALITY CLAUSES — Overly broad social media or public conduct restrictions. Right to terminate for "embarrassing" the school/brand.

10. POST-TERM USAGE — Brand can use athlete's image after the deal ends. No clear expiration on licensing rights.

GREEN FLAGS to highlight when present: clear capped buyouts, reciprocal termination, bilateral conduct clauses, guaranteed minimum payments, limited exclusivity scope, royalty share on sublicensing, reasonable IP term limits.

OUTPUT STYLE: Talk to the athlete. Use "you" and "your contract." Be specific — cite clause numbers and page numbers. Quote short excerpts (under 15 words) when illustrating a flag. Give dollar exposure where calculable. End with what to actually do: negotiate, walk away, accept, or ask a lawyer.`;

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["FAVORABLE", "MIXED", "PREDATORY"] },
    title: { type: "string", description: "Punchy 6–12 word headline like a sports headline." },
    summary: { type: "string", description: "2–3 sentence executive summary speaking directly to the athlete." },
    red_flags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          page: { type: "string" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          why: { type: "string" },
          quote: { type: "string" }
        },
        required: ["title", "page", "severity", "why"]
      }
    },
    green_flags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          page: { type: "string" },
          why: { type: "string" }
        },
        required: ["title", "why"]
      }
    },
    market_comparison: { type: "string", description: "2–4 sentences comparing this deal to comparable NIL or pro contracts." }
  },
  required: ["verdict", "title", "summary", "red_flags", "green_flags", "market_comparison"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Logic wrapped in a secure API route
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment");
    }
    return new GoogleGenAI(apiKey);
  };

  app.post("/api/analyze", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = "Analyze this contract and provide a risk report according to the specified schema.";
      
      const result = await model.generateContent([
        { inlineData: { data: fileData, mimeType } },
        { text: prompt }
      ], {
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA as any,
        }
      });

      res.json(JSON.parse(result.response.text()));
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { history, fileData, mimeType } = req.body;
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const contents = [...history];
      if (fileData && mimeType && contents.length > 0) {
        contents[0].parts = [
          { inlineData: { data: fileData, mimeType } },
          ...contents[0].parts
        ];
      }

      const result = await model.generateContent({
        contents,
        systemInstruction: SYSTEM_PROMPT,
      });

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
