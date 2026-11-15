"use client";

import { useEffect, useRef, useState } from "react";
import { buildDeck, scoreMessage, type Planet, type Round } from "@/lib/game";

const CHOICES: { id: Planet; label: string }[] = [
  { id: "tierra", label: "Tierra" },
  { id: "luna", label: "Luna" },
  { id: "marte", label: "Marte" },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default function PlanetGame({
  onClose,
  onShow,
}: {
  onClose: () => void;
  onShow: (round: Round) => void;
}) {
  const [rounds, setRounds] = useState<Round[]>(() => buildDeck());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Planet | null>(null);
  const [finished, setFinished] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const round = rounds[index];
  const correct = picked !== null && picked === round.planet;
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!picked) return;
    resultRef.current?.scrollIntoView({ block: "nearest" });
  }, [picked, index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function answer(planet: Planet) {
    if (picked) return;
    setPicked(planet);
    if (planet === round.planet) setScore((value) => value + 1);
  }

  function next() {
    if (index >= rounds.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
    setImageFailed(false);
  }

  function replay() {
    setRounds(buildDeck());
    setIndex(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
    setImageFailed(false);
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#050505] text-ink">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-title"
        className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-5"
      >
        <div className="flex items-start justify-between gap-4">
          <button type="button" onClick={onClose} className="kicker border border-line px-3 py-2 hover:border-accent hover:text-accent">
            Cerrar
          </button>
          <p className="font-mono text-2xl leading-none">{pad(score)}/10</p>
        </div>

        {finished ? (
          <div className="brackets relative my-auto border border-line px-5 py-8">
            <p className="kicker text-muted">Resultado</p>
            <p className="font-mono mt-3 text-5xl leading-none">{pad(score)}/10</p>
            <h2 id="game-title" className="display mt-5 text-[clamp(28px,6vw,48px)]">
              ¿Tierra, Luna o Marte?
            </h2>
            <p className="mt-4 max-w-sm text-sm text-ink">{scoreMessage(score)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={replay}
                className="kicker border border-accent px-3 py-2 text-accent"
              >
                Jugar otra vez
              </button>
              <button type="button" onClick={onClose} className="kicker border border-line px-3 py-2 hover:border-accent">
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-1 flex-col">
            <p className="kicker text-muted">Ronda {pad(index + 1)} · 10</p>
            <h2 id="game-title" className="display mt-2 text-[clamp(22px,5vw,40px)]">
              ¿Tierra, Luna o Marte?
            </h2>
            <div className="brackets relative mx-auto mt-4 aspect-square w-[min(100%,calc(100dvh-250px))] max-w-[440px] border border-line bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imageFailed ? null : (
                <img
                  key={round.image}
                  src={round.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {CHOICES.map((choice) => {
                const isAnswer = picked !== null && choice.id === round.planet;
                const isWrong = picked === choice.id && choice.id !== round.planet;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => answer(choice.id)}
                    className={`kicker border px-2 py-3 ${
                      isAnswer
                        ? "border-accent text-accent"
                        : isWrong
                          ? "border-white/30 text-muted"
                          : picked
                            ? "border-line text-muted"
                            : "border-line hover:border-accent hover:text-accent"
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
            {picked ? (
              <div ref={resultRef} className="mt-5">
                <p className="display text-2xl">{correct ? "Acertaste" : "Fallaste"}</p>
                <p className="mt-2 text-sm">Es {round.place}.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onShow(round)}
                    className="kicker border border-accent px-3 py-2 text-accent"
                  >
                    Ver en el globo
                  </button>
                  <button type="button" onClick={next} className="kicker border border-line px-3 py-2 hover:border-accent">
                    {index >= rounds.length - 1 ? "Resultado" : "Siguiente"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
