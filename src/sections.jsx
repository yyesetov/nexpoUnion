// Hero (гирлянда + искры), Rules, MyBookings, Footer

function Garland() {
  const bulbs = Array.from({ length: 22 }).map((_, i) => i);
  return (
    <div className="garland" aria-hidden="true">
      <svg viewBox="0 0 1400 90" preserveAspectRatio="none">
        <path d="M 0 20 Q 350 75 700 50 T 1400 25" stroke="rgba(250,248,244,0.3)" strokeWidth="1" fill="none" />
        {bulbs.map((i) => {
          const p = i / (bulbs.length - 1);
          const x = p * 1400;
          const y = 20 + Math.sin(p * Math.PI) * 48 - Math.sin(p * Math.PI * 2) * 6;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <line x1="0" y1="-3" x2="0" y2="0" stroke="rgba(250,248,244,0.3)" strokeWidth="1" />
              <circle cx="0" cy="4" r="3.2" fill="#F4B858">
                <animate attributeName="opacity" values="1;0.35;1" dur={(1.8 + (i % 5) * 0.5) + 's'} repeatCount="indefinite" />
              </circle>
              <circle cx="-1" cy="3" r="1" fill="#FFE4AA" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Embers() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w, h, raf;
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const P = Array.from({ length: 34 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 700 + 400,
      s: 0.6 + Math.random() * 1.8, v: 0.2 + Math.random() * 0.7,
      o: 0.25 + Math.random() * 0.5, ph: Math.random() * 6.3,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      P.forEach((p) => {
        p.y -= p.v; p.ph += 0.012;
        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
        const x = (p.x + Math.sin(p.ph) * 14) % (w || 1);
        ctx.globalAlpha = p.o * Math.min(1, p.y / 80);
        ctx.fillStyle = '#F4B858';
        ctx.beginPath(); ctx.arc(x, p.y, p.s, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="hero-embers" aria-hidden="true" />;
}

function Hero({ t }) {
  const [imgOk, setImgOk] = React.useState(true);
  return (
    <section className="hero" style={{ padding: 0 }}>
      <div className="hero-photo">
        <div className="ph-fallback"></div>
        {imgOk && <img src="/uploads/018a5a09-aa22-4b0a-a58a-71fa77de345c.png" alt="Мангальная зона" onError={() => setImgOk(false)} />}
      </div>
      <div className="hero-overlay"></div>
      <Embers />
      <Garland />
      <div className="hero-inner">
        <div className="hero-top fade-up">
          <div className="hero-eyebrow"><span className="led"></span>{t.hero_eyebrow}</div>
          <h1 className="hero-title">
            {t.hero_title_1} <em>{t.hero_title_em}</em><br/>{t.hero_title_2}
          </h1>
          <p className="hero-lede">{t.hero_lede}</p>
        </div>
        <div className="hero-card glass fade-up delay-1">
          <div className="hero-card-title">{t.meta_fee_label} · {t.meta_window_label}</div>
          <div className="meta-row"><span className="lbl">{t.meta_fee_label}</span><span className="val amber">{t.meta_fee_val}</span></div>
          <div className="meta-row"><span className="lbl">{t.meta_window_label}</span><span className="val">{t.meta_window_val}</span></div>
        </div>
      </div>
    </section>
  );
}

const RULE_ICONS = [
  <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  <svg key="flame" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1-.5-2-.5-2s3 1.5 3 5a5.5 5.5 0 0 1-11 0c0-5 5.5-7 5.5-11z"/></svg>,
  <svg key="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>,
];

function Rules({ t }) {
  return (
    <section className="rules" id="rules">
      <div className="section-head">
        <h2>{t.rules_title}</h2>
        <span className="kicker">{t.rules_kicker}</span>
      </div>
      <div className="rules-grid" style={{ marginTop: 22 }}>
        {t.rules.map((r, i) => (
          <div key={i} className="rule">
            <div className="rule-ico">{RULE_ICONS[i % RULE_ICONS.length]}</div>
            <div className="rule-title">{r.t}</div>
            <div className="rule-body">{r.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MyBookings({ t, getByApt }) {
  const [query, setQuery] = React.useState('');
  const [searched, setSearched] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const find = () => {
    if (!query.trim()) return;
    setResults(getByApt(query));
    setSearched(true);
  };
  return (
    <section className="mybook" id="mybook">
      <div className="section-head">
        <h2>{t.my_title}</h2>
        <span className="kicker">{t.my_kicker}</span>
      </div>
      <div style={{ marginTop: 22 }}>
        <div className="mybook-search">
          <div className="field">
            <label>{t.my_search}</label>
            <input type="text" value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => e.key === 'Enter' && find()}
              placeholder="42" />
          </div>
          <button onClick={find}>{t.my_search_cta}</button>
        </div>
        {searched && (
          <div className="mybook-result">
            {results.length === 0 ? (
              <div className="mybook-empty">{t.my_empty}</div>
            ) : (
              results.map((b, i) => (
                <div key={b.id} className="mybook-row" style={{ animationDelay: (i * 0.07) + 's' }}>
                  <div className="mb-date">{parseIso(b.date).getDate()} {t.monthsGen[parseIso(b.date).getMonth()]}</div>
                  <div className="mb-meta"><strong>{b.name}</strong> · {b.phone}<br/>{t.field_apt.toLowerCase()} {b.apt}</div>
                  <div className={'mb-status' + (b.paid ? '' : ' pending')}>{b.paid ? t.my_status_paid : t.my_status_pending}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Nexpo Union</div>
            <div className="brand-sub">{t.brand_sub}</div>
          </div>
        </div>
        <p>{t.hero_lede}</p>
      </div>
      <div className="footer-col">
        <div className="footer-col-title">{t.footer_support.split(':')[0]}</div>
        <a href="tel:+77085382500">+7 708 538 2500</a>
        <span className="f-item">Kaspi · перевод</span>
      </div>
      <div className="footer-col">
        <div className="footer-col-title">Разделы</div>
        <a href="#book">{t.cal_section}</a>
        <a href="#rules">{t.rules_title}</a>
        <a href="#mybook">{t.my_title}</a>
      </div>
      <div className="footer-copy">
        <span>{t.footer_rights}</span>
        <span>Astana · EXPO</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Hero, Rules, MyBookings, Footer });
