"use client";
import { useState, useEffect, useRef } from "react";
import { BookOpen, X, Send, ChevronRight, Loader2, RotateCcw, FlaskConical } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; sources?: string[] };

function playClick(freq = 600) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  } catch { /* no audio context */ }
}

export function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<"hb" | "test">("hb");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setOpen((o) => { playClick(o ? 400 : 700); return !o; });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs, loading]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    playClick(800);
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    const res = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, file }),
    });
    const data = await res.json();
    setMsgs((m) => [...m, { role: "assistant", content: data.answer ?? data.error, sources: data.sources }]);
    setLoading(false);
    playClick(500);
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => { setOpen(true); playClick(700); }}
        aria-label="Open Handbook Copilot (Ctrl+Shift+H)"
        className={`fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ background: "var(--primary)" }}
      >
        <BookOpen className="size-5 text-white" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => { setOpen(false); playClick(400); }}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#0f1117", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-4" style={{ color: "var(--primary)" }} />
            <span className="text-sm font-semibold text-white">Handbook Copilot</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/40 font-mono">⌃⇧H</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setMsgs([]); playClick(600); }} title="Clear chat" className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors active:scale-90">
              <RotateCcw className="size-3.5" />
            </button>
            <button onClick={() => { setOpen(false); playClick(400); }} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors active:scale-90">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {(["hb", "test"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFile(f); playClick(650); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-95 ${file === f ? "text-white" : "text-white/35 hover:text-white/60"}`}
              style={file === f ? { background: "var(--primary)" } : {}}
            >
              {f === "test" && <FlaskConical className="size-3" />}
              {f === "hb" ? "hb.md" : "test.md"}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/20 self-center">source: {file}.md</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
              <BookOpen className="size-8 opacity-20" style={{ color: "var(--primary)" }} />
              <p className="text-xs text-white/30 max-w-52 leading-relaxed">Ask anything about the handbook. Every answer is cited to a specific line.</p>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[88%] ${m.role === "user" ? "text-white rounded-br-sm" : "text-white/85 rounded-bl-sm"}`}
                style={m.role === "user" ? { background: "var(--primary)" } : { background: "rgba(255,255,255,0.07)" }}
              >
                {m.content}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 max-w-[88%]">
                  {m.sources.map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(16,185,129,0.15)", color: "rgb(52,211,153)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="rounded-xl rounded-bl-sm px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                <Loader2 className="size-4 text-white/40 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={`Ask about ${file}.md…`}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="size-7 rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
              style={{ background: "var(--primary)" }}
            >
              {loading ? <Loader2 className="size-3.5 text-white animate-spin" /> : <ChevronRight className="size-3.5 text-white" />}
            </button>
          </div>
          <p className="text-xs text-white/20 mt-2 text-center">Answers grounded in {file}.md only · no hallucination</p>
        </div>
      </div>
    </>
  );
}
