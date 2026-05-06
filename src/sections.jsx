// Rules, MyBookings, Footer, Hero

function Garland() {
  // String lights along the top of hero
  const bulbs = Array.from({ length: 22 }).map((_, i) => i);
  return (
    <div className="garland" aria-hidden="true">
      <svg viewBox="0 0 1400 90" preserveAspectRatio="none">
        <path d="M 0 20 Q 350 75 700 50 T 1400 25" stroke="rgba(250,248,244,0.35)" strokeWidth="1" fill="none" />
        {bulbs.map((i) => {
          const t = i / (bulbs.length - 1);
          const x = t * 1400;
          // Approximate y on curve
          const y = 20 + Math.sin(t * Math.PI) * 48 - Math.sin(t * Math.PI * 2) * 6;
          return (
            <g key={i} className="bulb" transform={`translate(${x} ${y})`}>
              <line x1="0" y1="-3" x2="0" y2="0" stroke="rgba(250,248,244,0.3)" strokeWidth="1" />
              <circle cx="0" cy="4" r="3.2" fill="#F4B858" />
              <circle cx="-1" cy="3" r="1" fill="#FFE4AA" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Hero({ t, heroBg }) {
  return (
    <section className="hero">
      <div className="hero-photo">
        <img src="/uploads/018a5a09-aa22-4b0a-a58a-71fa77de345c.png" alt="Мангальная зона" />
      </div>
      <div className="hero-overlay"></div>
      <Garland />
      <div className="hero-inner">
        <div className="hero-top fade-up">
          <div className="hero-eyebrow">
            <span className="led"></span>
            {t.hero_eyebrow}
          </div>
          <h1 className="hero-title">
            {t.hero_title_1} <em>{t.hero_title_em}</em><br/>
            {t.hero_title_2}
          </h1>
          <p className="hero-lede">{t.hero_lede}</p>
        </div>
        <div className="hero-card glass fade-up delay-1">
          <div className="hero-card-title">{t.meta_fee_label} · {t.meta_window_label}</div>
          <div className="meta-row">
            <span className="lbl">{t.meta_fee_label}</span>
            <span className="val amber">{t.meta_fee_val}</span>
          </div>
          <div className="meta-row">
            <span className="lbl">{t.meta_window_label}</span>
            <span className="val">{t.meta_window_val}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rules({ t }) {
  return (
    <section className="rules" id="rules">
      <div className="section-head">
        <h2>{t.rules_title}</h2>
      </div>
      <div className="rules-grid" style={{ marginTop: 16 }}>
        {t.rules.map((r, i) => (
          <div key={i} className="rule">
            <div className="rule-num">{i + 1}</div>
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
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="mybook-search">
          <div className="field">
            <label>{t.my_search}</label>
            <input type="text" value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
              results.map((b) => (
                <div key={b.id} className="mybook-row">
                  <div className="mb-date">
                    {parseIso(b.date).getDate()} {t.monthsGen[parseIso(b.date).getMonth()]}
                  </div>
                  <div className="mb-meta">
                    <strong>{b.name}</strong> · {b.phone}<br/>
                    {b.from}–{b.to} · {t.field_apt.toLowerCase()} {b.apt}
                  </div>
                  <div className={'mb-status' + (b.paid ? '' : ' pending')}>
                    {b.paid ? t.my_status_paid : t.my_status_pending}
                  </div>
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
        <a href="tel:+77771100329">+7 777 110 0329</a>
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
