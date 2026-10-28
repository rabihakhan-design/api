import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Button, Confirm, Empty, PageHead, Pager, SearchBox, useToast, nextId } from '../components/ui';

const PER = 15;
export default function Todos() {
  const s = useFetch(() => api.todos());
  const toast = useToast();
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const [page, setPage] = useState(1);
  const [del, setDel] = useState(null);
  const todos = s.data || [];
  const done = todos.filter((t) => t.completed).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  const toggle = async (t) => {
    try {
      if (!t.local) await api.patch('todos', t.id, { completed: !t.completed });
      s.setData((d) => d.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
      toast(t.completed ? 'Marked as pending' : 'Marked as completed');
    } catch (e) { toast(e.message, 'error'); }
  };
  const add = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast('Task needs at least 3 characters', 'error');
    try {
      await api.create('todos', { title, completed: false, userId: 1 });
      s.setData((d) => [{ id: nextId(d), userId: 1, title, completed: false, local: true }, ...d]);
      setTitle(''); toast('Task added');
    } catch (x) { toast(x.message, 'error'); }
  };
  const remove = async () => {
    try {
      if (!del.local) await api.remove('todos', del.id);
      s.setData((d) => d.filter((x) => x.id !== del.id)); toast('Task deleted');
    } catch (e) { toast(e.message, 'error'); }
    setDel(null);
  };
  const list = todos.filter((t) => (filter === 'All' || (filter === 'Completed') === t.completed) && t.title.includes(q.toLowerCase()));

  return (
    <>
      <PageHead title="Todos" sub="Track tasks and toggle their status" />
      <Card className="mb-5">
        <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{done} of {todos.length} completed</span><span className="text-indigo-600">{pct}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-indigo-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} /></div>
        <p className="mt-2 text-xs text-slate-500">{todos.length - done} pending</p>
      </Card>
      <form onSubmit={add} className="mb-4 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a new task" aria-label="New task" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
        <Button type="submit"><Plus className="h-4 w-4" />Add task</Button>
      </form>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200">
          {['All', 'Completed', 'Pending'].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{f}</button>
          ))}
        </div>
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search tasks" />
      </div>
      <Async s={s}>
        {list.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {list.slice((page - 1) * PER, page * PER).map((t) => (
              <Card key={t.id} className="flex items-center gap-3 !p-3">
                <button aria-label={t.completed ? 'Mark as pending' : 'Mark as completed'} onClick={() => toggle(t)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${t.completed ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                  {t.completed && <Check className="h-4 w-4" />}
                </button>
                <span className={`flex-1 text-sm capitalize ${t.completed ? 'text-slate-400 line-through' : ''}`}>{t.title}</span>
                <span className="hidden text-xs text-slate-400 sm:block">User {t.userId}</span>
                <button aria-label="Delete task" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => setDel(t)}><Trash2 className="h-4 w-4" /></button>
              </Card>
            ))}
          </div>
        )}
      </Async>
      <Pager page={page} pages={Math.ceil(list.length / PER)} set={setPage} />
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={remove} text={`"${del?.title}" will be removed from the list.`} />
    </>
  );
}
