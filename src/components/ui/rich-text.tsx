import { parseRichText } from "@/utils/richText";
import { cn } from "@/lib/utils";

interface RichTextProps {
  text: string;
  className?: string;
}

/** Affiche un texte avec balisage léger : **gras**, __souligné__, *italique* */
export function RichText({ text, className }: RichTextProps) {
  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {parseRichText(line).map((seg, j) => (
            <span
              key={j}
              className={cn(seg.bold && "font-semibold text-foreground", seg.italic && "italic", seg.underline && "underline")}
            >
              {seg.text}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
