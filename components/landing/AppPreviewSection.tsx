"use client";

import { useState, useEffect, useCallback } from "react";

// ─── App definitions ────────────────────────────────────────────────────────

type AppKey = "pwp" | "dwp" | "ip" | "resources";

interface AppDef {
  key: AppKey;
  label: string;
  tagline: string;
  color: string;       // primary gradient start
  colorEnd: string;    // gradient end
  shelf: string;       // bottom-border colour for 3D button effect
  icon: string;
  frames: React.ReactNode[];
}

// ─── CSS Mockup frames (mini app previews) ──────────────────────────────────

function PWPFrame1() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6C5CE7", flexShrink: 0 }} />
        <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436" }}>Level 8 · Adjective on Object</div>
        <div style={{ marginLeft: "auto", background: "#F5C500", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>1240 XP</div>
      </div>
      <div style={{ background: "#EDE9FE", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 10, color: "#6C5CE7", fontWeight: 600 }}>
        🎯 Build a sentence using: Det + Noun + Verb + Adj + Noun
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        {[
          { w: "The", c: "#6C5CE7" }, { w: "dog", c: "#00B894" }, { w: "chased", c: "#E17055" },
          { w: "a", c: "#6C5CE7" }, { w: "fluffy", c: "#0984E3" }, { w: "cat", c: "#00B894" },
        ].map(({ w, c }) => (
          <div key={w} style={{ background: c, color: "#fff", borderRadius: 6, padding: "3px 8px", fontWeight: 700, fontSize: 11, boxShadow: `0 2px 0 ${c}99` }}>{w}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <div style={{ flex: 1, background: "#F5A623", borderRadius: 20, padding: "5px 0", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 11, boxShadow: "0 3px 0 #c97f00" }}>Check ✓</div>
      </div>
    </div>
  );
}

function PWPFrame2() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 24 }}>⭐⭐⭐</div>
        <div style={{ fontWeight: 800, color: "#2D3436", fontSize: 13 }}>Level Complete!</div>
        <div style={{ color: "#636E72", fontSize: 10 }}>+50 XP earned</div>
      </div>
      <div style={{ background: "#D1FAE5", borderRadius: 8, padding: "6px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#065F46" }}>7-day streak!</div>
          <div style={{ fontSize: 9, color: "#059669" }}>Keep it going tomorrow</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
          <div key={d} style={{ flex: 1, background: i < 7 ? "#F5C500" : "#E8E0D5", borderRadius: 4, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: i < 7 ? "#fff" : "#aaa", fontWeight: 700 }}>{d[0]}</div>
        ))}
      </div>
    </div>
  );
}

function DWPFrame1() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>📝</span>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436" }}>Today's Prompt</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "#FEF3C7", borderRadius: 20, padding: "2px 8px" }}>
          <span style={{ fontSize: 10 }}>🔥</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706" }}>4 days</span>
        </div>
      </div>
      <div style={{ background: "#EDE9FE", borderRadius: 8, padding: "8px 10px", marginBottom: 8, color: "#4C3FBF", fontSize: 10, fontStyle: "italic", lineHeight: 1.5 }}>
        "Describe a moment when you felt truly proud of yourself. Use at least two adjectives."
      </div>
      <div style={{ background: "#F8F8F8", border: "1px solid #E8E0D5", borderRadius: 6, padding: "6px 8px", minHeight: 36, color: "#636E72", fontSize: 10 }}>
        I felt proud when I helped my little sister learn to ride her bike…
        <span style={{ display: "inline-block", width: 1, height: 10, background: "#6C5CE7", marginLeft: 1, animation: "blink 1s infinite" }} />
      </div>
    </div>
  );
}

