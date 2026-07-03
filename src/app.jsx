// App — топбар, секции, модалки, Dynamic Island toast, mobile FAB

function useReveal() {
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

function useScrolled() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

// True when the viewport is too narrow to fit the calendar + form in one row
function useNarrow() {
  const query = '(max-width:899px)';
  const [narrow, setNarrow] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

function App() {
  const { lang, setLang, t } = useI18n();
  const { bookings, loading, isBusy, getByDate, add, cancel, getByApt, refresh } = useBookings();
  const { tweaks, setTweak, visible } = useTweaks();
  useReveal();
  const scrolled = useScrolled();
  const narrow = useNarrow();
  // On narrow screens the form becomes a modal regardless of the tweak,
  // so it never gets awkwardly stacked under the calendar on mobile.
  const formPlacement = narrow ? 'modal' : tweaks.formPlacement;

  const [cursor, setCursor] = React.useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = React.useState(null);
  const [modalBooking, setModalBooking] = React.useState(null);
  const [toast, setToast] = React.useState({ on: false, msg: '' });
  const [modalFormOpen, setModalFormOpen] = React.useState(false);
  const [fabHidden, setFabHidden] = React.useState(false);

  React.useEffect(() => {
    const book = document.getElementById('book');
    if (!book) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => setFabHidden(e.isIntersecting)), { threshold: 0.15 });
    io.observe(book);
    return () => io.disconnect();
  }, [loading]);

  const showToast = (msg) => {
    setToast({ on: true, msg });
    setTimeout(() => setToast((s) => ({ ...s, on: false })), 2600);
  };

  const handleBook = async (data) => {
    try {
      const b = await add(data);
      setSelected(null);
      setModalBooking(b);
      setModalFormOpen(false);
      showToast(t.toast_booked);
    } catch (err) {
      if (err && err.error) {
        showToast(err.error);
        if (err.bookings) refresh();
      } else {
        showToast('Ошибка сервера');
      }
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const handleSelectDate = (iso) => {
    setSelected(iso);
    if (iso && formPlacement === 'modal') setModalFormOpen(true);
  };

  const calendarProps = { cursor, setCursor, selected, setSelected: handleSelectDate, bookings, isBusy, getByDate, t, lang, onBusyClick: () => {} };
  const CalComp = { grid: CalendarGrid, list: CalendarList, timeline: CalendarTimeline }[tweaks.calendarView] || CalendarGrid;
  const formNode = (
    <BookingForm selected={selected} setSelected={setSelected} t={t} isBusy={isBusy} onBook={handleBook} getByDate={getByDate} />
  );

  return (
    <div className="app">
      <header className={'topbar' + (scrolled ? ' scrolled' : '')}>
        <div className="brand">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Nexpo Union</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="lang-switch">
            <button className={lang === 'kz' ? 'on' : ''} onClick={() => setLang('kz')}>KZ</button>
            <button className={lang === 'ru' ? 'on' : ''} onClick={() => setLang('ru')}>RU</button>
          </div>
          <button className="topbar-cta" onClick={() => scrollTo('book')}>{t.nav_book}</button>
        </div>
      </header>

      <Hero t={t} />

      <section id="book" className="reveal">
        <div className="section-head">
          <h2>{t.cal_section}</h2>
          <span className="kicker">{t.cal_kicker}</span>
        </div>
        <div className="calendar-block">
          <div><CalComp {...calendarProps} /></div>
          {formPlacement !== 'modal' && <div className="form-wrap inline">{formNode}</div>}
        </div>
      </section>

      <div className="reveal"><Rules t={t} /></div>
      <div className="reveal"><MyBookings t={t} getByApt={getByApt} /></div>

      <Footer t={t} />

      <button className={'fab-book' + (fabHidden ? ' hidden' : '')} onClick={() => scrollTo('book')}>
        {t.nav_book} · 2 000 ₸
      </button>

      {modalFormOpen && (
        <div className="modal-overlay" onClick={() => setModalFormOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalFormOpen(false)}>×</button>
            {formNode}
          </div>
        </div>
      )}
      {modalBooking && <PaymentModal booking={modalBooking} t={t} onClose={() => setModalBooking(null)} />}

      <Toast show={toast.on} message={toast.msg} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={visible} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
