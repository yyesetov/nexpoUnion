// Booking form

function BookingForm({ selected, setSelected, t, isBusy, onBook, getByDate }) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('+7 ');
  const [apt, setApt] = React.useState('');
  const [errs, setErrs] = React.useState({});
  const busy = selected && isBusy(selected);
  const existing = busy ? getByDate(selected)[0] : null;

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    const parts = ['+' + (digits[0] || '')];
    if (digits.length > 1) parts.push(' ' + digits.slice(1, 4));
    if (digits.length > 4) parts.push(' ' + digits.slice(4, 7));
    if (digits.length > 7) parts.push(' ' + digits.slice(7, 9));
    if (digits.length > 9) parts.push(' ' + digits.slice(9, 11));
    return parts.join('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!name.trim()) next.name = t.err_name;
    if (phone.replace(/\D/g, '').length < 11) next.phone = t.err_phone;
    const aptNum = parseInt(apt, 10);
    if (!apt.trim() || isNaN(aptNum) || aptNum < 1 || aptNum > 300) next.apt = t.err_apt;
    setErrs(next);
    if (Object.keys(next).length) return;
    onBook({ name: name.trim(), phone, apt: apt.trim(), date: selected });
    setName(''); setPhone('+7 '); setApt('');
  };

  return (
    <div className="form-card">
      <h3>{busy ? t.busy_title_1 + ' ' + t.busy_title_em : t.form_title}</h3>
      <div className="form-sub">{busy ? t.busy_body : t.form_sub}</div>

      {selected ? (
        <div className="selected-date" key={selected}>
          <div>
            <div className="sd-label">{t.field_selected}</div>
            <div className="sd-value">{formatLong(selected, t)}</div>
          </div>
        </div>
      ) : (
        <div className="selected-date none">
          <div className="sd-hint">↖ {t.field_pickdate}</div>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label>{t.field_name}</label>
          <input type="text" value={busy ? existing.name : name}
            placeholder={t.field_name_ph} maxLength={50} readOnly={busy}
            onChange={(e) => !busy && setName(e.target.value.slice(0, 50))} />
          {errs.name && <div className="field-err">{errs.name}</div>}
        </div>
        <div className="field row">
          <div>
            <label>{t.field_phone}</label>
            <input type="tel" value={busy ? (existing.phone || '—') : phone}
              placeholder={t.field_phone_ph} readOnly={busy}
              onChange={(e) => !busy && setPhone(formatPhone(e.target.value))} />
            {errs.phone && <div className="field-err">{errs.phone}</div>}
          </div>
          <div>
            <label>{t.field_apt}</label>
            <input type="text" value={busy ? existing.apt : apt}
              placeholder={t.field_apt_ph} readOnly={busy}
              onChange={(e) => !busy && setApt(e.target.value.replace(/\D/g, '').slice(0, 3))} />
            {errs.apt && <div className="field-err">{errs.apt}</div>}
          </div>
        </div>
        {!busy && (
          <React.Fragment>
            <div className="fee-row">
              <span className="fee-label">
                {t.fee_label}
                <span className="fee-info" tabIndex="0">?
                  <span className="tip"><strong>{t.fee_tip_title}</strong><br/>{t.fee_tip_body}</span>
                </span>
              </span>
              <span className="fee-val">{t.fee_val}</span>
            </div>
            <button type="submit" className="submit" disabled={!selected}>{t.submit}</button>
            <div className="form-hint">{t.form_hint}</div>
          </React.Fragment>
        )}
      </form>
    </div>
  );
}

Object.assign(window, { BookingForm });