function DWPFrame2() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436", marginBottom: 6 }}>✅ AI Feedback</div>
      {[
        { label: "Vocabulary", score: 4, max: 5, color: "#00B894" },
        { label: "Grammar", score: 5, max: 5, color: "#6C5CE7" },
        { label: "Detail", score: 3, max: 5, color: "#F5A623" },
      ].map(({ label, score, max, color }) => (
        <div key={label} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10 }}>
            <span style={{ fontWeight: 600, color: "#2D3436" }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{score}/{max}</span>
          </div>
          <div style={{ background: "#E8E0D5", borderRadius: 20, height: 5, overflow: "hidden" }}>
            <div style={{ background: color, width: `${(score / max) * 100}%`, height: "100%", borderRadius: 20, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
      <div style={{ background: "#D1FAE5", borderRadius: 6, padding: "5px 8px", marginTop: 4, fontSize: 9, color: "#065F46", lineHeight: 1.4 }}>
        💡 Great use of adjectives! Try adding an adverb next time.
      </div>
    </div>
  );
}

function IPFrame1() {
  const nodes = [
    { n: 1, s: "done", x: 50 }, { n: 2, s: "done", x: 30 }, { n: 3, s: "done", x: 60 },
    { n: 4, s: "current", x: 40 }, { n: 5, s: "next", x: 55 }, { n: 6, s: "locked", x: 35 },
  ];
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436", marginBottom: 8 }}>🗺 World 1 · Story Seeds</div>
      {nodes.map(({ n, s, x }) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, paddingLeft: `${x * 0.4}px` }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: s === "done" ? "radial-gradient(ellipse at 38% 32%, #67E8A0 0%, #27AE60 55%, #1a7a42 100%)" :
                        s === "current" ? "radial-gradient(ellipse at 38% 32%, #ffd97a 0%, #F5A623 55%, #c97f00 100%)" :
                        s === "next" ? "radial-gradient(ellipse at 38% 32%, #b3a8f7 0%, #6C5CE7 55%, #3d35a0 100%)" :
                        "radial-gradient(ellipse at 38% 32%, #ccc 0%, #999 55%, #666 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            boxShadow: s === "current" ? "0 0 0 3px #FEF3C7, 0 0 0 5px #F5A623" : "none",
          }}>
            {s === "done" ? "✓" : s === "current" ? "▶" : s === "next" ? n : "🔒"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: s === "current" ? 700 : 500, fontSize: 10, color: s === "locked" ? "#aaa" : "#2D3436" }}>
              Lesson {n}
            </div>
            {s === "done" && <div style={{ fontSize: 8, color: "#F5C500" }}>★★★</div>}
            {s === "current" && <div style={{ fontSize: 8, color: "#F5A623", fontWeight: 700 }}>In Progress</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function IPFrame2() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436", marginBottom: 6 }}>Lesson 4 · Multiple Choice</div>
      <div style={{ background: "#EDE9FE", borderRadius: 8, padding: "8px", marginBottom: 8, fontSize: 10, color: "#4C3FBF", lineHeight: 1.5 }}>
        Which word is the <strong>verb</strong> in this sentence?<br />
        <em>"The cat <u>sat</u> on the mat."</em>
      </div>
      {["the", "cat", "sat", "mat"].map((opt, i) => (
        <div key={opt} style={{
          background: i === 2 ? "#D1FAE5" : "#F8F8F8",
          border: `1.5px solid ${i === 2 ? "#27AE60" : "#E8E0D5"}`,
          borderRadius: 8, padding: "5px 10px", marginBottom: 4, fontSize: 10,
          fontWeight: i === 2 ? 700 : 400, color: i === 2 ? "#065F46" : "#2D3436",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {i === 2 ? "✓" : "○"} {opt}
        </div>
      ))}
    </div>
  );
}

function ResourcesFrame1() {
  const resources = [
    { icon: "📄", title: "Noun Phrases", type: "Worksheet", color: "#EDE9FE" },
    { icon: "🎯", title: "Verb Tenses", type: "Activity", color: "#D1FAE5" },
    { icon: "📊", title: "Sentence Types", type: "Poster", color: "#FEF3C7" },
    { icon: "✏️", title: "Adjectives Pack", type: "Worksheet", color: "#FEE2E2" },
  ];
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436" }}>📚 Resource Library</div>
        <div style={{ marginLeft: "auto", background: "#EDE9FE", color: "#6C5CE7", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>247 resources</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {resources.map(({ icon, title, type, color }) => (
          <div key={title} style={{ background: color, borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: 9, color: "#2D3436", lineHeight: 1.2 }}>{title}</div>
            <div style={{ fontSize: 8, color: "#636E72", marginTop: 1 }}>{type}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, background: "#F8F8F8", borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 9, color: "#aaa" }}>🔍</span>
        <span style={{ fontSize: 9, color: "#aaa" }}>Search resources…</span>
      </div>
    </div>
  );
}

function ResourcesFrame2() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, padding: "10px 12px" }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#2D3436", marginBottom: 4 }}>Noun Phrases · KS2</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["PDF", "A4", "KS2", "Grammar"].map((tag) => (
          <div key={tag} style={{ background: "#EDE9FE", color: "#6C5CE7", borderRadius: 20, padding: "1px 7px", fontSize: 8, fontWeight: 700 }}>{tag}</div>
        ))}
      </div>
      <div style={{ background: "#F8F8F8", border: "1px solid #E8E0D5", borderRadius: 8, padding: "8px", marginBottom: 8, minHeight: 40 }}>
        <div style={{ fontSize: 9, color: "#636E72", lineHeight: 1.5 }}>
          A comprehensive worksheet on expanding noun phrases using adjectives and determiners...
        </div>
      </div>
      <div style={{ background: "#6C5CE7", borderRadius: 20, padding: "5px 0", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 10, boxShadow: "0 3px 0 #3d35a0", cursor: "pointer" }}>
        🔒 Register to Download
      </div>
    </div>
  );
}

