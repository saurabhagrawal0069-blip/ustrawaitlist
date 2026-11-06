import type { FunnelSummary } from '@/lib/funnel';

/** Admin view of the visitor funnel: landed, played the video, opened the form, submitted it. */
export default function FunnelInsights({ summary }: { summary: FunnelSummary }) {
  const visitors = summary.steps[0]?.count ?? 0;
  return (
    <section className="adm-panel" aria-labelledby="funnel-title">
      <div className="adm-video-head">
        <h2 id="funnel-title">Visitor funnel</h2>
        <p className="adm-muted">
          Each visitor counts once per step, even if they repeat it. Share is of everyone who landed on the page. Registered visitors are listed separately below.
        </p>
      </div>

      {visitors === 0 ? (
        <p className="adm-empty">No visitors recorded yet.</p>
      ) : (
        <div className="adm-video-body">
          <div className="adm-funnel">
            {summary.steps.map((step) => (
              <div className="adm-funnel-row" key={step.label}>
                <div>
                  <div>{step.label}</div>
                  {step.breakdown.length > 0 && (
                    <div className="adm-muted adm-funnel-sub">
                      {step.breakdown.map((b) => `${b.label}: ${b.count}`).join('  ·  ')}
                    </div>
                  )}
                </div>
                <div className="adm-funnel-track">
                  <div className="adm-funnel-fill" style={{ width: `${step.percent}%` }} />
                </div>
                <div className="adm-funnel-num">
                  {step.count}
                  <small>{step.percent}%</small>
                </div>
              </div>
            ))}
          </div>
          <p className="adm-funnel-note">
            Of visitors who opened the form, <strong>{summary.formToSubmit}%</strong> submitted it.
          </p>
        </div>
      )}
    </section>
  );
}
