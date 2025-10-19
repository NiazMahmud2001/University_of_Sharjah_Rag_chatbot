import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export type StudyPlanRow = {
  id: number;
  course_code: string;
  course_title: string;
  prerequisites: string[];
  course_semester: string;
  completed: boolean;
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current authenticated user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    // Fetch student's completed courses
    let completedSet = new Set<string>();
    if (userId) {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("completed_courses")
        .eq("id", userId)
        .maybeSingle();
      if (!studentError && student?.completed_courses && Array.isArray(student.completed_courses)) {
        completedSet = new Set(
          (student.completed_courses as string[]).map((c) => String(c).trim().toLowerCase())
        );
      }
    }

    // Fetch study plan courses
    const { data, error } = await supabase
      .from("study_plan_bsc_computer_science")
      .select("id,course_code,course_title,prerequisites,course_semester")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized: StudyPlanRow[] = (data || []).map((row: any) => {
      const course_code = String(row.course_code || "");
      const course_title = String(row.course_title || "");
      const codeNorm = course_code.trim().toLowerCase();
      const titleNorm = course_title.trim().toLowerCase();
      const completed = completedSet.has(codeNorm) || completedSet.has(titleNorm);
      return {
        id: row.id,
        course_code,
        course_title,
        prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
        course_semester: String(row.course_semester || ""),
        completed,
      };
    });

    return NextResponse.json({ data: normalized, studentId: userId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}