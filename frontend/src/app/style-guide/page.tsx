import { type Metadata } from 'next'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Sistema de Diseño — Dinero Sabio',
  description: 'Living reference for the Dinero Sabio design system',
}

/* This page is a living reference, not product UI. It intentionally uses the
   canonical tokens (bg-surface, text-ink, bg-green...) everywhere so it doubles
   as proof the token system works: change globals.css, this page changes. */

interface SwatchProps {
  name: string
  token: string
  value: string
  /* text color to lay ON TOP of the swatch, so the label stays readable */
  on?: 'ink' | 'cream'
  className: string
}

function Swatch({ name, token, value, on = 'ink', className }: SwatchProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className={`flex h-24 items-end p-3 ${className}`}>
        <span className={on === 'cream' ? 'text-surface/90' : 'text-ink/80'}>
          <span className="font-display text-lg leading-none">Aa</span>
        </span>
      </div>
      <div className="bg-surface p-3">
        <p className="font-semibold text-ink">{name}</p>
        <p className="font-mono text-xs text-ink-soft">{token}</p>
        <p className="font-mono text-xs text-ink-soft">{value}</p>
      </div>
    </div>
  )
}

interface ContrastRowProps {
  pairing: string
  ratio: string
  verdict: 'pass' | 'warn' | 'fail'
  note: string
}

function ContrastRow({ pairing, ratio, verdict, note }: ContrastRowProps) {
  const badge = {
    pass: { label: 'AA', cls: 'bg-green-tint text-green-strong' },
    warn: { label: 'careful', cls: 'bg-mediumyellow text-ink' },
    fail: { label: 'fails', cls: 'bg-red-tint text-red-strong' },
  }[verdict]

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 text-ink">{pairing}</td>
      <td className="py-3 pr-4 font-mono text-ink-soft">{ratio}</td>
      <td className="py-3 pr-4">
        <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </td>
      <td className="py-3 text-ink-soft">{note}</td>
    </tr>
  )
}

