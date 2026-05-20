import { useState, useEffect, useCallback, useRef } from "react";

const FONT_DISPLAY = "'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

const SLIDES = [
  { id: "cover", label: "portada", kicker: "00 · PORTADA", title: "Sistema de Diseño" },
  { id: "palette", label: "paleta", kicker: "01 · PALETA", title: "Primario y Neutro" },
  { id: "semantic", label: "estado", kicker: "02 · ESTADO", title: "Señales Semánticas" },
  { id: "type", label: "tipo", kicker: "03 · TIPO", title: "Tipografía" },
  { id: "space", label: "espacio", kicker: "04 · ESPACIO", title: "Sistema de Espaciado" },
  { id: "components", label: "componentes", kicker: "05 · COMPONENTES", title: "Componentes" },
];

const KEY_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

export default function StyleGuidePage() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = SLIDES.length;

  const go = useCallback(
    (next) => {
      setIndex((curr) => {
        const target =
          typeof next === "function" ? next(curr) : Number(next);
        const clamped = Math.max(0, Math.min(total - 1, target));
        setDirection(clamped >= curr ? 1 : -1);
        return clamped;
      });
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go((i) => i + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          go((i) => i - 1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(total - 1);
          break;
        default:
          if (KEY_TO_INDEX[e.key] !== undefined) {
            e.preventDefault();
            go(KEY_TO_INDEX[e.key]);
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, total]);

  const current = SLIDES[index];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-50 text-slate-900"
      style={{ fontFamily: FONT_DISPLAY }}
    >
      <BlueprintGrid />

      <DeckChrome
        index={index}
        total={total}
        slide={current}
      />

      <main className="absolute inset-0 flex items-center justify-center px-10 sm:px-16 lg:px-24 pt-24 pb-28">
        <div
          key={current.id}
          data-direction={direction}
          className="w-full max-w-[1280px] h-full animate-[slide-in_360ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          <SlideRouter id={current.id} />
        </div>
      </main>

      <DeckFooter index={index} total={total} go={go} />

      <DeckKeyframes />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Persistent chrome                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

function BlueprintGrid() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

function DeckChrome({ index, total, slide }) {
  return (
    <header className="absolute top-0 inset-x-0 z-10 px-10 sm:px-16 lg:px-24 pt-8 pb-4 flex items-start justify-between gap-6">
      <div className="flex items-baseline gap-3">
        <span
          className="text-[11px] tracking-[0.22em] text-blue-700 font-medium"
          style={{ fontFamily: FONT_MONO }}
        >
          INDUSTRIAL · MONITOR
        </span>
        <span className="h-px w-12 bg-slate-300" />
        <span
          className="text-[11px] tracking-[0.22em] text-slate-500"
          style={{ fontFamily: FONT_MONO }}
        >
          SISTEMA · DE · DISEÑO · v1.0
        </span>
      </div>

      <div
        className="hidden md:block text-right"
        style={{ fontFamily: FONT_MONO }}
      >
        <div className="text-[11px] tracking-[0.18em] text-slate-500">
          {slide.kicker}
        </div>
        <div className="text-[11px] tracking-[0.18em] text-slate-700 mt-0.5">
          BLK {String(index).padStart(2, "0")} / {String(total - 1).padStart(2, "0")}
        </div>
      </div>
    </header>
  );
}

function DeckFooter({ index, total, go }) {
  return (
    <footer className="absolute bottom-0 inset-x-0 z-10 px-10 sm:px-16 lg:px-24 pb-8 pt-4">
      <div className="flex items-center justify-between gap-6">
        <NavButton
          disabled={index === 0}
          onClick={() => go((i) => i - 1)}
          direction="prev"
        />

        <div className="flex items-center gap-10">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir a ${s.title}`}
              aria-current={i === index ? "true" : undefined}
              className={`group relative flex items-center justify-center w-2 h-2 cursor-pointer`}
            >
              <span
                className={`block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "bg-blue-600 scale-150"
                    : i < index
                    ? "bg-slate-400"
                    : "bg-slate-300 group-hover:bg-slate-400"
                }`}
              />
              <span
                className={`hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.18em] uppercase whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
                  i === index ? "text-blue-700 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"
                }`}
                style={{ fontFamily: FONT_MONO }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <NavButton
          disabled={index === total - 1}
          onClick={() => go((i) => i + 1)}
          direction="next"
        />
      </div>
    </footer>
  );
}

function NavButton({ direction, disabled, onClick }) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-3 px-4 py-2 border-2 border-slate-300 bg-white/60 backdrop-blur-sm transition-all duration-200 ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:border-blue-600 hover:bg-blue-50 cursor-pointer"
      }`}
      style={{ fontFamily: FONT_MONO }}
    >
      {isPrev && (
        <span className="text-blue-700 transition-transform duration-200 group-hover:-translate-x-0.5">
          ←
        </span>
      )}
      <span className="text-[11px] tracking-[0.22em] text-slate-700">
        {isPrev ? "ANT" : "SIG"}
      </span>
      {!isPrev && (
        <span className="text-blue-700 transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      )}
    </button>
  );
}

function Kbd({ children }) {
  return (
    <span className="px-1.5 py-0.5 border border-slate-300 bg-white text-slate-600 leading-none">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide router                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

function SlideRouter({ id }) {
  switch (id) {
    case "cover":
      return <CoverSlide />;
    case "palette":
      return <PaletteSlide />;
    case "semantic":
      return <SemanticSlide />;
    case "type":
      return <TypeSlide />;
    case "space":
      return <SpaceSlide />;
    case "components":
      return <ComponentsSlide />;
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Cover                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

function CoverSlide() {
  return (
    <section className="h-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span
            className="text-[11px] tracking-[0.28em] text-blue-700"
            style={{ fontFamily: FONT_MONO }}
          >
            INDUSTRIAL MONITOR / LENGUAJE VISUAL
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-[112px] font-light leading-[0.92] text-slate-900 tracking-[-0.03em]">
          Sistema
          <br />
          <span className="font-semibold text-blue-700">/ de Diseño.</span>
        </h1>

        <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Referencia del lenguaje visual azul-pizarra que da forma a la
          plataforma en su v1 — los tokens, la tipografía, el espacio y las
          piezas detrás de cada panel, alerta y datapoint.
        </p>

        <div
          className="text-[11px] tracking-[0.22em] text-slate-500 pt-4"
          style={{ fontFamily: FONT_MONO }}
        >
          PULSA <Kbd>→</Kbd> O <Kbd>ESPACIO</Kbd> PARA AVANZAR
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Palette (primary + neutral)                                      */
/* ─────────────────────────────────────────────────────────────────────── */

const BLUE_RAMP = [
  ["50", "#eff6ff", "bg-blue-50", "text-slate-900"],
  ["100", "#dbeafe", "bg-blue-100", "text-slate-900"],
  ["200", "#bfdbfe", "bg-blue-200", "text-slate-900"],
  ["300", "#93c5fd", "bg-blue-300", "text-slate-900"],
  ["400", "#60a5fa", "bg-blue-400", "text-white"],
  ["500", "#3b82f6", "bg-blue-500", "text-white"],
  ["600", "#2563eb", "bg-blue-600", "text-white"],
  ["700", "#1d4ed8", "bg-blue-700", "text-white"],
  ["800", "#1e40af", "bg-blue-800", "text-white"],
  ["900", "#1e3a8a", "bg-blue-900", "text-white"],
  ["950", "#172554", "bg-blue-950", "text-white"],
];

const SLATE_RAMP = [
  ["50", "#f8fafc", "bg-slate-50", "text-slate-900"],
  ["100", "#f1f5f9", "bg-slate-100", "text-slate-900"],
  ["200", "#e2e8f0", "bg-slate-200", "text-slate-900"],
  ["300", "#cbd5e1", "bg-slate-300", "text-slate-900"],
  ["400", "#94a3b8", "bg-slate-400", "text-white"],
  ["500", "#64748b", "bg-slate-500", "text-white"],
  ["600", "#475569", "bg-slate-600", "text-white"],
  ["700", "#334155", "bg-slate-700", "text-white"],
  ["800", "#1e293b", "bg-slate-800", "text-white"],
  ["900", "#0f172a", "bg-slate-900", "text-white"],
  ["950", "#020617", "bg-slate-950", "text-white"],
];

function PaletteSlide() {
  return (
    <section className="h-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      <RampColumn
        title="Primario"
        familyLabel="Azul"
        family="blue"
        ramp={BLUE_RAMP}
        anchor="600"
        anchorRole="Acento por defecto — botones, enlaces, focus, marca."
      />
      <RampColumn
        title="Neutro"
        familyLabel="Pizarra"
        family="slate"
        ramp={SLATE_RAMP}
        anchor="700"
        anchorRole="Texto principal por defecto; las superficies bajan desde el 50."
      />
    </section>
  );
}

function RampColumn({ title, familyLabel, family, ramp, anchor, anchorRole }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex items-baseline justify-between mb-6">
        <div>
          <div
            className="text-[11px] tracking-[0.28em] text-slate-500"
            style={{ fontFamily: FONT_MONO }}
          >
            {title.toUpperCase()}
          </div>
          <h2 className="text-4xl font-semibold text-slate-900 mt-1">
            {familyLabel}
          </h2>
        </div>
        <code
          className="text-xs text-slate-500 tracking-[0.12em]"
          style={{ fontFamily: FONT_MONO }}
        >
          tailwind / {family}-*
        </code>
      </header>

      <div className="grid grid-cols-1 gap-1 flex-1 min-h-0">
        {ramp.map(([step, hex, bg, fg]) => (
          <div
            key={step}
            className={`${bg} ${fg} flex items-center justify-between px-5 py-2.5 transition-transform duration-200 hover:translate-x-1 ${
              step === anchor
                ? "ring-2 ring-offset-2 ring-offset-slate-50 ring-blue-700"
                : ""
            }`}
            style={{ fontFamily: FONT_MONO }}
          >
            <div className="flex items-center gap-4">
              <span className="text-xs tracking-[0.18em] opacity-80">
                {family}-{step}
              </span>
              {step === anchor && (
                <span className="text-[9px] tracking-[0.28em] opacity-90 px-1.5 py-0.5 border border-current">
                  ANCLA
                </span>
              )}
            </div>
            <span className="text-xs tracking-[0.12em]">{hex}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-600 leading-relaxed">
        <span
          className="text-blue-700 tracking-[0.12em] text-xs mr-2"
          style={{ fontFamily: FONT_MONO }}
        >
          /{anchor}
        </span>
        {anchorRole}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Semantic                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

const SEMANTIC = [
  {
    label: "ÉXITO",
    hex: "#059669",
    swatch: "bg-emerald-600",
    soft: "bg-emerald-50",
    softText: "text-emerald-800",
    border: "border-emerald-200",
    title: "Activo · Resuelto",
    desc: "Sensor responde, alerta resuelta, ingesta saludable.",
    token: "emerald-600",
    dot: "bg-emerald-500",
  },
  {
    label: "ADVERTENCIA",
    hex: "#d97706",
    swatch: "bg-amber-600",
    soft: "bg-amber-50",
    softText: "text-amber-800",
    border: "border-amber-200",
    title: "Acercándose · Obsoleto",
    desc: "Umbral a menos del 10%, datapoint más antiguo de lo esperado.",
    token: "amber-600",
    dot: "bg-amber-500",
  },
  {
    label: "PELIGRO",
    hex: "#dc2626",
    swatch: "bg-red-600",
    soft: "bg-red-50",
    softText: "text-red-800",
    border: "border-red-200",
    title: "Disparada · Sin conexión",
    desc: "Condición de alerta cumplida o sensor inalcanzable.",
    token: "red-600",
    dot: "bg-red-500",
  },
  {
    label: "INFO",
    hex: "#0284c7",
    swatch: "bg-sky-600",
    soft: "bg-sky-50",
    softText: "text-sky-800",
    border: "border-sky-200",
    title: "Aviso · Neutral",
    desc: "Actualizaciones del sistema y eventos de stream sin acción requerida.",
    token: "sky-600",
    dot: "bg-sky-500",
  },
];

function SemanticSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="02 / ESTADO"
        title="Señales semánticas"
        sub="Cuatro canales — cada uno mapea a un resultado del bucle de monitorización. Usa el tono saturado para el indicador y el tono suave para la superficie."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        {SEMANTIC.map((s) => (
          <article
            key={s.label}
            className={`border ${s.border} ${s.soft} flex flex-col`}
          >
            <header
              className={`flex items-center justify-between px-5 py-3 border-b ${s.border}`}
            >
              <div className="flex items-center gap-3">
                <span className={`block h-3 w-3 ${s.swatch}`} />
                <span
                  className={`text-[11px] tracking-[0.28em] ${s.softText}`}
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.label}
                </span>
              </div>
              <code
                className="text-xs text-slate-500 tracking-[0.12em]"
                style={{ fontFamily: FONT_MONO }}
              >
                {s.token} · {s.hex}
              </code>
            </header>

            <div className="px-5 py-5 flex-1 flex flex-col gap-4">
              <div>
                <div
                  className={`text-2xl font-medium ${s.softText.replace(
                    "-800",
                    "-900"
                  )}`}
                >
                  {s.title}
                </div>
                <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
              </div>

              <div className="mt-auto bg-white border border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`relative flex h-2.5 w-2.5`}>
                    <span
                      className={`absolute inset-0 rounded-full ${s.dot} opacity-60 animate-ping`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`}
                    />
                  </span>
                  <span className="text-sm text-slate-700">
                    Sensor #04 · {s.title.split(" · ")[0]}
                  </span>
                </div>
                <code
                  className="text-xs text-slate-400"
                  style={{ fontFamily: FONT_MONO }}
                >
                  18:42:07
                </code>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Typography                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

const TYPE_SPECIMENS = [
  {
    role: "Display",
    sample: "Sensor #04",
    cls: "text-6xl font-light tracking-[-0.03em]",
    meta: "60px · 300 · -0.03em",
    use: "Títulos definitorios; uno por vista.",
  },
  {
    role: "Encabezado XL",
    sample: "Línea de temperatura — bahía 02",
    cls: "text-4xl font-semibold tracking-tight",
    meta: "36px · 600 · -0.02em",
    use: "Cabeceras de sección, mosaicos de panel.",
  },
  {
    role: "Encabezado LG",
    sample: "Alertas activas",
    cls: "text-2xl font-semibold",
    meta: "24px · 600 · 0em",
    use: "Títulos de tarjeta, cabeceras de diálogo.",
  },
  {
    role: "Cuerpo LG",
    sample: "Once sensores reportando, tres dentro del umbral.",
    cls: "text-lg text-slate-700",
    meta: "18px · 400 · 1.55",
    use: "Texto destacado, párrafos introductorios.",
  },
  {
    role: "Cuerpo",
    sample: "Los datapoints llegan vía SSE; el más reciente se muestra arriba.",
    cls: "text-base text-slate-700",
    meta: "16px · 400 · 1.6",
    use: "Texto corrido por defecto.",
  },
  {
    role: "Pie",
    sample: "Actualizado hace 4 segundos",
    cls: "text-xs text-slate-500",
    meta: "12px · 400 · 1.4",
    use: "Meta, timestamps, texto de ayuda.",
  },
];

const MONO_SPECIMENS = [
  { role: "Dato XL", sample: "23.4 °C", size: "32px · 500" },
  { role: "Dato", sample: "+0.012", size: "16px · 500" },
  { role: "Código", sample: "GET /api/sensors/4/datapoints", size: "14px · 400" },
  { role: "Etiqueta", sample: "SENSOR · ID · 0042", size: "11px · 500 · 0.28em" },
];

function TypeSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="03 / TIPO"
        title="Tipografía"
        sub="Sistema de dos familias. Plex Sans para narrativa, Plex Mono para todo lo medible — IDs, códigos hex, timestamps, telemetría."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
          <FamilyHeader
            tag="DISPLAY · UI"
            family="IBM Plex Sans"
            fontFamily={FONT_DISPLAY}
          />
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {TYPE_SPECIMENS.map((s) => (
              <div
                key={s.role}
                className="grid grid-cols-12 gap-4 items-baseline border-b border-slate-200 pb-3"
              >
                <div className="col-span-12 sm:col-span-7">
                  <div className={`${s.cls} text-slate-900`}>{s.sample}</div>
                </div>
                <div
                  className="col-span-6 sm:col-span-2 text-[11px] tracking-[0.18em] text-slate-500"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.role.toUpperCase()}
                </div>
                <div
                  className="col-span-6 sm:col-span-3 text-[11px] tracking-[0.06em] text-slate-400 text-right"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.meta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          <FamilyHeader
            tag="DATO · MONO"
            family="IBM Plex Mono"
            fontFamily={FONT_MONO}
          />
          <div className="flex-1 space-y-4">
            {MONO_SPECIMENS.map((s) => (
              <div
                key={s.role}
                className="border-l-2 border-blue-600 bg-white px-4 py-3"
              >
                <div
                  className="text-[10px] tracking-[0.28em] text-slate-500"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.role.toUpperCase()}
                </div>
                <div
                  className="text-2xl text-slate-900 mt-1"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.sample}
                </div>
                <div
                  className="text-[10px] text-slate-400 mt-1 tracking-[0.06em]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {s.size}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilyHeader({ tag, family, fontFamily }) {
  return (
    <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-2">
      <div className="flex items-baseline gap-3">
        <span
          className="text-[11px] tracking-[0.28em] text-blue-700"
          style={{ fontFamily: FONT_MONO }}
        >
          {tag}
        </span>
      </div>
      <span
        className="text-lg text-slate-900 font-medium"
        style={{ fontFamily }}
      >
        {family}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Spacing                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

const SPACE_SCALE = [
  ["1", 4, "padding de iconos, separación capilar"],
  ["2", 8, "pila estrecha, interior de badge"],
  ["3", 12, "interior de campo de formulario"],
  ["4", 16, "separación por defecto entre hermanos"],
  ["6", 24, "padding de tarjeta, separación de grupos"],
  ["8", 32, "padding interior de sección"],
  ["12", 48, "cabecera de sección → contenido"],
  ["16", 64, "márgenes principales del layout"],
  ["24", 96, "margen superior de página, espacio hero"],
];

function SpaceSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="04 / ESPACIO"
        title="Sistema de espaciado"
        sub="Base de 4 puntos. Primero múltiplos pares (4 · 8 · 16 · 24 · 48), valores impares reservados para ajustes a nivel de superficie. Elige siempre desde la escala — nunca a mano alzada."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">
        <div className="lg:col-span-7 flex flex-col gap-2">
          {SPACE_SCALE.map(([token, px, use]) => (
            <div
              key={token}
              className="grid grid-cols-12 items-center gap-4 group"
            >
              <code
                className="col-span-2 text-xs text-slate-500 tracking-[0.12em] group-hover:text-blue-700 transition-colors"
                style={{ fontFamily: FONT_MONO }}
              >
                space-{token}
              </code>
              <div className="col-span-7 h-3 bg-slate-100 relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(px / 96) * 100}%` }}
                />
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.18em] text-slate-400"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {px}px
                </div>
              </div>
              <span className="col-span-3 text-xs text-slate-600">{use}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <PrincipleBox
            head="Ritmo"
            body="Las páginas respiran en 24 / 48 / 96. Los interiores de tarjeta caen en 24. Las separaciones a nivel de elemento caen en 8 / 16."
          />
          <PrincipleBox
            head="Densidad"
            body="Objetivo táctil por defecto 40px. Objetivo compacto 32px. Nunca por debajo — botones y filas deben seguir siendo accesibles en tablets en planta."
          />
          <PrincipleBox
            head="Asimetría"
            body="Prefiere padding asimétrico (p. ej. px-6 py-4) sobre uniforme — el contenido se lee como composición deliberada, no como una caja."
          />
        </div>
      </div>
    </section>
  );
}

function PrincipleBox({ head, body }) {
  return (
    <div className="border-l-2 border-blue-600 pl-5 py-1">
      <div
        className="text-[11px] tracking-[0.28em] text-blue-700"
        style={{ fontFamily: FONT_MONO }}
      >
        {head.toUpperCase()}
      </div>
      <p className="text-base text-slate-700 mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Components                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

function ComponentsSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="05 / COMPONENTES"
        title="Componentes"
        sub="El kit en producción — extraído de frontend/components. Cada pieza aparece en al menos una página de la app."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        <PartBox name="Botón" span="lg:col-span-5">
          <div className="flex flex-wrap gap-2.5">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Primario
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              Secundario
            </button>
            <button className="px-4 py-2 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer">
              Sutil
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
              Peligro
            </button>
          </div>
        </PartBox>

        <PartBox name="Badge" span="lg:col-span-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">int</Badge>
            <Badge tone="emerald">activo</Badge>
            <Badge tone="amber">obsoleto</Badge>
            <Badge tone="red">sin conexión</Badge>
            <Badge tone="slate">admin</Badge>
          </div>
        </PartBox>

        <PartBox name="Spinner" span="lg:col-span-3">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-blue-600" />
          </div>
        </PartBox>

        <PartBox name="Input" span="lg:col-span-5">
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs text-slate-600 mb-1.5">
                Alias del sensor
              </span>
              <input
                type="text"
                defaultValue="Motor cinta · bahía 02"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-red-600 mb-1.5">
                Umbral (error)
              </span>
              <input
                type="text"
                defaultValue=""
                className="w-full px-3 py-2 border border-red-400 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
              <span className="block text-[11px] text-red-600 mt-1">
                Obligatorio para alertas activas.
              </span>
            </label>
          </div>
        </PartBox>

        <PartBox name="Tarjeta" span="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">
                Sensor #04
              </span>
              <Badge tone="blue">float</Badge>
            </div>
            <div className="px-4 py-3">
              <div
                className="text-3xl text-slate-900"
                style={{ fontFamily: FONT_MONO }}
              >
                23.4
                <span className="text-base text-slate-400 ml-1">°C</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                +0.2 vs. última muestra
              </div>
            </div>
          </div>
        </PartBox>

        <PartBox name="Diálogo" span="lg:col-span-3">
          <div className="border border-slate-200 bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900">
                  ¿Eliminar sensor?
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Elimina datapoints en cascada.
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="flex-1 px-2 py-1 border border-slate-300 rounded text-[11px] text-slate-700 cursor-pointer">
                Cancelar
              </button>
              <button className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-[11px] cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </PartBox>
      </div>
    </section>
  );
}

function PartBox({ name, span, children }) {
  return (
    <div className={`${span} border border-slate-200 bg-white/70 flex flex-col`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
        <span
          className="text-[10px] tracking-[0.28em] text-slate-500"
          style={{ fontFamily: FONT_MONO }}
        >
          {name.toUpperCase()}
        </span>
        <span
          className="text-[10px] tracking-[0.12em] text-slate-300"
          style={{ fontFamily: FONT_MONO }}
        >
          /components
        </span>
      </div>
      <div className="px-5 py-5 flex-1">{children}</div>
    </div>
  );
}

const BADGE_TONES = {
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  slate: "bg-slate-200 text-slate-800",
};

function Badge({ tone, children }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Shared bits                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

function SlideTitle({ kicker, title, sub }) {
  return (
    <header className="mb-8 max-w-4xl">
      <div
        className="text-[11px] tracking-[0.28em] text-blue-700 mb-3"
        style={{ fontFamily: FONT_MONO }}
      >
        {kicker}
      </div>
      <h2 className="text-5xl font-semibold text-slate-900 tracking-tight">
        {title}
      </h2>
      {sub && (
        <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-3xl">
          {sub}
        </p>
      )}
    </header>
  );
}

function DeckKeyframes() {
  return (
    <style>{`
      @keyframes slide-in {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