// ─── App registry ────────────────────────────────────────────────────────────

const APPS: AppDef[] = [
  {
    key: "pwp",
    label: "PWP Studio",
    tagline: "Formula-based sentence building with XP and streaks",
    color: "#6C5CE7",
    colorEnd: "#4C3FBF",
    shelf: "#3d35a0",
    icon: "✏️",
    frames: [<PWPFrame1 key="1" />, <PWPFrame2 key="2" />],
  },
  {
    key: "dwp",
    label: "Daily Writing",
    tagline: "AI-assessed daily prompts with personalised feedback",
    color: "#00B894",
    colorEnd: "#007d67",
    shelf: "#005e4e",
    icon: "📝",
    frames: [<DWPFrame1 key="1" />, <DWPFrame2 key="2" />],
  },
  {
    key: "ip",
    label: "Interactive Practice",
    tagline: "Gamified world map with 61 lesson activities",
    color: "#F5A623",
    colorEnd: "#c97f00",
    shelf: "#9a5f00",
    icon: "🎮",
    frames: [<IPFrame1 key="1" />, <IPFrame2 key="2" />],
  },
  {
    key: "resources",
    label: "Resources",
    tagline: "Printable worksheets and teaching materials",
    color: "#0984E3",
    colorEnd: "#0666b0",
    shelf: "#044d88",
    icon: "📚",
    frames: [<ResourcesFrame1 key="1" />, <ResourcesFrame2 key="2" />],
  },
];

// ─── App Card ────────────────────────────────────────────────────────────────

function AppCard({ app, onOpen }: { app: AppDef; onOpen: () => void }) {
  const [frame, setFrame] = useState(0);
  const [fadingIn, setFadingIn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFadingIn(false);
      setTimeout(() => {
        setFrame((f) => (f + 1) % app.frames.length);
        setFadingIn(true);
      }, 250);
    }, 3000);
    return () => clearInterval(id);
  }, [app.frames.length]);

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      aria-label={`Try ${app.label} — opens demo overlay`}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid var(--wrife-border)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
      }}
    >
      {/* Header gradient strip */}
      <div
        style={{
          background: `linear-gradient(135deg, ${app.color} 0%, ${app.colorEnd} 100%)`,
          padding: "14px 16px 10px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{app.icon}</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{app.label}</span>
          <span style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.22)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            Try Free ▶
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 11, margin: 0, lineHeight: 1.4 }}>{app.tagline}</p>
      </div>

      {/* Live CSS mockup — auto-cycles */}
      <div
        style={{
          flex: 1,
          minHeight: 148,
          background: "#FAFAFA",
          borderTop: "1px solid var(--wrife-border)",
          overflow: "hidden",
          opacity: fadingIn ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        {app.frames[frame]}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 16px",
          background: "#fff",
          borderTop: "1px solid var(--wrife-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--wrife-text-muted)" }}>Click to explore live demo</span>
        <span style={{ fontSize: 13, color: app.color }}>→</span>
      </div>
    </div>
  );
}

