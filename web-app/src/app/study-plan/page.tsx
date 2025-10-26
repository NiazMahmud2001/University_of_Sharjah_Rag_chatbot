"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import SplitText from "../components/SplitText";
import { Background, Controls, ReactFlow, MiniMap, Node, Edge, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import type { StudyPlanRow } from "../api/study-plan/route";
import { Search, LayoutGrid, GitBranch, Check, Info, X } from "lucide-react";
import { createClient as createSupabaseClient } from "@/utils/supabase/browser";
import ELK from "elkjs/lib/elk.bundled.js";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Helpers to parse semester strings like "Year 1 - 1st semester"
function parseSemester(s: string): { year: number; sem: number; raw: string } {
  const match = s.match(/Year\s*(\d+)\s*-\s*(\d+)(?:st|nd|rd|th)\s*semester/i);
  if (!match) return { year: 999, sem: 999, raw: s };
  return { year: Number(match[1] || 999), sem: Number(match[2] || 999), raw: s };
}

function formatCode(code: string) {
  return code.replace(/\s+/g, "");
}

type ViewMode = "list" | "graph";

export default function StudyPlanPage() {
  const [data, setData] = useState<StudyPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("graph");
  const [search, setSearch] = useState("");
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Make cache user-specific to reflect completed courses per student
        let userId: string | null = null;
        try {
          const supabase = createSupabaseClient();
          const { data: userData } = await supabase.auth.getUser();
          userId = userData?.user?.id || null;
        } catch {}
        const keyBase = "nexly:studyplan:v2";
        const key = userId ? `${keyBase}:${userId}` : `${keyBase}:anon`;
        const ttlMs = 24 * 60 * 60 * 1000; // 24 hours
        const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        let usedCache = false;
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (cached && Array.isArray(cached.data) && Number(cached.ts) && Date.now() - Number(cached.ts) < ttlMs) {
              setData(cached.data as StudyPlanRow[]);
              setError(null);
              usedCache = true;
            }
          } catch {}
        }
        if (!usedCache) {
          const res = await fetch("/api/study-plan", { cache: "no-store" });
          if (res.ok) {
            let json: any = null;
            try { json = await res.json(); } catch {}
            const rows = Array.isArray(json?.data) ? (json.data as StudyPlanRow[]) : [];
            setData(rows);
            setError(null);
            try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: rows })); } catch {}
          } else {
            let errMsg = res.statusText || `HTTP ${res.status}`;
            try {
              const js = await res.json();
              if (js?.error) errMsg = js.error;
            } catch {}
            setError(errMsg || "Failed to load study plan");
          }
        }
      } catch {
        setError("Failed to load study plan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      return (
        row.course_code.toLowerCase().includes(q) ||
        row.course_title.toLowerCase().includes(q) ||
        row.course_semester.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const semesters = useMemo(() => {
    const uniq = new Map<string, { year: number; sem: number; raw: string }>();
    filtered.forEach((r) => {
      const p = parseSemester(r.course_semester);
      uniq.set(p.raw, p);
    });
    return Array.from(uniq.values()).sort((a, b) => a.year - b.year || a.sem - b.sem);
  }, [filtered]);

  const bySemester = useMemo(() => {
    const map = new Map<string, StudyPlanRow[]>();
    semesters.forEach((s) => map.set(s.raw, []));
    filtered.forEach((r) => {
      const key = parseSemester(r.course_semester).raw;
      const arr = map.get(key)!;
      arr.push(r);
    });
    for (const [key, arr] of map.entries()) {
      arr.sort((a, b) => a.course_code.localeCompare(b.course_code));
    }
    return map;
  }, [filtered, semesters]);

  const makeUnifiedBlue = (idx: number) => {
    const hue = 215; // unified blue hue
    const sat = 78; // saturation
    const lightBase = 92; // starting lightness for earliest semester
    const step = 5; // decrease lightness per semester for differentiation
    const l = Math.max(70, lightBase - idx * step);
    const fill = `hsl(${hue} ${sat}% ${l}% / 1)`; // node/list background tint
    const border = `hsl(${hue} ${sat + 10}% ${Math.max(40, l - 35)}% / 1)`; // list border accent
    const edge = `hsl(${hue} ${sat + 5}% ${Math.max(35, l - 45)}% / 0.9)`; // edges
    return { fill, border, edge };
  };

  const colorsBySemester = useMemo(() => {
    const m = new Map<string, { fill: string; border: string; edge: string }>();
    semesters.forEach((s, i) => m.set(s.raw, makeUnifiedBlue(i)));
    return m;
  }, [semesters]);

  const layout = useMemo(() => {
    const laneWidth = 340;
    const rowHeight = 120;
    const xPadding = 40;
    const yPadding = 40;
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const semesterIndex = new Map<string, number>();
    semesters.forEach((s, i) => semesterIndex.set(s.raw, i));

    const positionMap = new Map<string, { x: number; y: number }>();

    semesters.forEach((s) => {
      const i = semesterIndex.get(s.raw)!;
      const list = bySemester.get(s.raw) || [];
      const colors = colorsBySemester.get(s.raw);
      list.forEach((row, j) => {
        const x = xPadding + i * laneWidth;
        const y = yPadding + j * rowHeight;
        positionMap.set(row.course_code, { x, y });
        nodes.push({
          id: row.course_code,
          position: { x, y },
          data: { label: (
            <div className="flex items-start gap-2">
              {row.completed ? <Check className="w-4 h-4 text-green-600 mt-0.5" aria-label="Completed" /> : null}
              <div>
                <div className="text-sm font-semibold">{row.course_code}</div>
                <div className="text-xs text-muted-foreground">{row.course_title}</div>
              </div>
            </div>
          ), completed: row.completed },
          style: {
            border: "none",
            borderRadius: 10,
            padding: 12,
            background: row.completed ? "#dcfce7" : (colors?.fill || "var(--card)"),
            color: "var(--foreground)",
            width: 300,
            boxShadow: activeCode === row.course_code ? "0 0 0 4px rgba(59,130,246,0.25)" : "none",
            whiteSpace: "pre-line",
          },
          selectable: true,
        });
      });
    });

    filtered.forEach((row) => {
      row.prerequisites.forEach((pre) => {
        const src = formatCode(pre);
        const dst = row.course_code;
        if (!positionMap.has(src) || !positionMap.has(dst)) return;
        const semKey = parseSemester(row.course_semester).raw;
        const edgeColor = colorsBySemester.get(semKey)?.edge || "#475569";
        edges.push({ id: `${src}->${dst}`, source: src, target: dst, animated: false, style: { stroke: edgeColor, strokeWidth: 2, opacity: 0.9 } });
      });
    });

    return { nodes, edges };
  }, [filtered, semesters, bySemester, activeCode, colorsBySemester]);

  const containerRef = useRef<HTMLDivElement>(null);
  const rfRef = useRef<any>(null);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  useEffect(() => {
    rfRef.current?.fitView({ padding: 0.2 });
  }, [flowNodes, flowEdges]);
  useEffect(() => {
    const elk = new ELK();
    const run = async () => {
      const baseNodes = layout.nodes;
      const baseEdges = layout.edges;
      const elkGraph: any = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "DOWN",
          "elk.spacing.nodeNode": "40",
          "elk.layered.spacing.nodeNodeBetweenLayers": "80",
          "elk.edgeRouting": "ORTHOGONAL",
          "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
          "elk.layered.crossingMinimization.strategy": "INTERACTIVE",
          "elk.layered.allowEdgeReversal": "false",
        },
        children: baseNodes.map((n) => ({ id: n.id, width: 300, height: 100 })),
        edges: baseEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
      };
      try {
        const res = await elk.layout(elkGraph);
        const posMap = new Map<string, { x: number; y: number }>();
        (res.children || []).forEach((c: any) => {
          posMap.set(c.id, { x: c.x || 0, y: c.y || 0 });
        });
        const nodes = baseNodes.map((n) => ({ ...n, position: posMap.get(n.id) || n.position }));
        const edges = baseEdges.map((e) => ({ ...e, type: "smoothstep" }));
        setFlowNodes(nodes);
        setFlowEdges(edges);
      } catch (err) {
        console.error("ELK layout failed", err);
        setFlowNodes(baseNodes);
        setFlowEdges(baseEdges);
      }
    };
    run();
  }, [layout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInfo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground md:pl-72">
      <aside className="fixed left-0 top-0 h-full w-72 p-4 border-r bg-white text-zinc-900 border-black/10 hidden md:flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Navigation</div>
        </div>
        <div className="mt-3">
          <button
            onClick={() => router.push("/")}
            className="w-full p-3 rounded-xl border border-black/10 hover:bg-zinc-100 text-left flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full border border-black/10 bg-zinc-50 flex items-center justify-center">
              <ArrowLeft size={18} className="text-zinc-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 truncate">Back Home</div>
              <div className="text-xs text-zinc-500 truncate">Return to chat</div>
            </div>
          </button>
        </div>
      </aside>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SplitText tag="h1" text="BSc Computer Science Study Plan" className="text-2xl sm:text-3xl font-semibold" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 border bg-card"
              aria-expanded={showInfo}
              aria-controls="plan-info-overlay"
            >
              <Info className="w-4 h-4" />
              Plan Info
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 border ${view === "list" ? "bg-secondary" : "bg-card"}`}
              aria-pressed={view === "list"}
            >
              <LayoutGrid className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("graph")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 border ${view === "graph" ? "bg-secondary" : "bg-card"}`}
              aria-pressed={view === "graph"}
            >
              <GitBranch className="w-4 h-4" />
              Graph
            </button>
          </div>
        </div>

        {showInfo && (
          <div id="plan-info-overlay" className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowInfo(false)} />
            <div
              className="fixed right-6 top-24 w-[min(90vw,420px)] max-h-[70vh] overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="plan-info-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 id="plan-info-title" className="text-sm font-medium">Study Plan Info</h2>
                <button
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 border bg-card"
                  aria-label="Close"
                  onClick={() => setShowInfo(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium mb-2">Colors</div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#dcfce7" }} />
                      <span>Green = completed</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#93c5fd" }} />
                      <span>Blue shades = not completed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium mb-2">Semester Key</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {semesters.map((s) => {
                      const c = colorsBySemester.get(s.raw);
                      return (
                        <span key={s.raw} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md border" style={{ background: c?.fill || "var(--card)", color: "var(--foreground)" }}>
                          {s.raw}
                        </span>
                      );
                    })}
                    {semesters.length === 0 && (
                      <span className="text-xs text-muted-foreground">No semesters loaded yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}





        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by code, title, or semester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-card-foreground"
            />
          </div>
        </div>

        {loading && (
          <div className="mt-8 animate-pulse">
            <div className="flex items-center justify-between gap-4">
              <div className="h-8 w-64 bg-muted rounded-md" />
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-muted rounded-md" />
                <div className="h-9 w-20 bg-muted rounded-md" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="inline-block h-6 w-28 rounded-md bg-muted" />
              ))}
            </div>

            <div className="mt-6">
              <div className="h-9 w-full rounded-md bg-muted" />
            </div>

            {view === "list" ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-4 w-20 bg-muted rounded" />
                    </div>
                    <ul className="divide-y">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <li key={j} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2">
                              <div className="h-4 w-4 bg-muted rounded" />
                              <div>
                                <div className="h-4 w-48 bg-muted rounded mb-2" />
                                <div className="h-3 w-32 bg-muted rounded" />
                              </div>
                            </div>
                            <div className="h-3 w-24 bg-muted rounded" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 h-[70vh] rounded-xl border overflow-hidden bg-card">
                <div className="w-full h-full bg-muted" />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 text-destructive">{error}</div>
        )}

        {!loading && !error && view === "list" && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((s) => {
              const list = bySemester.get(s.raw) || [];
              const c = colorsBySemester.get(s.raw);
              return (
                <div key={s.raw} className="rounded-xl border bg-card">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="font-medium">{s.raw}</h3>
                    <span className="text-sm text-muted-foreground">{list.length} course{list.length !== 1 ? "s" : ""}</span>
                  </div>
                  <ul className="divide-y">
                    {list.map((row) => (
                      <li key={row.id} className="px-4 py-3 hover:bg-secondary cursor-pointer" onClick={() => setActiveCode(row.course_code)} style={{ borderLeft: `4px solid ${c?.border || "var(--border)"}` }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2">
                            {row.completed && <Check className="w-4 h-4 text-green-600" aria-label="Completed" />}
                            <div>
                              <div className="text-sm font-medium">{row.course_title}</div>
                              <div className="text-xs text-muted-foreground">{row.course_code}</div>
                            </div>
                          </div>
                          {row.prerequisites.length > 0 && (
                            <div className="text-xs text-muted-foreground">Prerequisites: {row.prerequisites.join(", ")}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && view === "graph" && (
          <div ref={containerRef} className="mt-8 h-[70vh] rounded-xl border overflow-hidden">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={1.5}
              nodesDraggable={false}
              nodesConnectable={false}
              onInit={(inst) => {
                rfRef.current = inst;
                inst.fitView({ padding: 0.2 });
              }}
            >
              <Background />
              <MiniMap nodeColor={(node) => ((node.data as any)?.completed ? "#22c55e" : "#93c5fd")} />
              <Controls />
            </ReactFlow>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 text-sm text-muted-foreground">
            Tip: Click a course in the list to highlight it in the graph.
          </div>
        )}
      </div>
    </div>
  );
}