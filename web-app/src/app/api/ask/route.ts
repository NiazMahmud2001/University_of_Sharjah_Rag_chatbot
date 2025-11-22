import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";

const RAG_URL = process.env.RAG_SERVER_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query : "";
    const isChat = body?.isChat ?? true;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!RAG_URL) {
      return NextResponse.json(
        { error: "Server misconfiguration", details: "RAG_SERVER_URL is not set. Add it to .env.local and restart the dev server." },
        { status: 500 }
      );
    }

    let studentPayload: any = null;
    try {
      const supabase = await createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;
      if (userId) {
        const { data } = await supabase
          .from("students")
          .select("uid,completed_courses")
          .eq("id", userId)
          .maybeSingle();
        const uid = String(data?.uid || "");
        const completed = Array.isArray(data?.completed_courses) ? data?.completed_courses : [];
        studentPayload = {
          uid,
          mensOrWomCampus: null,
          standing: null,
          semester: null,
          yearOfStudy: null,
          college: null,
          department: null,
          studentAlreadyCompletedCourses: completed,
          StudentAlreadyCompletedCredits: null,
          student_query: query,
        };
      } else {
        studentPayload = {
          uid: "",
          mensOrWomCampus: null,
          standing: null,
          semester: null,
          yearOfStudy: null,
          college: null,
          department: null,
          studentAlreadyCompletedCourses: [],
          StudentAlreadyCompletedCredits: null,
          student_query: query,
        };
      }
    } catch {}

    const upstream = await fetch(RAG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, isChat, history, studentDummyQuery: studentPayload }),
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