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

function App() {
  const { lang, setLang, t } = useI18n();
  const { bookings, loading, isBusy, getByDate, add, cancel, getByApt, refresh } = useBookings();
  const { tweaks, setTweak, visible } = useTweaks();
  useReveal();
  const scrolled = useScrolled();

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
    if (iso && tweaks.formPlacement === 'modal') setModalFormOpen(true);
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
            <div className="brand-sub">{t.brand_sub}</div>
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
          {tweaks.formPlacement !== 'modal' && <div className="form-wrap inline">{formNode}</div>}
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
