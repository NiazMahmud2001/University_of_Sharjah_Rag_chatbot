import { NextResponse } from "next/server";

const RAG_URL = process.env.RAG_SERVER_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query : "";
    const isChat = body?.isChat ?? true;

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!RAG_URL) {
      return NextResponse.json(
        { error: "Server misconfiguration", details: "RAG_SERVER_URL is not set. Add it to .env.local and restart the dev server." },
        { status: 500 }
      );
    }

    const upstream = await fetch(RAG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, isChat }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: "Upstream error", details: text },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    // Expecting { answer: string }
    return NextResponse.json({ answer: data?.answer ?? "" });
  } catch (err: any) {
    console.error("/api/ask proxy failed", { RAG_URL, message: err?.message, name: err?.name, cause: err?.cause });
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}