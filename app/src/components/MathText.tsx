import { Fragment, useMemo } from 'react';
import katex from 'katex';

// Rende testo che può contenere LaTeX inline ($...$) o display ($$...$$),
// intervallato a testo normale — così le domande/risposte delle flashcard
// (specialmente in Matematica) possono contenere formule senza che il
// resto del sistema debba sapere nulla di LaTeX: è solo testo Markdown con
// dei $...$ dentro, letto così com'è dal vault.
export function MathText({ text }: { text: string }) {
  const parti = useMemo(() => splitMath(text), [text]);
  return (
    <>
      {parti.map((p, i) => {
        if (p.tipo === 'testo') {
          // Preserva gli a-capo dell'originale.
          return (
            <Fragment key={i}>
              {p.valore.split('\n').map((riga, j, arr) => (
                <Fragment key={j}>
                  {riga}
                  {j < arr.length - 1 && <br />}
                </Fragment>
              ))}
            </Fragment>
          );
        }
        const html = katex.renderToString(p.valore, {
          throwOnError: false,
          displayMode: p.tipo === 'display',
        });
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}

type Parte = { tipo: 'testo' | 'inline' | 'display'; valore: string };

function splitMath(text: string): Parte[] {
  const out: Parte[] = [];
  // $$...$$ prima (display), poi $...$ (inline) su ciò che resta.
  const reDisplay = /\$\$([\s\S]+?)\$\$/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = reDisplay.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(...splitInline(text.slice(lastIndex, m.index)));
    out.push({ tipo: 'display', valore: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push(...splitInline(text.slice(lastIndex)));
  return out;
}

function splitInline(text: string): Parte[] {
  const out: Parte[] = [];
  const re = /\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) out.push({ tipo: 'testo', valore: text.slice(lastIndex, m.index) });
    out.push({ tipo: 'inline', valore: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push({ tipo: 'testo', valore: text.slice(lastIndex) });
  return out;
}
