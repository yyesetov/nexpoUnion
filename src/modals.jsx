// Modals: payment confirmation + busy-date + cancel confirm + toast

function PaymentModal({ booking, t, onClose }) {
  const [copied, setCopied] = React.useState(false);
  if (!booking) return null;
  const phone = '+7 708 538 2500';
  const copy = () => {
    navigator.clipboard?.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => setCopied(true));
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="m-eyebrow">{t.modal_pay_eyebrow}</div>
        <h3>{t.modal_pay_title_1} <em>{t.modal_pay_title_em}</em></h3>
        <div className="modal-body">
          <p style={{ margin: '0 0 8px' }}>
            <strong>{formatLong(booking.date, t)}</strong> · {booking.from}–{booking.to} · {t.field_apt.toLowerCase()} {booking.apt}
          </p>
          <p style={{ margin: 0 }}>{t.modal_pay_body}</p>
        </div>

        <div className="kaspi-card">
          <div className="kc-label">{t.modal_pay_label}</div>
          <div className="kc-phone">
            <span>{phone}</span>
            <button className={'copy-btn' + (copied ? ' copied' : '')} onClick={copy}>
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <div className="kc-amount">
            <span>{t.modal_pay_amount}</span>
            <span className="amt">{t.modal_pay_amount_val}</span>
          </div>
        </div>

        <div className="modal-body" style={{ fontSize: 12, borderLeft: '1px solid var(--accent)', paddingLeft: 14 }}>
          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--accent)' }}>{t.modal_pay_why}</strong>
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
      <div className="modal busy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="m-eyebrow" style={{ color: 'var(--danger)' }}>{t.busy_eyebrow}</div>
        <h3>{t.busy_title_1} <em>{t.busy_title_em}</em></h3>
        <div className="modal-body">
          <p style={{ margin: '0 0 14px' }}>{t.busy_body}</p>
          {booking && (
            <div style={{
              padding: '16px 18px',
              background: 'var(--bg)',
              border: '1px solid var(--line-2)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              letterSpacing: '0.08em',
              lineHeight: 1.8,
            }}>
              <div>{formatLong(booking.date, t)} · {formatDow(booking.date, t)}</div>
              <div style={{ color: 'var(--text-dim)' }}>
                {booking.name} · {t.field_apt.toLowerCase()} {booking.apt} · {booking.from}–{booking.to}
              </div>
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
  return <div className={'toast' + (show ? ' on' : '')}>{message}</div>;
}

Object.assign(window, { PaymentModal, BusyDateModal, Toast });
