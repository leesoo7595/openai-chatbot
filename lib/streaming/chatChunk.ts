import { QueryRouting } from "./types"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function getQueryRouting(obj: unknown): QueryRouting | undefined {
  if (!isRecord(obj)) return undefined;

  const qr = obj["query_routing"];
  if (!isRecord(qr)) return undefined;

  const selected_model = qr["selected_model"];
  const grades = qr["grades"];

  if (typeof selected_model !== "string") return undefined;
  if (!Array.isArray(grades)) return undefined;

  const parsedGrades: QueryRouting["grades"] = grades
    .filter(isRecord)
    .map((g) => ({
      model: typeof g["model"] === "string" ? g["model"] : "",
      grade_label: typeof g["grade_label"] === "string" ? g["grade_label"] : "",
      grade_value: typeof g["grade_value"] === "number" ? g["grade_value"] : NaN,
      score: typeof g["score"] === "number" ? g["score"] : NaN,
    }))
    .filter((g) => g.model && g.grade_label && Number.isFinite(g.grade_value) && Number.isFinite(g.score));

  return { selected_model, grades: parsedGrades };
}

export function getDeltaContent(obj: unknown): string {
  if (!isRecord(obj)) return "";

  const choices = obj["choices"];
  if (!Array.isArray(choices) || choices.length === 0) return "";

  const c0 = choices[0];
  if (!isRecord(c0)) return "";

  const delta = c0["delta"];
  if (!isRecord(delta)) return "";

  const content = delta["content"];
  return typeof content === "string" ? content : "";
}
