import type { ReactNode } from "react";

interface Card {
  title: string;
  text: string;
}

const AREAS: Card[] = [
  {
    title: "Catálogo",
    text: "Registrar, buscar y organizar los libros de la biblioteca.",
  },
  {
    title: "Cuentas y roles",
    text: "Quién es cada persona, cómo ingresa y qué puede hacer.",
  },
  {
    title: "Préstamos",
    text: "Prestar, devolver, renovar y llevar el control de lo vencido.",
  },
  {
    title: "Lector digital",
    text: "Leer libros en el navegador mientras el préstamo siga vigente.",
  },
];

const AGENTS: Card[] = [
  {
    title: "Orquestador",
    text: "Es la sesión principal. Escribe las especificaciones contigo, fija los contratos y reparte el trabajo.",
  },
  {
    title: "Backend",
    text: "Servicios, repositorios y rutas de la API. Aquí viven las reglas de negocio.",
  },
  {
    title: "Frontend",
    text: "Páginas y componentes, con la paleta, la accesibilidad y los tres anchos de pantalla del proyecto.",
  },
  {
    title: "Pruebas",
    text: "Escribe las pruebas a partir de la especificación, nunca leyendo el código que ya existe.",
  },
  {
    title: "Seguridad",
    text: "Revisa en solo lectura: autorización, validación, secretos y sesiones.",
  },
];

const STEPS: Card[] = [
  {
    title: "Elige una feature",
    text: "Sigue el orden de las olas de la lista de features.",
  },
  {
    title: "Responde las preguntas",
    text: "El agente escribe la especificación y te pregunta cada decisión que falte: plazos, límites, quién puede qué. Esas decisiones son tuyas.",
  },
  {
    title: "Aprueba la especificación",
    text: "Solo tú la cambias a «Aprobada». Sin eso, nadie escribe código.",
  },
  {
    title: "Los agentes construyen",
    text: "Cada uno trabaja en su zona de archivos y se integra con una sola puerta de calidad.",
  },
  {
    title: "Revisa y prueba",
    text: "Seguridad revisa, se deja una nota de entrega y tú pruebas la feature antes de seguir.",
  },
];

const RULES: string[] = [
  "Sin especificación aprobada no se implementa nada.",
  "Las pruebas se escriben desde la especificación, y no se cambian para que pasen.",
  "Autorización y validación siempre en el servidor; la identidad sale de la sesión.",
  "Cero any y cero unknown, sin ternarios, funciones cortas y snake_case en el cable.",
  "Interfaz mobile-first, accesible (WCAG 2.1 AA) y solo con la paleta azul y blanco.",
  "Los agentes no leen el archivo de entorno ni las carpetas de secretos o datos locales.",
];

const COMMANDS: string[] = ["npm install", "npm run check", "claude   # o bien: opencode"];

interface ConfigItem {
  term: string;
  detail: ReactNode;
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-strong px-1.5 py-0.5 text-sm">{children}</code>;
}

const SHARED_CONFIG: ConfigItem[] = [
  {
    term: "Reglas únicas",
    detail: (
      <>
        <Code>AGENTS.md</Code> es la fuente de verdad. Claude Code lo lee porque <Code>CLAUDE.md</Code> lo importa con{" "}
        <Code>@AGENTS.md</Code>; OpenCode, porque <Code>opencode.json</Code> lo lista en <Code>instructions</Code>.
      </>
    ),
  },
  {
    term: "Los mismos cuatro subagentes",
    detail: (
      <>
        <Code>backend</Code>, <Code>frontend</Code>, <Code>tests</Code> y <Code>security</Code>, con el mismo texto de
        instrucciones en las dos carpetas. Una prueba del proyecto (<Code>agents-consistency</Code>) falla si se
        desincronizan.
      </>
    ),
  },
  {
    term: "Skills",
    detail: (
      <>
        Viven en <Code>.claude/skills/</Code> y OpenCode también las lee: <Code>write-spec</Code>,{" "}
        <Code>feature-workflow</Code>, <Code>handoff-note</Code> y <Code>security-review</Code>.
      </>
    ),
  },
  {
    term: "Guard de carpetas prohibidas",
    detail: (
      <>
        Una sola regla en <Code>.agents/guard/rules.ts</Code> bloquea los archivos <Code>.env</Code> (menos{" "}
        <Code>.env.example</Code>) y las carpetas <Code>secrets/</Code>, <Code>data/</Code> y la del control de
        versiones. Es una barrera de buena fe, no un sandbox: la defensa real es no dejar secretos al alcance del
        agente.
      </>
    ),
  },
  {
    term: "Documentación al día",
    detail: (
      <>
        El servidor MCP <Code>context7</Code> da a los agentes la documentación vigente de las librerías.
      </>
    ),
  },
];

