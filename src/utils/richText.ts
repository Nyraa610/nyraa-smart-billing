export interface RichSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const TOKEN = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[\s\S]+?\*|~[\s\S]+?~)/g;

/** Parse une chaîne avec balisage léger : **gras**, __souligné__, *italique*, ~souligné~ */
export function parseRichText(input: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;

  while ((match = TOKEN.exec(input)) !== null) {
    if (match.index > last) segments.push({ text: input.slice(last, match.index) });
    const token = match[0];
    if (token.startsWith('**')) segments.push({ text: token.slice(2, -2), bold: true });
    else if (token.startsWith('__')) segments.push({ text: token.slice(2, -2), underline: true });
    else if (token.startsWith('~')) segments.push({ text: token.slice(1, -1), underline: true });
    else segments.push({ text: token.slice(1, -1), italic: true });
    last = match.index + token.length;
  }
  if (last < input.length) segments.push({ text: input.slice(last) });
  return segments.length ? segments : [{ text: input }];
}

export function stripRichMarkup(input: string): string {
  return parseRichText(input).map(s => s.text).join('');
}

interface PlacedSegment extends RichSegment {
  x: number;
  width: number;
}

interface JsPdfLike {
  setFont: (family: string, style: string) => void;
  getTextWidth: (text: string) => number;
}

const fontStyle = (s: RichSegment) => (s.bold && s.italic ? 'bolditalic' : s.bold ? 'bold' : s.italic ? 'italic' : 'normal');

/** Découpe un texte balisé en lignes positionnées, prêtes à être dessinées dans un PDF. */
export function layoutRichText(doc: JsPdfLike, text: string, maxWidth: number): PlacedSegment[][] {
  const lines: PlacedSegment[][] = [];

  text.split('\n').forEach(rawLine => {
    let current: PlacedSegment[] = [];
    let x = 0;

    parseRichText(rawLine).forEach(seg => {
      doc.setFont('helvetica', fontStyle(seg));
      const words = seg.text.split(/(\s+)/).filter(w => w !== '');
      words.forEach(word => {
        const w = doc.getTextWidth(word);
        if (x + w > maxWidth && current.length > 0 && word.trim() !== '') {
          lines.push(current);
          current = [];
          x = 0;
        }
        if (x === 0 && word.trim() === '') return;
        current.push({ ...seg, text: word, x, width: w });
        x += w;
      });
    });

    lines.push(current);
  });

  doc.setFont('helvetica', 'normal');
  return lines.length ? lines : [[]];
}

export type { PlacedSegment };
