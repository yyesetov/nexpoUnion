// Modals: iOS-sheet оплата + занятая дата + Dynamic Island toast

function BurstSparks() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = 300; c.height = 170;
    const P = Array.from({ length: 26 }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const sp = 2 + Math.random() * 4;
      return { x: 150, y: 150, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, s: 1 + Math.random() * 2 };
    });
    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, 300, 170);
      let alive = false;
      P.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.life -= 0.017;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = Math.random() > 0.5 ? '#F4B858' : '#FFDFA0';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.life, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="burst" style={{ width: 300, height: 170, transform: 'translateX(-50%)' }} aria-hidden="true" />;
}

function PaymentModal({ booking, t, onClose }) {
  const [copied, setCopied] = React.useState(false);
  if (!booking) return null;
  const phone = '+7 708 538 2500';
  const copy = () => {
    (navigator.clipboard ? navigator.clipboard.writeText(phone) : Promise.reject())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })
      .catch(() => setCopied(true));
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <BurstSparks />
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="m-eyebrow">{t.modal_pay_eyebrow}</div>
        <h3>{t.modal_pay_title_1} <em>{t.modal_pay_title_em}</em></h3>
        <div className="modal-body">
          <p style={{ margin: '0 0 8px' }}><strong>{formatLong(booking.date, t)}</strong> · {t.field_apt.toLowerCase()} {booking.apt}</p>
          <p style={{ margin: 0 }}>{t.modal_pay_body}</p>
        </div>
        <div className="kaspi-card">
          <div className="kc-label">{t.modal_pay_label}</div>
          <div className="kc-phone">
            <span>{phone}</span>
            <button className={'copy-btn' + (copied ? ' copied' : '')} onClick={copy}>
              {copied ? '✓ ' + t.copied : t.copy}
            </button>
          </div>
          <div className="kc-amount">
            <span>{t.modal_pay_amount}</span>
            <span className="amt">{t.modal_pay_amount_val}</span>
          </div>
        </div>
        <div className="modal-body" style={{ fontSize: 12, borderLeft: '2px solid var(--amber)', paddingLeft: 14, borderRadius: 0 }}>
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--amber)' }}>{t.modal_pay_why}</strong>
          {t.modal_pay_why_body}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>{t.modal_my}</button>
          <button className="primary" onClick={onClose}>{t.modal_done}</button>
        </div>
      </div>
    </div>
  );
}

function BusyDateModal({ dateIso, booking, t, onClose }) {
  if (!dateIso) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="m-eyebrow" style={{ color: 'var(--danger)' }}>{t.busy_eyebrow}</div>
        <h3>{t.busy_title_1} <em>{t.busy_title_em}</em></h3>
        <div className="modal-body">
          <p style={{ margin: '0 0 14px' }}>{t.busy_body}</p>
          {booking && (
            <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,.05)', border: '1px solid var(--line-2)', borderRadius: 14, fontSize: 13, lineHeight: 1.8 }}>
              <div>{formatLong(booking.date, t)} · {formatDow(booking.date, t)}</div>
              <div style={{ color: 'var(--dim)' }}>{booking.name} · {t.field_apt.toLowerCase()} {booking.apt}</div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="primary" onClick={onClose}>{t.busy_pick}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, show }) {
  return (
    <div className={'toast' + (show ? ' on' : '')}>
      <span className="tick">✓</span>{message}
    </div>
  );
}

Object.assign(window, { PaymentModal, BusyDateModal, Toast });
