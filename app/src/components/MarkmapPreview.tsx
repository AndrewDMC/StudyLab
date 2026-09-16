import { useEffect, useRef } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

// Preview a mappa mentale di un outline Markdown (Fase 9 §A: "attrito
// zero, usalo di default" — nessun formato nuovo, lo schema *è* il
// markdown). Un solo Transformer condiviso: è senza stato per file, creare
// un'istanza per render sarebbe puro spreco.
const transformer = new Transformer();

export function MarkmapPreview({ outline }: { outline: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!mmRef.current) {
      // autoFit: true, non un .fit() manuale subito dopo setData — il
      // layout dei nodi (misurato sui <div> dentro i foreignObject) è
      // asincrono, un fit sincrono nello stesso tick vede ancora le
      // dimensioni non calcolate e produce una mappa quasi invisibile
      // (bug reale trovato testando: nodi compressi in ~29px invece di
      // occupare tutto il canvas). autoFit rifà il fit da dentro il
      // render lifecycle interno di markmap-view, dopo la misura vera.
      mmRef.current = Markmap.create(svgRef.current, { autoFit: true });
    }
    const testo = outline.trim() || '- (scrivi un outline per vedere la mappa)';
    const { root } = transformer.transform(testo);
    mmRef.current.setData(root);
  }, [outline]);

  return <svg ref={svgRef} className="markmap-svg" />;
}
