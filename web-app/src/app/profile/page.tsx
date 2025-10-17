"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createSupabaseClient } from "@/utils/supabase/browser";
import Image from "next/image";

type Student = {
  id: string;
  name: string;
  email: string;
  bod: string; // ISO date
  current_year: number;
  semester: number;
  college: string;
  department: string;
  degree: string;
  completed_courses: string[];
  uid: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      let supabase;
      try {
        supabase = createSupabaseClient();
      } catch (err: any) {
        setError(err?.message || "Supabase is not configured.");
        setLoading(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("id,name,email,bod,current_year,semester,college,department,degree,completed_courses,uid")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setError(error.message);
      } else {
        setStudent(data as Student | null);
      }
      setLoading(false);
    }
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [router]);

  const formattedBod = useMemo(() => {
    if (!student?.bod) return "";
    try {
      const d = new Date(student.bod);
      return d.toLocaleDateString();
    } catch {
      return String(student.bod);
    }
  }, [student]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-zinc-600">Loading profile…</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          No profile data found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/b.svg" alt="Logo" width={80} height={60} className="h-10 w-auto" />
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-zinc-500">Welcome back, {student.name.split(" ")[0]}.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Name" value={student.name} />
              <Field label="Email" value={student.email} />
              <Field label="Date of Birth" value={formattedBod} />
              <Field label="College" value={student.college} />
              <Field label="Department" value={student.department} />
              <Field label="Degree" value={student.degree} />
              <Field label="Current Year" value={String(student.current_year)} />
              <Field label="Semester" value={String(student.semester)} />
              <Field label="UID" value={student.uid} />
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Completed Courses</h2>
            {student.completed_courses?.length ? (
              <ul className="space-y-2 text-sm">
                {student.completed_courses.map((c, i) => (
                  <li key={i} className="rounded-lg border border-black/10 bg-background px-3 py-2">
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No courses recorded yet.</p>
            )}
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs text-zinc-500">Signed in as {student.email}</div>
          <button
            onClick={async () => {
              try {
                const supabase = createSupabaseClient();
                await supabase.auth.signOut();
              } catch {
                // ignore, we will still route to login
              } finally {
                router.replace("/login");
              }
            }}
            className="h-10 px-4 rounded-xl border border-black/10 bg-background hover:bg-zinc-100 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="rounded-xl border border-black/10 bg-background px-3 py-2">
        {value}
      </div>
    </div>
  );
}