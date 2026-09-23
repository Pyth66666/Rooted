import { ADVISOR_VERSION, matchDemo, parseAdvisorAnswers } from "@/lib/advisor";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ error: "Request too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid answers." }, { status: 400 }); }
  const answers = parseAdvisorAnswers(body);
  if (!answers) return Response.json({ error: "Please review your answers." }, { status: 400 });
  return Response.json({ version: ADVISOR_VERSION, catalogue: "Demonstration catalogue", recommendations: matchDemo(answers) }, { headers: { "Cache-Control": "no-store" } });
}
