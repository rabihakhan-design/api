import { useState } from 'react';
import { Plus, Mail, Phone, Globe, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Avatar, Button, Empty, Field, Modal, PageHead, SearchBox, Select, Skeleton, useToast, nextId } from '../components/ui';

function UserDetail({ user, onClose }) {
  const s = useFetch(() => Promise.all([user.local ? [] : api.postsByUser(user.id), user.local ? [] : api.todosByUser(user.id)]), [user.id]);
  return (
    <Modal open onClose={onClose} title={user.name} wide>
      <p className="mb-4 text-sm text-slate-500">@{user.username} · {user.email} · {user.company?.name}</p>
      <Async s={s} skeleton={<Skeleton n={2} className="h-16" />}>
        {s.data && (
          <div className="grid gap-4 md:grid-cols-2">
            <div><h3 className="mb-2 font-semibold">Posts ({s.data[0].length})</h3>
              <ul className="space-y-1 text-sm capitalize text-slate-600">{s.data[0].map((p) => <li key={p.id}>• {p.title}</li>)}</ul></div>
            <div><h3 className="mb-2 font-semibold">Todos ({s.data[1].filter((t) => t.completed).length}/{s.data[1].length} done)</h3>
              <ul className="space-y-1 text-sm text-slate-600">{s.data[1].slice(0, 10).map((t) => <li key={t.id}>{t.completed ? '✓' : '○'} {t.title}</li>)}</ul></div>
          </div>
        )}
      </Async>
    </Modal>
  );
}

export default function Users() {
  const s = useFetch(() => api.users());
  const toast = useToast();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('name');
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', username: '' });
  const [err, setErr] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 3) er.name = 'Enter at least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address';
    if (!form.username.trim()) er.username = 'Username is required';
    setErr(er);
    if (Object.keys(er).length) return;
    try {
      await api.create('users', form);
      s.setData((d) => [{ ...form, id: nextId(d), phone: '—', website: '—', company: { name: '—' }, local: true }, ...d]);
      toast('User created');
      setAdding(false); setForm({ name: '', email: '', username: '' });
    } catch (x) { toast(x.message, 'error'); }
  };

  const list = (s.data || [])
    .filter((u) => `${u.name} ${u.email} ${u.username} ${u.company?.name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'company' ? a.company.name : a[sort]).localeCompare(sort === 'company' ? b.company.name : b[sort]));

  return (
    <>
      <PageHead title="Users" sub="Search, sort and open user profiles">
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add user</Button>
      </PageHead>
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, company" />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
          <option value="name">Sort: Name</option><option value="email">Sort: Email</option><option value="company">Sort: Company</option>
        </Select>
      </div>
      <Async s={s}>
        {list.length === 0 ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((u) => (
              <Card key={u.id} className="cursor-pointer" onClick={() => setSel(u)}>
                <div className="mb-3 flex items-center gap-3"><Avatar name={u.name} />
                  <div className="min-w-0"><div className="truncate font-semibold">{u.name}</div><div className="text-xs text-slate-500">@{u.username}</div></div></div>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span className="truncate">{u.email}</span></li>
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{u.phone}</li>
                  <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" />{u.website}</li>
                  <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{u.company?.name}</li>
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Async>
      {sel && <UserDetail user={sel} onClose={() => setSel(null)} />}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add user">
        <form onSubmit={submit} noValidate>
          <Field label="Full name" value={form.name} error={err.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Email" type="email" value={form.email} error={err.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Username" value={form.username} error={err.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit">Create user</Button></div>
        </form>
      </Modal>
    </>
  );
}
