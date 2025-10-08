import { NextResponse } from "next/server";

const RAG_URL = process.env.RAG_SERVER_URL || "http://192.168.70.33:8709/askQuestion/";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query : "";
    const isChat = body?.isChat ?? true;

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}