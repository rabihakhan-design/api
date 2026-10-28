import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Avatar, Button, Confirm, Empty, Field, Modal, PageHead, Pager, SearchBox, Select, Skeleton, useToast, nextId } from '../components/ui';

const PER = 9;

function PostForm({ post, users, onSave, onClose }) {
  const [f, setF] = useState(post || { title: '', body: '', userId: users[0].id });
  const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.title.trim().length < 5) er.title = 'Title needs at least 5 characters';
    if (f.body.trim().length < 10) er.body = 'Body needs at least 10 characters';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, userId: Number(f.userId) });
  };
  return (
    <Modal open onClose={onClose} title={post ? 'Edit post' : 'New post'}>
      <form onSubmit={submit} noValidate>
        <label className="mb-3 block text-sm"><span className="mb-1 block font-medium text-slate-700">Author</span>
          <Select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })} className="w-full">
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select></label>
        <Field label="Title" value={f.title} error={err.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Field label="Body" textarea value={f.body} error={err.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">{post ? 'Save changes' : 'Publish post'}</Button></div>
      </form>
    </Modal>
  );
}

function PostDetail({ post, author, onClose }) {
  const s = useFetch(() => (post.local ? Promise.resolve([]) : api.postComments(post.id)), [post.id]);
  const toast = useToast();
  const [c, setC] = useState({ name: '', email: '', body: '' });
  const add = async (e) => {
    e.preventDefault();
    if (!c.name.trim() || !/^\S+@\S+\.\S+$/.test(c.email) || !c.body.trim()) return toast('Fill in name, a valid email and comment', 'error');
    try {
      await api.create('comments', { ...c, postId: post.id });
      s.setData((d) => [...d, { ...c, id: nextId(d) }]);
      setC({ name: '', email: '', body: '' }); toast('Comment added');
    } catch (x) { toast(x.message, 'error'); }
  };
  return (
    <Modal open onClose={onClose} title={post.title} wide>
      <p className="mb-1 text-xs text-slate-500">by {author?.name}</p>
      <p className="mb-5 text-slate-700">{post.body}</p>
      <h3 className="mb-2 font-semibold">Comments</h3>
      <Async s={s} skeleton={<Skeleton n={2} className="h-14" />}>
        {s.data && (s.data.length === 0 ? <Empty text="No comments yet. Be the first to comment." /> :
          <ul className="mb-4 space-y-3">{s.data.map((x) => <li key={x.id} className="rounded-xl bg-slate-50 p-3 text-sm"><div className="font-medium">{x.name} <span className="font-normal text-slate-500">· {x.email}</span></div><p className="text-slate-600">{x.body}</p></li>)}</ul>)}
      </Async>
      <form onSubmit={add} className="grid gap-2 sm:grid-cols-2" noValidate>
        <Field label="Name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
        <Field label="Email" type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
        <div className="sm:col-span-2"><Field label="Comment" textarea value={c.body} onChange={(e) => setC({ ...c, body: e.target.value })} /></div>
        <div className="sm:col-span-2"><Button type="submit">Add comment</Button></div>
      </form>
    </Modal>
  );
}

export default function Posts() {
  const s = useFetch(() => Promise.all([api.posts(), api.users()]));
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [uid, setUid] = useState('all');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [local, setLocal] = useState(null);
  const [posts, users] = s.data || [[], []];
  const all = local || posts;
  const byId = Object.fromEntries(users.map((u) => [u.id, u]));
  const open = all.find((p) => String(p.id) === params.get('open'));

  const mutate = (fn) => setLocal(fn(local || posts));
  const save = async (data) => {
    try {
      if (data.id) {
        if (!data.local) await api.replace('posts', data.id, data);
        mutate((l) => l.map((p) => (p.id === data.id ? data : p))); toast('Post updated');
      } else {
        await api.create('posts', data);
        mutate((l) => [{ ...data, id: nextId(l), local: true }, ...l]); toast('Post created');
      }
      setForm(null);
    } catch (x) { toast(x.message, 'error'); }
  };
  const remove = async () => {
    try {
      if (!del.local) await api.remove('posts', del.id);
      mutate((l) => l.filter((p) => p.id !== del.id)); toast('Post deleted');
    } catch (x) { toast(x.message, 'error'); }
    setDel(null);
  };

  const list = all.filter((p) => (uid === 'all' || p.userId === Number(uid)) && `${p.title} ${p.body}`.toLowerCase().includes(q.toLowerCase()));
  const shown = list.slice((page - 1) * PER, page * PER);

  return (
    <>
      <PageHead title="Posts" sub="Create, edit and delete posts (changes are simulated by the mock API)">
        <Button onClick={() => setForm('new')} disabled={!users.length}><Plus className="h-4 w-4" />New post</Button>
      </PageHead>
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search posts" />
        <Select value={uid} onChange={(e) => { setUid(e.target.value); setPage(1); }} aria-label="Filter by author">
          <option value="all">All authors</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
      </div>
      <Async s={s}>
        {shown.length === 0 ? <Empty /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <button className="flex-1 text-left" onClick={() => setParams({ open: p.id })}>
                  <h3 className="mb-2 font-semibold capitalize line-clamp-2">{p.title}</h3>
                  <p className="mb-4 text-sm text-slate-600 line-clamp-3">{p.body}</p>
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Avatar name={byId[p.userId]?.name} />{byId[p.userId]?.name}</div>
                  <div className="flex gap-1">
                    <button aria-label="Edit post" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setForm(p)}><Pencil className="h-4 w-4" /></button>
                    <button aria-label="Delete post" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Async>
      <Pager page={page} pages={Math.ceil(list.length / PER)} set={setPage} />
      {open && <PostDetail post={open} author={byId[open.userId]} onClose={() => setParams({})} />}
      {form && <PostForm post={form === 'new' ? null : form} users={users} onSave={save} onClose={() => setForm(null)} />}
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={remove} text={`"${del?.title}" will be removed from the list.`} />
    </>
  );
}
