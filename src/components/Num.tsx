import { changeClass, fmtChange, fmtPercent } from "../lib/format";

export function Delta({
  change,
  percent,
}: {
  change?: number;
  percent?: number;
}) {
  const cls = changeClass(percent ?? change);
  return (
    <span className={`tnum ${cls}`}>
      {fmtChange(change)} ({fmtPercent(percent)})
    </span>
  );
}
