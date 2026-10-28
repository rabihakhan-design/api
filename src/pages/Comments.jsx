import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Avatar, Empty, PageHead, Pager, SearchBox, Select } from '../components/ui';

const PER = 12;
export default function Comments() {
  const s = useFetch(() => api.comments());
  const [q, setQ] = useState('');
  const [post, setPost] = useState('all');
  const [page, setPage] = useState(1);
  const list = (s.data || []).filter((c) => (post === 'all' || c.postId === Number(post)) && `${c.name} ${c.email} ${c.body}`.toLowerCase().includes(q.toLowerCase()));
  const postIds = [...new Set((s.data || []).map((c) => c.postId))];
  return (
    <>
      <PageHead title="Comments" sub="Browse every comment and jump to its post" />
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search comments" />
        <Select value={post} onChange={(e) => { setPost(e.target.value); setPage(1); }} aria-label="Filter by post">
          <option value="all">All posts</option>{postIds.map((id) => <option key={id} value={id}>Post #{id}</option>)}
        </Select>
      </div>
      <Async s={s}>
        {list.length === 0 ? <Empty /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.slice((page - 1) * PER, page * PER).map((c) => (
              <Card key={c.id}>
                <div className="mb-3 flex items-center gap-3"><Avatar name={c.name} /><div className="min-w-0"><div className="truncate text-sm font-semibold capitalize">{c.name}</div><div className="truncate text-xs text-slate-500">{c.email}</div></div></div>
                <p className="mb-3 text-sm text-slate-600 line-clamp-3">{c.body}</p>
                <Link to={`/posts?open=${c.postId}`} className="text-sm font-medium text-indigo-600 hover:underline">Open post #{c.postId}</Link>
              </Card>
            ))}
          </div>
        )}
      </Async>
      <Pager page={page} pages={Math.ceil(list.length / PER)} set={setPage} />
    </>
  );
}
