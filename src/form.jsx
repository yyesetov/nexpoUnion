// Booking form

function BookingForm({ selected, setSelected, t, isBusy, onBook, getByDate }) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('+7 ');
  const [apt, setApt] = React.useState('');
  const [from, setFrom] = React.useState('18:00');
  const [to, setTo] = React.useState('22:00');
  const [errs, setErrs] = React.useState({});

  const existingBookings = selected ? getByDate(selected) : [];

  const hasTimeOverlap = (f, t) => {
    return existingBookings.some((b) => b.from < t && b.to > f);
  };

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    const parts = [];
    parts.push('+' + (digits[0] || ''));
    if (digits.length > 1) parts.push(' ' + digits.slice(1, 4));
    if (digits.length > 4) parts.push(' ' + digits.slice(4, 7));
    if (digits.length > 7) parts.push(' ' + digits.slice(7, 9));
    if (digits.length > 9) parts.push(' ' + digits.slice(9, 11));
    return parts.join('');
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrs = {};
    if (!name.trim()) nextErrs.name = t.err_name;
    const d = phone.replace(/\D/g, '');
    if (d.length < 11) nextErrs.phone = t.err_phone;
    const aptNum = parseInt(apt, 10);
    if (!apt.trim() || isNaN(aptNum) || aptNum < 1 || aptNum > 300) nextErrs.apt = t.err_apt;
    if (!from) nextErrs.from = t.err_from;
    if (!to) nextErrs.to = t.err_to;
    if (from && to && from >= to) nextErrs.to = t.err_order;
    if (from && to && from < to && hasTimeOverlap(from, to)) nextErrs.from = t.err_overlap || 'Время пересекается с другой бронью';
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length) return;
    onBook({ name: name.trim(), phone, apt: apt.trim(), from, to, date: selected });
    setName(''); setPhone('+7 '); setApt(''); setFrom('18:00'); setTo('22:00');
  };

  return (
    <div className="form-card">
      <h3>{t.form_title}</h3>
      <div className="form-sub">{t.form_sub}</div>

      {selected ? (
        <div className="selected-date">
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
          <input type="text" value={name} placeholder={t.field_name_ph} maxLength={50}
            onChange={(e) => setName(e.target.value.slice(0, 50))} />
          {errs.name && <div className="field-err">{errs.name}</div>}
        </div>

        <div className="field row">
          <div>
            <label>{t.field_phone}</label>
            <input type="tel" value={phone} placeholder={t.field_phone_ph}
              onChange={(e) => setPhone(formatPhone(e.target.value))} />
            {errs.phone && <div className="field-err">{errs.phone}</div>}
          </div>
          <div>
            <label>{t.field_apt}</label>
            <input type="text" value={apt} placeholder={t.field_apt_ph}
              onChange={(e) => setApt(e.target.value.replace(/\D/g, '').slice(0, 3))} />
            {errs.apt && <div className="field-err">{errs.apt}</div>}
          </div>
        </div>

        <div className="field row">
          <div>
            <label>{t.field_time_from}</label>
            <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
            {errs.from && <div className="field-err">{errs.from}</div>}
          </div>
          <div>
            <label>{t.field_time_to}</label>
            <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
            {errs.to && <div className="field-err">{errs.to}</div>}
          </div>
        </div>

        <div className="fee-row">
          <span className="fee-label">
            {t.fee_label}
            <span className="fee-info" tabIndex="0">
              ?
              <span className="tip">
                <strong>{t.fee_tip_title}</strong><br/>
                {t.fee_tip_body}
              </span>
            </span>
          </span>
          <span className="fee-val">{t.fee_val}</span>
        </div>

        {existingBookings.length > 0 && (
          <div className="existing-slots">
            <div className="es-label">{t.booked_slots || 'Занятые слоты'}</div>
            {existingBookings.map((b) => (
              <div key={b.id} className="es-row">{b.from}–{b.to} · {b.name} · кв. {b.apt} · {b.phone}</div>
            ))}
          </div>
        )}

        <button type="submit" className="submit" disabled={!selected}>
          {t.submit}
        </button>
        <div className="form-hint">{t.form_hint}</div>
      </form>
    </div>
  );
}

Object.assign(window, { BookingForm });
