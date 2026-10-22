"use client";

import { Fragment, useState } from "react";
import type { Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Reveal } from "@/components/ui/Reveal";

const STATUS_CLASS = ["status--ok", "status--ok", "status--done", "status--warn"];

export function Apps({ t }: { t: Messages["apps"] }) {
  const [open, setOpen] = useState<number | null>(0);
  const f = t.first;
  return (
    <section id="anwendungen" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className="apps">
          <div className="panel app-main">
            <span className="app-label">{f.label}</span>
            <h3 className="h-card" style={{ fontSize: 28 }}>{f.title}</h3>
            <p className="muted" style={{ margin: 0, maxWidth: 560 }}>{f.text}</p>
            <table className="ledger">
              <thead>
                <tr>
                  <th>{f.columns[0]}</th>
                  <th className="num">{f.columns[1]}</th>
                  <th className="num">{f.columns[2]}</th>
                  <th>{f.columns[3]}</th>
                </tr>
              </thead>
              <tbody>
                {f.rows.map((r, i) => (
                  <Fragment key={r.pos}>
                    <tr>
                      <td>{r.pos}</td>
                      <td className="num">{r.qty}</td>
                      <td className="num">
                        <button
                          type="button"
                          className="amount-btn"
                          aria-expanded={open === i}
                          aria-controls={`ev-${i}`}
                          onClick={() => setOpen(open === i ? null : i)}
                        >
                          {r.amount}
                        </button>
                      </td>
                      <td>
                        <span className={`status ${STATUS_CLASS[i]}`}>{r.status}</span>
                      </td>
                    </tr>
                    {open === i && (
                      <tr className="ev-row" id={`ev-${i}`}>
                        <td colSpan={4}>
                          <ul className="ev-list" aria-label={f.evidenceTitle}>
                            {r.evidence.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <p className="note">{f.note}</p>
          </div>
          <div>
            <p className="eyebrow" style={{ color: "rgba(10,16,32,.5)" }}>{t.plannedLabel}</p>
            <div className="planned">
              {t.planned.map((p, i) => (
                <Reveal key={p.title} className="planned__item" delay={i * 80}>
                  <span className="planned__tag">
                    {String(i + 2).padStart(2, "0")} · {t.plannedLabel}
                  </span>
                  <h3 className="h-card" style={{ marginTop: 8 }}>{p.title}</h3>
                  <p>{p.text}</p>
                </Reveal>
              ))}
              <div className="planned__item">
                <Ph text={t.plannedPlaceholder} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
