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
      <div className="tp-sub">Experiment</div>
      <Group label="Calendar view" keyName="calendarView" options={[
        { v: 'grid', l: 'Grid' }, { v: 'list', l: 'List' }, { v: 'timeline', l: 'Timeline' },
      ]} />
      <Group label="Form placement" keyName="formPlacement" options={[
        { v: 'right', l: 'Right' }, { v: 'bottom', l: 'Bottom' }, { v: 'modal', l: 'Modal' },
      ]} />
    </div>
  );
}

function useTweaks() {
  const defaults = window.__TWEAK_DEFAULTS || {};
  const [tweaks, setTweaks] = React.useState(() => {
    const saved = localStorage.getItem('mangal.tweaks.v2');
    return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults };
  });
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    localStorage.setItem('mangal.tweaks.v2', JSON.stringify(tweaks));
    document.body.dataset.calendarView = tweaks.calendarView;
    document.body.dataset.formPlacement = tweaks.formPlacement;
  }, [tweaks]);
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data && e.data.type === '__activate_edit_mode') setVisible(true);
      else if (e.data && e.data.type === '__deactivate_edit_mode') setVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);
  const setTweak = React.useCallback((key, val) => {
    setTweaks((prev) => {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
      return { ...prev, [key]: val };
    });
  }, []);
  return { tweaks, setTweak, visible };
}

Object.assign(window, { TweaksPanel, useTweaks });
