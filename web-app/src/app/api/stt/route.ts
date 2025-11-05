import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY on server" }, { status: 500 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file as any).arrayBuffer) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const outgoing = new FormData();
    outgoing.append("file", file as Blob);
    outgoing.append("model", "whisper-large-v3-turbo");
    // optional: temperature, response_format
    // outgoing.append("temperature", "0");
    // outgoing.append("response_format", "verbose_json");

    const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: outgoing,
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "Transcription failed", details: text }, { status: 500 });
    }
    const json = await resp.json();
    return NextResponse.json({ text: json.text ?? "" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}