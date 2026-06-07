type Val = string | number | false | null | undefined;
type Input = Val | Input[];

/**
 * Tiny classname joiner. No dependency on clsx/tailwind-merge.
 * Accepts strings, falsy values, and nested arrays.
 */
export function cn(...inputs: Input[]): string {
  const out: string[] = [];
  const visit = (v: Input) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) {
      for (const x of v) visit(x);
    } else {
      out.push(String(v));
    }
  };
  for (const v of inputs) visit(v);
  return out.join(" ");
}