// ─── Demo Overlay ─────────────────────────────────────────────────────────────

interface OverlayState {
  app: AppDef;
  iframeSrc: string | null;
  loading: boolean;
  error: string | null;
}

function DemoOverlay({ state, onClose }: { state: OverlayState; onClose: () => void }) {
  const { app, iframeSrc, loading, error } = state;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        background: "#000",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${app.label} demo`}
    >
      {/* Header bar */}
      <div
        style={{
          background: `linear-gradient(135deg, ${app.color} 0%, ${app.colorEnd} 100%)`,
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}
      >
        <span style={{ fontSize: 20 }}>{app.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, lineHeight: 1.2 }}>{app.label} — Demo</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>You're browsing as a demo guest · Downloads require a free account</div>
        </div>
        <a
          href="/register"
          style={{
            background: "var(--wrife-orange)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            padding: "7px 18px",
            borderRadius: 24,
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 0 #c97f00",
            flexShrink: 0,
          }}
        >
          Register Free →
        </a>
        <button
          onClick={onClose}
          aria-label="Close demo"
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            borderRadius: 8,
            color: "#fff",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Iframe / loading / error */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--wrife-bg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: `4px solid ${app.color}`,
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "var(--wrife-text-muted)", fontSize: 14, margin: 0 }}>
              Starting your demo session…
            </p>
          </div>
        )}
        {error && (
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--wrife-bg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, padding: 24, textAlign: "center",
          }}>
            <span style={{ fontSize: 40 }}>⚠️</span>
            <p style={{ fontWeight: 700, color: "var(--wrife-text-main)", margin: 0, fontSize: 16 }}>Couldn't start demo</p>
            <p style={{ color: "var(--wrife-text-muted)", margin: 0, fontSize: 13, maxWidth: 340 }}>{error}</p>
            <a href="/register" style={{ marginTop: 8, background: app.color, color: "#fff", fontWeight: 700, padding: "10px 24px", borderRadius: 24, textDecoration: "none", fontSize: 14 }}>
              Register Free Instead →
            </a>
          </div>
        )}
        {iframeSrc && !loading && !error && (
          <iframe
            src={iframeSrc}
            title={`${app.label} demo`}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="storage-access"
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function AppPreviewSection() {
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const openDemo = useCallback(async (app: AppDef) => {
    setOverlay({ app, iframeSrc: null, loading: true, error: null });
    try {
      const res = await fetch(`/api/demo-token?app=${app.key}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { iframeSrc?: string; error?: string };
      if (data.error || !data.iframeSrc) throw new Error(data.error ?? "Missing iframe URL");
      setOverlay((prev) => prev ? { ...prev, iframeSrc: data.iframeSrc!, loading: false } : null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setOverlay((prev) => prev ? { ...prev, loading: false, error: msg } : null);
    }
  }, []);

  const closeOverlay = useCallback(() => setOverlay(null), []);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <section id="try-it" className="w-full py-16" style={{ backgroundColor: "var(--wrife-bg)" }}>
        {/* Section header */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: "var(--wrife-blue-soft)", color: "var(--wrife-blue)" }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--wrife-blue)" }}
            />
            Live Demo — no account needed
          </div>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
          >
            Experience the WriFe Difference
          </h2>
          <p style={{ color: "var(--wrife-text-muted)" }} className="text-lg max-w-2xl mx-auto">
            Click any app below to browse it live as a demo guest. Downloads and saving require a free account.
          </p>
        </div>

        {/* 4-card grid */}
        <div className="px-4 md:px-8">
          <div
            className="mx-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
              maxWidth: 1400,
            }}
          >
            {APPS.map((app) => (
              <AppCard key={app.key} app={app} onOpen={() => openDemo(app)} />
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 text-center">
          <p style={{ color: "var(--wrife-text-muted)" }} className="mb-4">
            Loved what you saw? Get full access to all 67 lessons, AI assessments, and class management tools.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white rounded-full shadow-soft hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--wrife-orange)" }}
          >
            Start Your Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* Fullscreen overlay — portal-like, rendered at end of document */}
      {overlay && <DemoOverlay state={overlay} onClose={closeOverlay} />}
    </>
  );
}
