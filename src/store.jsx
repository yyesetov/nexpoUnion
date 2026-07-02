// Booking store — API-backed (логика без изменений)

const api = {
  list(params) {
    const qs = params ? '?' + new URLSearchParams(params) : '';
    return fetch('/api/bookings' + qs).then((r) => r.json());
  },
  create(data) {
    return fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) return r.json().then((e) => Promise.reject(e));
      return r.json();
    });
  },
  remove(id) {
    return fetch('/api/bookings/' + id, { method: 'DELETE' }).then((r) => {
      if (!r.ok) return r.json().then((e) => Promise.reject(e));
    });
  },
};

function useBookings() {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.list().then((data) => {
      setBookings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const isBusy = React.useCallback((dateIso) => {
    return bookings.some((b) => b.date === dateIso);
  }, [bookings]);

  const getByDate = React.useCallback((dateIso) => {
    return bookings.filter((b) => b.date === dateIso);
  }, [bookings]);

  const add = React.useCallback(async (booking) => {
    const created = await api.create(booking);
    setBookings((prev) => [...prev, created]);
    return created;
  }, []);

  const cancel = React.useCallback(async (id) => {
    await api.remove(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getByApt = React.useCallback((apt) => {
    const a = String(apt).trim();
    return bookings.filter((b) => String(b.apt).trim() === a);
  }, [bookings]);

  const refresh = React.useCallback(() => {
    api.list().then(setBookings);
  }, []);

  return { bookings, loading, isBusy, getByDate, add, cancel, getByApt, refresh };
}

// Utilities
function toIso(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function sameDate(a, b) { return toIso(a) === toIso(b); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function formatLong(iso, t) {
  const d = parseIso(iso);
  return `${d.getDate()} ${t.monthsGen[d.getMonth()]} ${d.getFullYear()}`;
}
function formatDow(iso, t) {
  const d = parseIso(iso);
  const dow = (d.getDay() + 6) % 7;
  return t.weekdaysLong[dow];
}

Object.assign(window, { useBookings, toIso, parseIso, sameDate, addDays, startOfMonth, formatLong, formatDow });
