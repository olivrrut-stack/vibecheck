// Pull the JSON object out of a model response. With json_schema output the
// text is almost always clean JSON, so try that first; only fall back to fence
// or brace extraction if the model wrapped it in prose. Shared by the diagnosis
// (/api/check) and fixes (/api/fixes) routes.
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // not bare JSON — fall through
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(candidate.slice(start, end + 1));
}
