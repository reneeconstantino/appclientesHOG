"use client";

// One pip per expected head (titular + PAX). Filled = arrived.
// Cyan when the quota is complete, ember while the group is still open.
export default function QuotaMeter({ total, arrived }: { total: number; arrived: number }) {
  const complete = arrived >= total && total > 0;
  const pips = Array.from({ length: Math.max(total, 1) });
  return (
    <div className="flex gap-1" aria-label={`${arrived} de ${total} personas`}>
      {pips.map((_, i) => {
        const on = i < arrived;
        const cls = on ? (complete ? "pip pip--filled" : "pip pip--partial") : "pip";
        return <span key={i} className={`${cls} flex-1`} />;
      })}
    </div>
  );
}
