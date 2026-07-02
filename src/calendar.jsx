// Calendar — three views: grid (default), list, timeline

function useCalMonth(cursor) {
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = addDays(today, 90);
  const monthStart = startOfMonth(cursor);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  return { today, maxDate, firstWeekday, daysInMonth };
}

function CalNav({ cursor, setCursor, t }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = addDays(today, 90);
  const canPrev = startOfMonth(cursor) > startOfMonth(today);
  const canNext = startOfMonth(cursor) < startOfMonth(maxDate);
  const prevMonth = () => canPrev && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => canNext && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  return (
    <div className="cal-head">
      <div className="cal-month">
        {t.months[cursor.getMonth()]}<span className="yr">{cursor.getFullYear()}</span>
      </div>
      <div className="cal-nav">
        <button onClick={prevMonth} disabled={!canPrev} aria-label={t.prev}>←</button>
        <button onClick={nextMonth} disabled={!canNext} aria-label={t.next}>→</button>
      </div>
    </div>
  );
}

function CalendarGrid(props) {
  const { cursor, setCursor, selected, setSelected, isBusy, getByDate, t } = props;
  const { today, maxDate, firstWeekday, daysInMonth } = useCalMonth(cursor);
  const daysInPrev = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate();
  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, out: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const iso = toIso(date);
    cells.push({
      day: d, iso,
      past: date < today || date > maxDate,
      partial: isBusy(iso),
      bookings: getByDate(iso),
      today: sameDate(date, today),
      selected: selected === iso,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstWeekday - daysInMonth + 1, out: true });

  return (
    <div className="cal-panel">
      <CalNav cursor={cursor} setCursor={setCursor} t={t} />
      <div className="cal-legend">
        <span><span className="dot free"></span>{t.legend_free}</span>
        <span><span className="dot partial"></span>{t.legend_busy}</span>
        <span><span className="dot sel"></span>{t.legend_sel}</span>
        <span><span className="dot past"></span>{t.legend_past}</span>
      </div>
      <div className="cal-grid" role="grid">
        {t.weekdays.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
        {cells.map((c, i) => {
          if (c.out) return <div key={'o'+i} className="cal-cell out"></div>;
          const cls = ['cal-cell', c.past ? 'past' : c.partial ? 'partial' : 'free'];
          if (c.today) cls.push('today');
          if (c.selected) cls.push('selected');
          return (
            <div key={c.iso} className={cls.join(' ')} onClick={() => !c.past && setSelected(c.iso)}>
              <div className="daynum">{c.day}</div>
              <div className="cell-meta">{c.past ? '—' : c.partial ? t.legend_busy : t.legend_free}</div>
              {c.bookings.length > 0 && (
                <div className="cell-bookers">
                  {c.bookings.map((b) => <div key={b.id} className="cell-booker">{b.name} · кв.{b.apt}</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarList(props) {
  const { cursor, setCursor, selected, setSelected, isBusy, getByDate, t } = props;
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = addDays(today, 90);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const rows = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const iso = toIso(date);
    rows.push({ date, iso, day: d, past: date < today || date > maxDate, partial: isBusy(iso), bookings: getByDate(iso) });
  }
  return (
    <div className="cal-panel">
      <CalNav cursor={cursor} setCursor={setCursor} t={t} />
      <div className="cal-list">
        {rows.map((r) => {
          const cls = ['cal-list-row'];
          if (r.past) cls.push('past');
          if (r.iso === selected) cls.push('selected');
          return (
            <div key={r.iso} className={cls.join(' ')} onClick={() => !r.past && setSelected(r.iso)}>
              <div className="cal-list-date">
                {r.day}<span className="dow">{t.weekdays[(r.date.getDay()+6)%7]}</span>
              </div>
              <div className={'cal-list-status' + (r.partial ? ' partial' : '')}>
                {r.past ? '—' : r.partial ? t.legend_busy : t.legend_free}
                {r.bookings.map((b) => <span key={b.id} className="booker">{b.name} · кв. {b.apt}</span>)}
              </div>
              <div className="cal-list-cta">{r.past || r.partial ? '' : t.nav_book + ' →'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTimeline(props) {
  const { cursor, setCursor, selected, setSelected, isBusy, getByDate, t } = props;
  const { today, maxDate, firstWeekday, daysInMonth } = useCalMonth(cursor);
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ out: true, key: 'pre'+i });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const iso = toIso(date);
    cells.push({ day: d, iso, past: date < today || date > maxDate, partial: isBusy(iso), bookings: getByDate(iso), selected: selected === iso });
  }
  while (cells.length % 7 !== 0) cells.push({ out: true, key: 'post'+cells.length });
  return (
    <div className="cal-panel">
      <CalNav cursor={cursor} setCursor={setCursor} t={t} />
      <div className="cal-timeline">
        {t.weekdays.map((w) => <div key={w} className="tl-weekday">{w}</div>)}
        {cells.map((c, i) => {
          if (c.out) return <div key={c.key || i} className="tl-cell out"></div>;
          const cls = ['tl-cell'];
          if (c.past) cls.push('past');
          if (c.selected) cls.push('selected');
          return (
            <div key={c.iso} className={cls.join(' ')} onClick={() => !c.past && setSelected(c.iso)}>
              <div className="daynum">{c.day}</div>
              {c.bookings.length > 0
                ? c.bookings.map((b) => <div key={b.id} className="tl-bar">{b.name} · кв.{b.apt}</div>)
                : !c.past && <div className="tl-status">{t.legend_free}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { CalendarGrid, CalendarList, CalendarTimeline });
