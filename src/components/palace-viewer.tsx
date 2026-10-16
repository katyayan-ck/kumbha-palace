import { useEffect, useRef, useState } from "react";
import type { PalaceHandle } from "@/lib/palace/mount";
import type { PartInfo } from "@/lib/palace/parts";

const VIEWS: { id: string; label: string; caption: string }[] = [
  {
    id: "approach",
    label: "Approach",
    caption: "From the south: Tripolia, the open courts, then Suraj Pol.",
  },
  {
    id: "gallery",
    label: "Gallery",
    caption: "South face: colonnade directly under the great dome, drum arcade open.",
  },
  {
    id: "rani",
    label: "Rani",
    caption: "Sunken zanana light court — ashlar, rubble bands, seat opening onto the lawn.",
  },
  {
    id: "dome",
    label: "Dome",
    caption: "Look up: painted dome, octagonal frame, clerestory light. No later grilles.",
  },
  {
    id: "cliff",
    label: "Cliff",
    caption: "Fort edge: palace above the zigzag curtains and the valley town.",
  },
  {
    id: "court",
    label: "Court",
    caption: "Central court between the diwan and the tall zanana block.",
  },
  {
    id: "diwan",
    label: "Diwan",
    caption: "Diwan-i-Am colonnade, masonry held behind the columns.",
  },
  {
    id: "aerial",
    label: "Aerial",
    caption: "Plan of the palace: open rani well, great dome, Kanwar Pada to the west.",
  },
  {
    id: "zenana",
    label: "Zenana",
    caption: "Inner zenana ranges — later associated with Meerabai and Panna Dhai.",
  },
  {
    id: "bastion",
    label: "Bastion",
    caption: "South-east bastion and the square domed tower beside the tall block.",
  },
  {
    id: "stambh",
    label: "Stambh",
    caption: "Vijay Stambh, nine storeys, standing north-east of the palace.",
  },
  {
    id: "sunrise",
    label: "Sunrise",
    caption: "Low light across the south range and the red laterite terrace.",
  },
];

const TIMES = [
  { id: "morning", label: "Morning" },
  { id: "noon", label: "Noon" },
  { id: "evening", label: "Evening" },
];

export function PalaceViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<PalaceHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [view, setView] = useState<string | null>(null);
  const [time, setTime] = useState("morning");
  const [wire, setWire] = useState(false);
  const [caption, setCaption] = useState(
    "Drag to look. Hover a building, then click it for its history.",
  );
  const [hover, setHover] = useState<PartInfo | null>(null);
  const [pinned, setPinned] = useState<PartInfo | null>(null);

  useEffect(() => {
    let dead = false;
    let dispose = () => {};
    void import("@/lib/palace/mount").then(
      (mod) => {
        if (dead || !canvasRef.current) return;
        const handle = mod.mountPalace(
          canvasRef.current,
          () => {
            if (!dead) setReady(true);
          },
          {
            onHover: (part) => {
              if (!dead) setHover(part);
            },
            onSelect: (part) => {
              if (!dead) setPinned(part);
            },
          },
        );
        handleRef.current = handle;
        dispose = () => handle.dispose();
      },
      (err: unknown) => {
        if (!dead) setFailed(err instanceof Error ? err.message : "The model could not be raised.");
      },
    );
    return () => {
      dead = true;
      dispose();
      handleRef.current = null;
    };
  }, []);

  function pickView(id: string) {
    const next = VIEWS.find((item) => item.id === id);
    setView(id);
    if (next) setCaption(next.caption);
    handleRef.current?.setView(id);
  }

  function pickTime(id: string) {
    setTime(id);
    handleRef.current?.setTime(id);
  }

  function toggleWire() {
    const next = !wire;
    setWire(next);
    handleRef.current?.setWire(next);
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-plaster">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />

      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-sand" />
          <p className="font-display text-3xl">{failed ? "The palace could not be raised" : "Raising the palace"}</p>
          {failed && <p className="max-w-md px-6 text-center font-sans text-sm text-muted">{failed}</p>}
        </div>
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 pt-3">
          <div className="mr-1">
            <h1 className="font-display text-2xl leading-none">Kumbha Palace</h1>
            <p className="font-sans text-xs tracking-wide text-muted">Chittorgarh · Mewar</p>
          </div>
          <div className="pointer-events-auto ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!ready}
              onClick={toggleWire}
              className={
                "min-h-11 border border-sand px-3 font-sans text-sm " +
                (wire ? "bg-sand text-ink" : "bg-ink text-plaster")
              }
            >
              Wire
            </button>
            {TIMES.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!ready}
                onClick={() => pickTime(item.id)}
                className={
                  "min-h-11 border border-muted px-3 font-sans text-sm " +
                  (time === item.id ? "bg-sand text-ink" : "bg-ink text-plaster")
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <nav className="pointer-events-auto flex flex-wrap gap-2 px-3 py-2">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!ready}
              onClick={() => pickView(item.id)}
              className={
                "min-h-11 border border-muted px-3 font-sans text-sm " +
                (view === item.id ? "bg-sand text-ink" : "bg-ink text-plaster")
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-ink px-3 py-2">
        <p className="text-center font-sans text-sm text-plaster">{caption}</p>
        <p className="text-center font-sans text-xs text-muted">
          Hover for the name. Click for the history. Interpretive restoration, not a measured survey.
        </p>
      </footer>

      {(pinned || hover) && (
        <aside className="pointer-events-auto absolute bottom-16 left-3 z-10 max-h-[46vh] w-[min(28rem,calc(100%-1.5rem))] overflow-y-auto border border-sand bg-ink/95 p-3 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl leading-none">{(pinned ?? hover)?.title}</h2>
            {pinned && (
              <button
                type="button"
                className="min-h-11 shrink-0 border border-muted px-3 font-sans text-sm"
                onClick={() => setPinned(null)}
              >
                Close
              </button>
            )}
          </div>
          <p className="mt-2 font-sans text-xs tracking-wide text-sand">{(pinned ?? hover)?.where}</p>
          <p className="mt-1 font-sans text-xs text-muted">{(pinned ?? hover)?.built}</p>
          <p className="mt-2 font-sans text-sm text-plaster">{(pinned ?? hover)?.summary}</p>
          {pinned && <p className="mt-2 font-sans text-sm leading-relaxed text-plaster">{pinned.history}</p>}
          {!pinned && hover && (
            <p className="mt-2 font-sans text-xs text-muted">Click to keep this note open.</p>
          )}
        </aside>
      )}
    </main>
  );
}
