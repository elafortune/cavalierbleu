// Fournisseur de modèle de langage, interchangeable.
// Gemini (Google) est prévu : il s'active dès que GEMINI_API_KEY et GEMINI_MODEL sont renseignées.
// Sans clé, la plateforme fonctionne normalement : Darko corrige à partir de la vérification automatique.

export type LlmRequest = { system: string; user: string; temperature?: number };
export type LlmResponse = { text: string; model: string };

export interface LlmProvider {
  name: string;
  model: string;
  generateJson(req: LlmRequest): Promise<LlmResponse>;
}

class GeminiProvider implements LlmProvider {
  name = "gemini";
  constructor(
    private apiKey: string,
    public model: string,
  ) {}

  async generateJson({ system, user, temperature = 0.3 }: LlmRequest): Promise<LlmResponse> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status} : ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("Réponse vide du modèle");
    return { text, model: this.model };
  }
}

export function getLlmProvider(): LlmProvider | null {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (key && model) return new GeminiProvider(key, model);
  return null;
}

export const aiStatus = () => {
  if (!process.env.GEMINI_API_KEY) return "Désactivée (GEMINI_API_KEY absente)";
  if (!process.env.GEMINI_MODEL) return "Désactivée (GEMINI_MODEL absent)";
  return `Gemini · ${process.env.GEMINI_MODEL}`;
};
