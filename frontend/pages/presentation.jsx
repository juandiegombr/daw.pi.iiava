import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const FONT_DISPLAY = "'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

const SLIDES = [
  { id: "intro", label: "intro", kicker: "00 · INTRO", title: "Industrial Monitor" },
  { id: "problem", label: "problema", kicker: "01 · PROBLEMA", title: "El problema" },
  { id: "business", label: "negocio", kicker: "02 · NEGOCIO", title: "Idea de negocio" },
  { id: "frontend", label: "frontend", kicker: "03 · FRONTEND", title: "Frontend" },
  { id: "backend", label: "backend", kicker: "04 · BACKEND", title: "Backend" },
  { id: "database", label: "datos", kicker: "05 · DATOS", title: "Base de datos" },
  { id: "deployment", label: "despliegue", kicker: "06 · DESPLIEGUE", title: "Despliegue" },
  { id: "modules", label: "módulos", kicker: "07 · MÓDULOS", title: "Módulos transversales" },
];

const KEY_TO_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };

export default function PresentationPage() {
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

      <DeckChrome index={index} total={total} slide={current} />

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
          PRESENTACIÓN · DEL · PROYECTO
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
    case "intro":
      return <IntroSlide />;
    case "problem":
      return <ProblemSlide />;
    case "business":
      return <BusinessSlide />;
    case "frontend":
      return <FrontendSlide />;
    case "backend":
      return <BackendSlide />;
    case "database":
      return <DatabaseSlide />;
    case "deployment":
      return <DeploymentSlide />;
    case "modules":
      return <ModulesSlide />;
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Intro                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

function IntroSlide() {
  return (
    <section className="h-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span
            className="text-[11px] tracking-[0.28em] text-blue-700"
            style={{ fontFamily: FONT_MONO }}
          >
            PROYECTO INTERMODULAR · DAW 2025-26
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-[112px] font-light leading-[0.92] text-slate-900 tracking-[-0.03em]">
          Industrial
          <br />
          <span className="font-semibold text-blue-700">/ Monitor.</span>
        </h1>

        <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Plataforma de monitorización en tiempo real para sensores
          industriales. Una sola interfaz para registrar, consultar y vigilar
          cada lectura de cada máquina de la planta.
        </p>

        <div
          className="text-[11px] tracking-[0.22em] text-slate-500 pt-4"
          style={{ fontFamily: FONT_MONO }}
        >
          PULSA <Kbd>→</Kbd> O <Kbd>ESPACIO</Kbd> PARA AVANZAR
        </div>
      </div>

      <aside className="lg:col-span-4">
        <TitleBlock />
      </aside>
    </section>
  );
}

function TitleBlock() {
  const rows = [
    ["DOC", "PI-IIAVA-PRES-001"],
    ["REV", "01"],
    ["FECHA", "2026-05"],
    ["AUTOR", "J.D. Martín-Blas"],
    ["CURSO", "DAW · 2.º · IES L'Estació"],
    ["ENTREGA", "Final"],
    ["ESTADO", "ACTIVO"],
  ];
  return (
    <div
      className="border-2 border-slate-800 bg-white shadow-[8px_8px_0_0_rgba(37,99,235,0.15)]"
      style={{ fontFamily: FONT_MONO }}
    >
      <div className="border-b-2 border-slate-800 px-5 py-3 bg-slate-900 text-slate-50">
        <div className="text-[10px] tracking-[0.28em] text-blue-300">
          BLOQUE DE TÍTULO
        </div>
        <div className="text-sm tracking-[0.12em] mt-1">
          INDUSTRIAL · MONITOR
        </div>
      </div>
      <dl className="divide-y divide-slate-200">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between px-5 py-2.5 text-xs"
          >
            <dt className="text-slate-500 tracking-[0.18em]">{k}</dt>
            <dd className="text-slate-900 tracking-[0.04em]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Problem                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    n: "01",
    head: "Información dispersa",
    body: "Los datos de sensores quedan aislados en cada máquina o en sistemas que no se hablan entre sí.",
  },
  {
    n: "02",
    head: "Falta de visibilidad",
    body: "No existe una vista centralizada de todos los sensores de la instalación.",
  },
  {
    n: "03",
    head: "Monitoreo manual",
    body: "Los operadores tienen que revisar el equipo físicamente o saltar entre pantallas.",
  },
  {
    n: "04",
    head: "Respuesta tardía",
    body: "Los problemas pasan desapercibidos hasta que la máquina falla y la línea se detiene.",
  },
  {
    n: "05",
    head: "Silos de datos",
    body: "Cada fabricante trae su propio sistema. Integrarlos suele requerir trabajo manual.",
  },
];

function ProblemSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="01 / PROBLEMA"
        title="El problema"
        sub="Las plantas modernas tienen decenas de sensores midiendo temperatura, presión y vibración — pero la información rara vez llega entera al operador."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {PROBLEMS.map((p) => (
          <article
            key={p.n}
            className="border border-slate-200 bg-white px-5 py-5 flex flex-col"
          >
            <div
              className="text-[11px] tracking-[0.28em] text-red-600"
              style={{ fontFamily: FONT_MONO }}
            >
              PROBLEMA · {p.n}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mt-2 tracking-tight">
              {p.head}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {p.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Business                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    head: "Gestión centralizada",
    body: "Todos los sensores y todas las alertas en una sola interfaz. Alta y baja en segundos.",
    metric: "1",
    unit: "panel",
  },
  {
    head: "Tiempo real",
    body: "Datapoints en streaming vía SSE. Las alertas se disparan en el instante en que la condición se cumple.",
    metric: "< 1",
    unit: "s",
  },
  {
    head: "Datos accionables",
    body: "Gráficos con líneas de umbral, histórico filtrable por rango y notificaciones contextuales.",
    metric: "∞",
    unit: "histórico",
  },
];

const AUDIENCE = [
  "Gerentes de planta",
  "Mantenimiento",
  "Operaciones",
  "Control de calidad",
  "Ingeniería industrial",
];

function BusinessSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="02 / NEGOCIO"
        title="Idea de negocio"
        sub="Una plataforma única donde cada sensor cuenta su historia. La planta deja de adivinar y empieza a decidir con datos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {PILLARS.map((p) => (
          <article
            key={p.head}
            className="border border-slate-200 bg-white px-5 py-5 flex flex-col"
          >
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl text-blue-700 font-medium"
                style={{ fontFamily: FONT_MONO }}
              >
                {p.metric}
              </span>
              <span
                className="text-xs text-slate-400 tracking-[0.18em]"
                style={{ fontFamily: FONT_MONO }}
              >
                {p.unit}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mt-3 tracking-tight">
              {p.head}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {p.body}
            </p>
          </article>
        ))}
      </div>

      <div className="border border-slate-200 bg-white/60 px-5 py-4 mt-auto">
        <div
          className="text-[11px] tracking-[0.28em] text-slate-500 mb-3"
          style={{ fontFamily: FONT_MONO }}
        >
          AUDIENCIA OBJETIVO
        </div>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE.map((a) => (
            <span
              key={a}
              className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Frontend                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

const FRONTEND_STACK = [
  ["React", "19", "biblioteca de UI"],
  ["Vite", "6", "build & dev server"],
  ["React Router", "7", "routing del SPA"],
  ["Tailwind CSS", "4", "estilo basado en tokens"],
  ["Recharts", "3", "gráficos de telemetría"],
];

const FRONTEND_FEATURES = [
  "SPA con routing client-side",
  "Visualizaciones de datapoints en LineChart / AreaChart / BarChart",
  "Listener SSE para datapoints y alertas en tiempo real",
  "Autenticación con JWT en cookies httpOnly",
  "Diseño responsivo desde móvil hasta planta",
];

function FrontendSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="03 / FRONTEND"
        title="Frontend"
        sub="Single Page Application con React y Tailwind. Visualizaciones de telemetría, listener SSE para datos en directo y un sistema de diseño documentado."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        <div className="lg:col-span-5 border border-slate-200 bg-white px-5 py-5 flex flex-col">
          <div
            className="text-[11px] tracking-[0.28em] text-slate-500 mb-4"
            style={{ fontFamily: FONT_MONO }}
          >
            STACK
          </div>
          <ul className="space-y-3 flex-1">
            {FRONTEND_STACK.map(([name, ver, role]) => (
              <li key={name} className="flex items-baseline gap-3">
                <span
                  className="text-sm text-slate-900 font-medium min-w-[7rem]"
                >
                  {name}
                </span>
                <code
                  className="text-xs text-blue-700 tracking-[0.06em]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  v{ver}
                </code>
                <span className="text-xs text-slate-500">{role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="border border-slate-200 bg-white px-5 py-5 flex-1">
            <div
              className="text-[11px] tracking-[0.28em] text-slate-500 mb-4"
              style={{ fontFamily: FONT_MONO }}
            >
              CARACTERÍSTICAS
            </div>
            <ul className="space-y-2.5">
              {FRONTEND_FEATURES.map((f) => (
                <li
                  key={f}
                  className="text-sm text-slate-700 flex items-start gap-3"
                >
                  <span className="text-blue-600 mt-0.5">▸</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/styleguide"
            className="group block border-2 border-blue-700 bg-blue-700 text-white px-5 py-4 transition-all duration-200 hover:bg-blue-800 hover:border-blue-800"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div
                  className="text-[10px] tracking-[0.28em] text-blue-200"
                  style={{ fontFamily: FONT_MONO }}
                >
                  SISTEMA DE DISEÑO · /styleguide
                </div>
                <div className="text-lg font-semibold mt-1 tracking-tight">
                  Ver la guía de estilo →
                </div>
              </div>
              <span className="text-3xl text-blue-200 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Backend                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

const BACKEND_STACK = [
  ["Node.js", "22", "runtime"],
  ["Express", "5", "API REST"],
  ["Sequelize", "6", "ORM contra MySQL"],
  ["jsonwebtoken", "—", "JWT + cookies httpOnly"],
  ["bcryptjs", "—", "hash de contraseñas"],
  ["Pino", "10", "logging estructurado"],
];

const ENDPOINTS = [
  ["POST", "/api/auth/register"],
  ["POST", "/api/auth/login"],
  ["GET", "/api/sensors"],
  ["POST", "/api/sensors"],
  ["GET", "/api/sensors/:id/datapoints"],
  ["POST", "/api/sensors/:id/datapoints"],
  ["GET/POST/PUT/DELETE", "/api/alerts"],
  ["GET", "/api/sensors/events  (SSE)"],
];

function BackendSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="04 / BACKEND"
        title="Backend"
        sub="API REST sobre Node.js + Express con autenticación JWT, ORM Sequelize y un canal SSE para difundir datapoints y alertas en tiempo real."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        <div className="lg:col-span-5 border border-slate-200 bg-white px-5 py-5 flex flex-col">
          <div
            className="text-[11px] tracking-[0.28em] text-slate-500 mb-4"
            style={{ fontFamily: FONT_MONO }}
          >
            STACK
          </div>
          <ul className="space-y-2.5 flex-1">
            {BACKEND_STACK.map(([name, ver, role]) => (
              <li key={name} className="flex items-baseline gap-3">
                <span className="text-sm text-slate-900 font-medium min-w-[7rem]">
                  {name}
                </span>
                <code
                  className="text-xs text-blue-700 tracking-[0.06em]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {ver === "—" ? "—" : `v${ver}`}
                </code>
                <span className="text-xs text-slate-500">{role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 border border-slate-200 bg-white px-5 py-5 flex flex-col">
          <div
            className="text-[11px] tracking-[0.28em] text-slate-500 mb-4"
            style={{ fontFamily: FONT_MONO }}
          >
            ENDPOINTS · REST + SSE
          </div>
          <ul className="space-y-1.5 flex-1">
            {ENDPOINTS.map(([method, path]) => (
              <li
                key={path}
                className="grid grid-cols-12 items-baseline gap-3 border-b border-slate-100 pb-1.5 last:border-0"
              >
                <span
                  className="col-span-4 text-[11px] tracking-[0.12em] text-blue-700"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {method}
                </span>
                <code
                  className="col-span-8 text-sm text-slate-800"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {path}
                </code>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Cada POST a <code style={{ fontFamily: FONT_MONO }}>/datapoints</code> valida
            el tipo contra el sensor, evalúa las alertas activas y emite eventos
            <code style={{ fontFamily: FONT_MONO }}> datapoint-created</code> y
            <code style={{ fontFamily: FONT_MONO }}> alert-triggered</code> por SSE.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Database                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

const MODELS = [
  {
    name: "Users",
    fields: [
      ["id", "PK"],
      ["username", "unique"],
      ["password", "bcrypt"],
      ["role", "user | admin"],
    ],
  },
  {
    name: "Sensors",
    fields: [
      ["id", "PK"],
      ["alias", "texto"],
      ["type", "int | float | bool | string"],
      ["createdAt / updatedAt", "auto"],
    ],
  },
  {
    name: "DataPoints",
    fields: [
      ["id", "PK"],
      ["sensorId", "FK → Sensors · CASCADE"],
      ["valueInt / Float / Bool / String", "tipado por sensor"],
      ["timestamp", "indexed"],
    ],
  },
  {
    name: "Alerts",
    fields: [
      ["id", "PK"],
      ["sensorId", "FK → Sensors · CASCADE"],
      ["condition", "> < >= <= == !="],
      ["value · enabled", "umbral · activación"],
    ],
  },
];

function DatabaseSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="05 / DATOS"
        title="Base de datos"
        sub="Cuatro entidades, dos relaciones uno-a-muchos con borrado en cascada. MySQL 8 en producción (RDS), SQLite en memoria para los tests de integración."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        {MODELS.map((m) => (
          <article
            key={m.name}
            className="border border-slate-200 bg-white flex flex-col"
          >
            <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
              <span
                className="text-sm font-semibold text-slate-900 tracking-tight"
                style={{ fontFamily: FONT_MONO }}
              >
                {m.name}
              </span>
              <span
                className="text-[10px] text-slate-400 tracking-[0.18em]"
                style={{ fontFamily: FONT_MONO }}
              >
                TABLE
              </span>
            </header>
            <ul className="divide-y divide-slate-100">
              {m.fields.map(([f, kind]) => (
                <li
                  key={f}
                  className="flex items-baseline justify-between px-5 py-2 gap-4"
                >
                  <code
                    className="text-xs text-slate-800"
                    style={{ fontFamily: FONT_MONO }}
                  >
                    {f}
                  </code>
                  <span
                    className="text-[11px] text-slate-500 tracking-[0.04em] text-right"
                    style={{ fontFamily: FONT_MONO }}
                  >
                    {kind}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-3xl">
        <span
          className="text-blue-700 tracking-[0.18em] mr-2"
          style={{ fontFamily: FONT_MONO }}
        >
          ORM
        </span>
        Sequelize sincroniza el esquema en el arranque (<code style={{ fontFamily: FONT_MONO }}>sync()</code>).
        Eliminar un sensor arrastra sus datapoints y alertas asociadas. Los datapoints están
        indexados por <code style={{ fontFamily: FONT_MONO }}>sensorId</code> y <code style={{ fontFamily: FONT_MONO }}>timestamp</code>.
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Deployment                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

const DEPLOY_BLOCKS = [
  {
    label: "CDN",
    name: "CloudFront",
    detail: "d12lcsgk45eqvv.cloudfront.net",
    tag: "E8CAZK17RKQ5Z",
    accent: "border-blue-200 bg-blue-50",
  },
  {
    label: "STATIC",
    name: "S3",
    detail: "daw-pi-iava-frontend",
    tag: "build del frontend",
    accent: "border-slate-200 bg-white",
  },
  {
    label: "COMPUTE",
    name: "EC2 + Docker",
    detail: "ec2-108-129-184-221.eu-west-1.compute.amazonaws.com",
    tag: "Node.js · :80→3000",
    accent: "border-slate-200 bg-white",
  },
  {
    label: "DB",
    name: "RDS MySQL 8",
    detail: "daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com",
    tag: "backups automáticos",
    accent: "border-slate-200 bg-white",
  },
];

function DeploymentSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="06 / DESPLIEGUE"
        title="Despliegue"
        sub="Todo en AWS, región eu-west-1. CloudFront es el único punto de entrada público: sirve el frontend desde S3 y enruta /api/* al backend en EC2."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {DEPLOY_BLOCKS.map((b) => (
            <article
              key={b.name}
              className={`border ${b.accent} px-5 py-4 flex flex-col`}
            >
              <div
                className="text-[10px] tracking-[0.28em] text-blue-700"
                style={{ fontFamily: FONT_MONO }}
              >
                {b.label}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-1 tracking-tight">
                {b.name}
              </h3>
              <code
                className="text-[11px] text-slate-600 mt-1 break-all"
                style={{ fontFamily: FONT_MONO }}
              >
                {b.detail}
              </code>
              <span
                className="text-[10px] text-slate-400 mt-1 tracking-[0.06em]"
                style={{ fontFamily: FONT_MONO }}
              >
                {b.tag}
              </span>
            </article>
          ))}
        </div>

        <div className="lg:col-span-5 border border-slate-200 bg-white px-5 py-5 flex flex-col">
          <div
            className="text-[11px] tracking-[0.28em] text-slate-500 mb-3"
            style={{ fontFamily: FONT_MONO }}
          >
            CI/CD · GITHUB ACTIONS
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">▸</span>
              <span>
                <strong className="text-slate-900">frontend-deploy.yml</strong> —
                build, <code style={{ fontFamily: FONT_MONO }}>aws s3 sync</code> e
                invalidación <code style={{ fontFamily: FONT_MONO }}>/*</code> en CloudFront.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">▸</span>
              <span>
                <strong className="text-slate-900">backend-deploy.yml</strong> —
                SSH a EC2, <code style={{ fontFamily: FONT_MONO }}>git pull</code>,
                rebuild del contenedor Docker e invalidación <code style={{ fontFamily: FONT_MONO }}>/api/*</code>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">▸</span>
              <span>
                Disparo automático en cada push a{" "}
                <code style={{ fontFamily: FONT_MONO }}>main</code> con filtrado por ruta.
              </span>
            </li>
          </ul>

          <div
            className="mt-auto pt-4 text-[10px] tracking-[0.18em] text-slate-400"
            style={{ fontFamily: FONT_MONO }}
          >
            REGIÓN · eu-west-1
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Slide: Módulos transversales                                            */
/* ─────────────────────────────────────────────────────────────────────── */

const MODULE_DIGI = {
  code: "DIGITALIZACIÓN",
  name: "Digitalización aplicada a los sistemas productivos",
  badge: "bg-blue-100 text-blue-800",
  accent: "border-blue-300",
  dot: "bg-blue-600",
  items: [
    {
      head: "Industria 4.0",
      body: "Sensores físicos de la planta integrados con una plataforma digital centralizada — sustituye la lectura manual por un sistema ciber-físico.",
    },
    {
      head: "IoT en producción",
      body: "Modelo de datapoints tipados (int · float · bool · string), ingesta continua vía POST y difusión por SSE.",
    },
    {
      head: "Gestión de datos",
      body: "API REST, ORM Sequelize sobre MySQL 8 y gráficos con histórico filtrable. Big Data a escala de planta pequeña.",
    },
    {
      head: "Ciberseguridad",
      body: "JWT en cookies httpOnly, hash bcrypt, security groups privados en RDS y HTTPS terminado en CloudFront.",
    },
  ],
};

const MODULE_SOSTE = {
  code: "SOSTENIBILIDAD",
  name: "Sostenibilidad aplicada al sistema productivo",
  badge: "bg-emerald-100 text-emerald-800",
  accent: "border-emerald-300",
  dot: "bg-emerald-600",
  items: [
    {
      head: "Producción limpia",
      body: "Las alertas con umbrales detectan desviaciones antes de fabricar el lote defectuoso — menos chatarra y menos retrabajo.",
    },
    {
      head: "Eficiencia de recursos",
      body: "Monitoreo continuo del consumo y del comportamiento del equipo permite ajustar el uso de energía y materiales.",
    },
    {
      head: "Mantenimiento predictivo",
      body: "Detectar la avería antes de que ocurra reduce las paradas no planificadas y alarga la vida útil del equipo.",
    },
    {
      head: "Impacto social",
      body: "El operario deja de recorrer la planta para tomar lecturas — mejor ergonomía, menos exposición a zonas de riesgo.",
    },
  ],
};

function ModulesSlide() {
  return (
    <section className="h-full flex flex-col">
      <SlideTitle
        kicker="07 / MÓDULOS TRANSVERSALES"
        title="Cobertura de los módulos del ciclo"
        sub="Cómo el proyecto da respuesta a los dos módulos transversales del Grado Superior: Digitalización aplicada a los sistemas productivos y Sostenibilidad aplicada al sistema productivo."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        <ModuleColumn module={MODULE_DIGI} />
        <ModuleColumn module={MODULE_SOSTE} />
      </div>
    </section>
  );
}

function ModuleColumn({ module: m }) {
  return (
    <article className={`border-2 ${m.accent} bg-white flex flex-col`}>
      <header className="px-5 py-4 border-b border-slate-200 flex items-start gap-3">
        <span className={`mt-1.5 block h-2.5 w-2.5 ${m.dot}`} />
        <div className="min-w-0 flex-1">
          <div
            className={`inline-block text-[10px] tracking-[0.28em] px-2 py-0.5 rounded ${m.badge}`}
            style={{ fontFamily: FONT_MONO }}
          >
            {m.code}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mt-2 tracking-tight leading-snug">
            {m.name}
          </h3>
        </div>
      </header>
      <ul className="divide-y divide-slate-100 flex-1">
        {m.items.map((it, i) => (
          <li key={it.head} className="px-5 py-3 flex items-start gap-4">
            <span
              className="text-[10px] tracking-[0.18em] text-slate-400 mt-1 w-5"
              style={{ fontFamily: FONT_MONO }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 tracking-tight">
                {it.head}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {it.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
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
