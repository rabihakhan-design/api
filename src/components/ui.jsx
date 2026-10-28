import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Inbox, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ToastCtx = createContext();
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, msg, type }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className="fade flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm shadow-lg ring-1 ring-slate-200">
            {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const Card = ({ className = '', ...p }) => (
  <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md ${className}`} {...p} />
);
const V = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  ghost: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};
export const Button = ({ variant = 'primary', className = '', ...p }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${V[variant]} ${className}`} {...p} />
);
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={`fade max-h-[90vh] w-full overflow-auto rounded-2xl bg-white p-6 shadow-xl ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
export const Confirm = ({ open, onClose, onConfirm, text }) => (
  <Modal open={open} onClose={onClose} title="Delete this item?">
    <p className="mb-5 text-sm text-slate-600">{text}</p>
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>Delete</Button>
    </div>
  </Modal>
);
export const Skeleton = ({ n = 6, className = 'h-32' }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: n }).map((_, i) => <div key={i} className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />)}
  </div>
);
export const Empty = ({ text = 'Nothing matches your filters. Try clearing the search.' }) => (
  <div className="flex flex-col items-center py-16 text-center text-slate-400"><Inbox className="mb-2 h-10 w-10" />{text}</div>
);
export const ErrorBox = ({ msg, retry }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-center text-rose-600">
    <AlertCircle className="h-10 w-10" />{msg}
    {retry && <Button variant="ghost" onClick={retry}><RefreshCw className="h-4 w-4" />Try again</Button>}
  </div>
);
export function Field({ label, error, textarea, ...p }) {
  const C = textarea ? 'textarea' : 'input';
  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <C {...p} aria-invalid={!!error} {...(textarea ? { rows: 4 } : {})}
        className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 ${error ? 'border-rose-400' : 'border-slate-200'}`} />
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}
export const SearchBox = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative min-w-[200px] flex-1">
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
  </div>
);
export const Select = (p) => (
  <select {...p} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
);
export function Pager({ page, pages, set }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      <Button variant="ghost" aria-label="Previous page" disabled={page <= 1} onClick={() => set(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
      Page {page} of {pages}
      <Button variant="ghost" aria-label="Next page" disabled={page >= pages} onClick={() => set(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
    </div>
  );
}
export const Avatar = ({ name = '' }) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
    {name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
  </div>
);
export const Async = ({ s, skeleton, children }) =>
  s.loading ? skeleton || <Skeleton /> : s.error ? <ErrorBox msg={s.error} retry={s.retry} /> : children;
export const PageHead = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">{sub}</p></div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);
export const nextId = (list) => Math.max(0, ...list.map((i) => i.id)) + 1;
