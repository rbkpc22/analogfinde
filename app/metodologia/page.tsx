import Link from "next/link";
import { DIMS } from "@/lib/data";
import { NASA_POWER_HOME } from "@/lib/nasa";

const POWER_METHOD = "https://power.larc.nasa.gov/docs/methodology/";

export default function MetodologiaPage() {
  return (
    <main className="starfield min-h-dvh text-ink">
      <header className="border-b border-line bg-panel/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="kicker text-muted">NASA Space Apps Challenge 2026</p>
            <h1 className="display text-2xl leading-none">Metodología</h1>
          </div>
          <Link href="/" className="kicker border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent">
            Volver al mapa
          </Link>
        </div>
        <div className="h-px bg-accent" />
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-5 py-8 text-sm leading-relaxed">
        <section>
          <h2 className="display mb-2 text-2xl text-muted">Cómo se calcula el puntaje</h2>
          <p>
            Cada lugar de la Tierra y cada objetivo de la Luna o de Marte se describen con {DIMS.length}{" "}
            categorías, de 0 a 10: {DIMS.map((dim) => dim.name).join(", ")}.
          </p>
          <p className="mt-2">
            El parecido va de 0 a 100. Cada categoría tiene un peso de 0 a 3. El peso 0 no entra en la
            cuenta. Si todos los pesos están en 0, el puntaje es 0. Si falta el valor de una categoría, esa
            no entra al puntaje. El lugar se marca como puntaje parcial e indica cuántas categorías sí
            tienen dato.
          </p>
          <p className="mt-2 border border-line bg-panel px-3 py-2 font-mono text-[13px] text-accent tabular-nums">
            100 × (1 − diferencia promedio ponderada / 10)
          </p>
          <p className="mt-2">
            La diferencia de una categoría es el valor absoluto entre el lugar y el objetivo. Esas
            diferencias se promedian con su peso y el resultado se divide entre 10, el máximo de la escala.
          </p>
          <p className="mt-2">
            Los expedientes de Chihuahua que todavía no tienen este perfil de 9 categorías usan, en su
            lugar, el promedio de su similitud (terreno, suelo, clima, vida y aislamiento), pasada de 0–5 a
            0–100.
          </p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">Qué viene de NASA POWER</h2>
          <p>
            Frío y aridez de los lugares en la Tierra salen de la climatología por punto de NASA POWER,
            comunidad RE, valor anual.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              Frío usa la temperatura media a 2 metros (T2M): 0 si el año promedia 25 °C o más, y 10 si
              promedia −15 °C o menos.
            </li>
            <li>
              Aridez usa la precipitación corregida (PRECTOTCORR): 10 con 0.2 mm/día o menos, y 0 con 4
              mm/día o más.
            </li>
          </ul>
          <p className="mt-2">Entre esos extremos la escala es lineal y el resultado se redondea al entero.</p>
          <p className="mt-2">
            La ficha muestra también la temperatura máxima y la mínima anuales. Esas dos no entran en el
            puntaje. En la interfaz, frío y aridez con climatología aparecen como «Dato NASA».
          </p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">Qué es estimado</h2>
          <p>
            Las otras siete categorías de cada lugar, y todo el perfil del objetivo en la Luna o en Marte,
            son estimaciones del equipo a partir de la literatura. En la interfaz aparecen como «Estimado».
            Una categoría sin número aparece como «— sin dato» y no entra al puntaje.
          </p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">Fuentes</h2>
          <ul className="space-y-2">
            <li>
              <a href={NASA_POWER_HOME} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2">
                NASA POWER
              </a>
              . Climatología por punto usada para T2M, T2M_MAX, T2M_MIN y PRECTOTCORR.
            </li>
            <li>
              <a href={POWER_METHOD} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2">
                Metodología de NASA POWER
              </a>
              . Cómo se construyen los parámetros meteorológicos.
            </li>
          </ul>
          <p className="mt-2">
            Las fuentes de cada lugar (literatura, cartas y páginas institucionales) están en su ficha, en
            la sección Fuentes.
          </p>
        </section>
      </article>
    </main>
  );
}