const CLAUDE_CONFIG: ConfigItem[] = [
  {
    term: "Orquestador",
    detail: "Es la sesión principal. Lo define CLAUDE.md y sigue la skill feature-workflow.",
  },
  {
    term: "Agentes",
    detail: (
      <>
        <Code>.claude/agents/*.md</Code>. Cada uno declara las herramientas que puede usar; <Code>security</Code> no
        tiene <Code>Edit</Code> ni <Code>Write</Code>, así que solo lee. La zona de archivos de cada agente está escrita
        en sus instrucciones.
      </>
    ),
  },
  {
    term: "Permisos",
    detail: (
      <>
        <Code>.claude/settings.json</Code> niega leer y editar <Code>.env*</Code>, <Code>secrets/</Code> y{" "}
        <Code>data/</Code>.
      </>
    ),
  },
  {
    term: "Hook del guard",
    detail: (
      <>
        Antes de cada <Code>Read</Code>, <Code>Edit</Code>, <Code>Write</Code>, <Code>Glob</Code>, <Code>Grep</Code> o{" "}
        <Code>Bash</Code> se ejecuta <Code>.claude/hooks/guard.ts</Code>. Si la llamada toca una zona prohibida, la
        bloquea y le explica el motivo al modelo.
      </>
    ),
  },
  {
    term: "Servidores MCP",
    detail: (
      <>
        <Code>.mcp.json</Code> declara <Code>context7</Code> y <Code>next-devtools</Code>; <Code>settings.json</Code>{" "}
        los habilita.
      </>
    ),
  },
];

const OPENCODE_CONFIG: ConfigItem[] = [
  {
    term: "Orquestador",
    detail: (
      <>
        <Code>.opencode/agents/lead.md</Code>, agente primario. Solo puede editar <Code>docs/</Code> y los contratos, y
        solo puede delegar en los agentes del equipo.
      </>
    ),
  },
  {
    term: "Agentes",
    detail: (
      <>
        <Code>.opencode/agents/*.md</Code>. Aquí las zonas las hace cumplir el permiso: cada agente tiene{" "}
        <Code>edit</Code> denegado por defecto y permitido solo en sus carpetas. <Code>security</Code> tiene{" "}
        <Code>edit: deny</Code>.
      </>
    ),
  },
  {
    term: "Comandos de terminal",
    detail: (
      <>
        Permitidos: pruebas, <Code>npm run check</Code>, lint, tipos, build y los comandos de solo lectura de git.
        Denegados: <Code>git push</Code>, <Code>rm -rf</Code>, <Code>curl</Code> y <Code>wget</Code>. El resto pregunta.
      </>
    ),
  },
  {
    term: "Permisos globales",
    detail: (
      <>
        <Code>opencode.json</Code> niega leer <Code>.env*</Code>, <Code>secrets/</Code> y <Code>data/</Code>, y pide
        confirmación para editar.
      </>
    ),
  },
  {
    term: "Plugin del guard",
    detail: (
      <>
        <Code>.opencode/plugins/guard.ts</Code> se engancha a <Code>tool.execute.before</Code> y aplica la misma regla
        compartida.
      </>
    ),
  },
  {
    term: "Modelo",
    detail: "Lo eliges con /connect. Cada agente puede fijar uno propio con la línea model del encabezado.",
  },
];

function ConfigCard({ title, intro, items }: { title: string; intro: string; items: ConfigItem[] }) {
  return (
    <article className="h-full rounded-lg border border-line bg-surface-alt p-4">
      <h3 className="text-lg font-semibold text-primary-strong">{title}</h3>
      <p className="mt-1 text-ink-muted">{intro}</p>
      <dl className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.term}>
            <dt className="font-semibold text-ink">{item.term}</dt>
            <dd className="mt-0.5 text-ink-muted">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function AiConfig() {
  return (
    <section aria-labelledby="configuracion-ia" className="mt-10">
      <h2 id="configuracion-ia" className="text-2xl font-bold text-primary-strong">
        Configuración de IA: Claude Code y OpenCode
      </h2>
      <p className="mt-2 max-w-3xl text-ink-muted">
        El proyecto se puede trabajar con cualquiera de los dos harness y se comportan igual. Lo que cada uno exige vive
        en su carpeta (<Code>.claude/</Code> y <Code>.opencode/</Code>); lo común, en <Code>AGENTS.md</Code> y{" "}
        <Code>.agents/</Code>.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ConfigCard title="Lo que comparten" intro="Un solo juego de reglas para los dos." items={SHARED_CONFIG} />
        <ConfigCard title="Claude Code" intro="Archivos: CLAUDE.md, .claude/ y .mcp.json." items={CLAUDE_CONFIG} />
        <ConfigCard title="OpenCode" intro="Archivos: opencode.json y .opencode/." items={OPENCODE_CONFIG} />
      </div>
    </section>
  );
}

function CardList({ cards, columns }: { cards: Card[]; columns: string }) {
  return (
    <ul className={`mt-4 grid gap-4 ${columns}`}>
      {cards.map((card) => (
        <li key={card.title}>
          <article className="h-full rounded-lg border border-line bg-surface-alt p-4">
            <h3 className="text-lg font-semibold text-primary-strong">{card.title}</h3>
            <p className="mt-1 text-ink-muted">{card.text}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}

function Intro() {
  return (
    <header className="rounded-lg bg-primary-strong p-6 text-surface md:p-10">
      <p className="text-sm font-semibold uppercase tracking-wide">Proyecto del curso de Tendencias</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Biblioteca de préstamos</h1>
      <p className="mt-4 max-w-3xl text-lg">
        Una biblioteca de préstamos de libros físicos y digitales que construyes tú, feature por feature, dirigiendo a
        un equipo de agentes de inteligencia artificial.
      </p>
      <p className="mt-4 max-w-3xl">
        Este repositorio trae el método, las reglas y las puertas de calidad. No trae ninguna feature terminada ni
        ninguna regla de negocio: las vas decidiendo tú al responder las preguntas que cada especificación plantea.
      </p>
    </header>
  );
}

function GettingStarted() {
  return (
    <section aria-labelledby="empezar" className="mt-10">
      <h2 id="empezar" className="text-2xl font-bold text-primary-strong">
        Cómo empezar
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6">
        <li>
          Lee <code className="rounded bg-surface-strong px-1.5 py-0.5 text-sm">docs/empezar.md</code>: requisitos, tu
          proyecto de Firebase y el archivo de entorno.
        </li>
        <li>Instala las dependencias y comprueba que la línea base esté en verde.</li>
        <li>Abre un harness de agentes en esta carpeta.</li>
        <li>
          Envía el primer mensaje que está en{" "}
          <code className="rounded bg-surface-strong px-1.5 py-0.5 text-sm">docs/empezar.md</code>: el agente escribirá
          la especificación de la feature F0 y te hará sus preguntas.
        </li>
      </ol>
      <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-primary-deep p-4 text-surface">
        <code>{COMMANDS.join("\n")}</code>
      </pre>
    </section>
  );
}

export default function HomePage() {
  return (
    <article>
      <Intro />

      <section aria-labelledby="que-construiras" className="mt-10">
        <h2 id="que-construiras" className="text-2xl font-bold text-primary-strong">
          Qué vas a construir
        </h2>
        <p className="mt-2 max-w-3xl text-ink-muted">
          Cuatro áreas de negocio, repartidas en 40 features pequeñas. Cada una tiene una acción, un resultado visible y
          su propia especificación. La lista completa y su orden están en{" "}
          <code className="rounded bg-surface-strong px-1.5 py-0.5 text-sm">docs/features.md</code>.
        </p>
        <CardList cards={AREAS} columns="md:grid-cols-2 lg:grid-cols-4" />
      </section>

      <section aria-labelledby="como-se-trabaja" className="mt-10">
        <h2 id="como-se-trabaja" className="text-2xl font-bold text-primary-strong">
          Cómo se trabaja cada feature
        </h2>
        <CardList cards={STEPS} columns="md:grid-cols-2 lg:grid-cols-3" />
      </section>

      <section aria-labelledby="equipo" className="mt-10">
        <h2 id="equipo" className="text-2xl font-bold text-primary-strong">
          El equipo de agentes
        </h2>
        <p className="mt-2 max-w-3xl text-ink-muted">
          Funciona igual en Claude Code y en OpenCode. Nadie edita fuera de su zona de archivos.
        </p>
        <CardList cards={AGENTS} columns="md:grid-cols-2 lg:grid-cols-3" />
      </section>

      <AiConfig />

      <section aria-labelledby="reglas" className="mt-10">
        <h2 id="reglas" className="text-2xl font-bold text-primary-strong">
          Reglas que no se negocian
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <GettingStarted />
    </article>
  );
}