function Section({
  title,
  lead,
  children,
}: {
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      {lead && <p className="mt-2 max-w-[65ch] text-ink-soft">{lead}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-16 sm:px-10">
      <div className="fixed right-5 top-5 z-50 rounded-full bg-surface shadow-md">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-5xl">
        {/* Masthead */}
        <header>
          <p className="font-semibold text-green-strong">Dinero Sabio</p>
          <h1 className="mt-2 font-display text-5xl leading-tight text-ink sm:text-6xl">
            Sistema de Diseño
          </h1>
          <p className="mt-4 max-w-[60ch] text-lg text-ink-soft">
            The single source of truth for color, type, and components. Every
            value here is a token in{' '}
            <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-sm text-ink">
              globals.css
            </code>{' '}
            — edit the token, the whole app follows.
          </p>
        </header>

        {/* -- Surfaces & Ink ------------------------------------------ */}
        <Section
          title="Surfaces & Ink"
          lead="The stage everything sits on. Cream is the page; surface is anything raised above it (navbar, cards). Ink and its softer sibling carry all text."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Swatch name="Cream" token="bg-cream" value="#FFF6DA" className="bg-cream" />
            <Swatch name="Surface" token="bg-surface" value="#FFFBF0" className="bg-surface" />
            <Swatch name="Sunken" token="bg-surface-sunken" value="oklch .945" className="bg-surface-sunken" />
            <Swatch name="Ink" token="text-ink" value="warm black" on="cream" className="bg-ink" />
            <Swatch name="Ink soft" token="text-ink-soft" value="#5F5F5F" on="cream" className="bg-ink-soft" />
          </div>
        </Section>

        {/* -- Brand hues ---------------------------------------------- */}
        <Section
          title="Brand Hues — the base / strong pattern"
          lead="This is the most important idea in the system. Each brand color ships in TWO strengths: a base for filling shapes (white sits on top), and a darker 'strong' twin — the only version readable as small text on cream."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Swatch name="Green" token="bg-green" value="#678A3E" on="cream" className="bg-green" />
            <Swatch name="Green strong" token="text-green-strong" value="oklch .49" on="cream" className="bg-green-strong" />
            <Swatch name="Green tint" token="bg-green-tint" value="oklch .94" className="bg-green-tint" />
            <Swatch name="Red" token="bg-red" value="#DB2D26" on="cream" className="bg-red" />
            <Swatch name="Red strong" token="text-red-strong" value="oklch .52" on="cream" className="bg-red-strong" />
            <Swatch name="Red tint" token="bg-red-tint" value="oklch .94" className="bg-red-tint" />
          </div>
        </Section>

        {/* -- Contrast ------------------------------------------------ */}
        <Section
          title="Contrast — the rules that keep it accessible"
          lead="WCAG AA needs 4.5:1 for normal text, 3:1 for large or bold text. These are the pairings you'll actually reach for — memorize the two that fail."
        >
          <div className="overflow-x-auto rounded-xl border border-border bg-surface p-2 sm:p-4">
            <table className="w-full min-w-140 text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 font-semibold text-ink">Pairing</th>
                  <th className="pb-3 pr-4 font-semibold text-ink">Ratio</th>
                  <th className="pb-3 pr-4 font-semibold text-ink">Verdict</th>
                  <th className="pb-3 font-semibold text-ink">Note</th>
                </tr>
              </thead>
              <tbody>
                <ContrastRow pairing="Ink on cream" ratio="~14:1" verdict="pass" note="Primary text — plenty of headroom." />
                <ContrastRow pairing="Ink-soft on cream" ratio="~5.9:1" verdict="pass" note="Secondary text is fine." />
                <ContrastRow pairing="White on green (button)" ratio="~4.0:1" verdict="warn" note="Only passes if the label is semibold+ (large-text rule)." />
                <ContrastRow pairing="White on red (button)" ratio="~4.8:1" verdict="pass" note="Safe at any weight." />
                <ContrastRow pairing="Green base as small text" ratio="~3.4:1" verdict="fail" note="Use text-green-strong instead." />
                <ContrastRow pairing="Red base as small text" ratio="~4.4:1" verdict="fail" note="So close — still use text-red-strong." />
                <ContrastRow pairing="Green-strong as text" ratio="~5.3:1" verdict="pass" note="The correct green for words on cream." />
              </tbody>
            </table>
          </div>
        </Section>

        {/* -- Typography ---------------------------------------------- */}
        <Section
          title="Typography"
          lead="Galindo is the festive display face — logo and large headings only. Nunito carries everything you read. Pairing a personality display with a neutral humanist body is a contrast pairing, not two look-alikes."
        >
          <div className="space-y-5 rounded-xl border border-border bg-surface p-6">
            <div>
              <p className="font-mono text-xs text-ink-soft">font-display · Galindo · h1</p>
              <p className="font-display text-5xl text-ink">Aprende y crece</p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">font-display · Galindo · h2</p>
              <p className="font-display text-3xl text-ink">Tu primer portafolio</p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="font-mono text-xs text-ink-soft">font-sans · Nunito 700</p>
              <p className="text-xl font-bold text-ink">The quick brown fox invests early.</p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">font-sans · Nunito 400 · body</p>
              <p className="max-w-[65ch] text-ink">
                Invertir no tiene que dar miedo. Con lecciones cortas y dinero de
                práctica, aprendes a construir riqueza a tu propio ritmo — sin
                arriesgar ni un peso real.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-soft">font-sans · Nunito 400 · ink-soft</p>
              <p className="text-ink-soft">Secondary and helper text lives here.</p>
            </div>
          </div>
        </Section>

        {/* -- Components ---------------------------------------------- */}
        <Section title="Components" lead="How the tokens compose into the pieces you'll reuse.">
          {/* Buttons */}
          <p className="mb-3 font-semibold text-ink">Buttons</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-green px-5 py-2.5 font-semibold text-surface transition-colors hover:bg-green-strong">
              Empezar lección
            </button>
            <button className="rounded-full bg-red px-5 py-2.5 font-semibold text-surface transition-colors hover:bg-red-strong">
              Vender
            </button>
            <button className="rounded-full border border-border bg-surface px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-surface-sunken">
              Cancelar
            </button>
          </div>

          {/* Difficulty badges */}
          <p className="mb-3 mt-8 font-semibold text-ink">Difficulty badges</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg bg-easygreen px-4 py-1.5 font-semibold text-green-strong">
              Fácil
            </span>
            <span className="rounded-lg bg-mediumyellow px-4 py-1.5 font-semibold text-ink">
              Medio
            </span>
            <span className="rounded-lg bg-hardred px-4 py-1.5 font-semibold text-red-strong">
              Difícil
            </span>
          </div>

          {/* Card */}
          <p className="mb-3 mt-8 font-semibold text-ink">Card</p>
          <div className="max-w-sm rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink">VOO</h3>
              <span className="font-semibold text-green-strong">+2.4%</span>
            </div>
            <p className="mt-1 text-ink-soft">Vanguard S&amp;P 500 ETF</p>
            <p className="mt-4 font-display text-3xl text-ink">$512.30</p>
            <button className="mt-4 w-full rounded-full bg-green py-2.5 font-semibold text-surface transition-colors hover:bg-green-strong">
              Comprar
            </button>
          </div>
        </Section>

        {/* -- Do / Don't ---------------------------------------------- */}
        <Section
          title="The one trap"
          lead="If you remember nothing else: never set green or red base as small text on cream. Same hue, but only the strong twin is legible."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6">
              <span className="rounded-full bg-red-tint px-2.5 py-0.5 text-sm font-semibold text-red-strong">
                Don&apos;t
              </span>
              <p className="mt-4 text-green" style={{ color: 'var(--green)' }}>
                Ganaste $500 en efectivo de práctica.
              </p>
              <p className="mt-2 font-mono text-xs text-ink-soft">text-green · ~3.4:1 · washed out</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-sm font-semibold text-green-strong">
                Do
              </span>
              <p className="mt-4 text-green-strong">
                Ganaste $500 en efectivo de práctica.
              </p>
              <p className="mt-2 font-mono text-xs text-ink-soft">text-green-strong · ~5.3:1 · crisp</p>
            </div>
          </div>
        </Section>

        <footer className="mt-20 border-t border-border pt-6 text-ink-soft">
          <p>Dinero Sabio · Sistema de Diseño · edit tokens in <code className="font-mono text-sm">globals.css</code></p>
        </footer>
      </div>
    </main>
  )
}