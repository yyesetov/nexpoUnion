// Tweaks panel — toggle-able, persists via __edit_mode_set_keys

function TweaksPanel({ tweaks, setTweak, visible }) {
  if (!visible) return null;

  const Group = ({ label, keyName, options }) => (
    <div className="tp-group">
      <div className="tp-label">{label}</div>
      <div className="tp-opts">
        {options.map((o) => (
          <button key={o.v} className={'tp-opt' + (tweaks[keyName] === o.v ? ' on' : '')}
            onClick={() => setTweak(keyName, o.v)}>{o.l}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tweaks-panel">
      <h4>Tweaks</h4>
      <div className="tp-sub">Experiment · 5 dimensions</div>
      <Group label="Calendar view" keyName="calendarView" options={[
        { v: 'grid', l: 'Grid' },
        { v: 'list', l: 'List' },
        { v: 'timeline', l: 'Timeline' },
      ]} />
      <Group label="Accent color" keyName="accent" options={[
        { v: 'bronze', l: 'Bronze' },
        { v: 'graphite', l: 'Graphite' },
        { v: 'green', l: 'Green' },
      ]} />
      <Group label="Form placement" keyName="formPlacement" options={[
        { v: 'right', l: 'Right' },
        { v: 'bottom', l: 'Bottom' },
        { v: 'modal', l: 'Modal' },
      ]} />
      <Group label="Typography" keyName="typography" options={[
        { v: 'serif-sans', l: 'Serif + Sans' },
        { v: 'all-sans', l: 'All Sans' },
        { v: 'all-serif', l: 'All Serif' },
      ]} />
      <Group label="Hero background" keyName="heroBg" options={[
        { v: 'texture', l: 'Texture' },
        { v: 'lines', l: 'Grid' },
        { v: 'plain', l: 'Plain' },
      ]} />
    </div>
  );
}

function useTweaks() {
  const defaults = window.__TWEAK_DEFAULTS || {};
  const [tweaks, setTweaks] = React.useState(() => {
    const saved = localStorage.getItem('mangal.tweaks');
    return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults };
  });
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('mangal.tweaks', JSON.stringify(tweaks));
    document.body.dataset.calendarView = tweaks.calendarView;
    document.body.dataset.accent = tweaks.accent;
    document.body.dataset.formPlacement = tweaks.formPlacement;
    document.body.dataset.typography = tweaks.typography;
    document.body.dataset.heroBg = tweaks.heroBg;
  }, [tweaks]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setVisible(true);
      else if (e.data?.type === '__deactivate_edit_mode') setVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const setTweak = React.useCallback((key, val) => {
    setTweaks((prev) => {
      const next = { ...prev, [key]: val };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
      return next;
    });
  }, []);

  return { tweaks, setTweak, visible };
}

Object.assign(window, { TweaksPanel, useTweaks });
