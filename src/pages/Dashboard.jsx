import { Link } from 'react-router-dom';
import { Users, FileText, MessageSquare, Image, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Skeleton, PageHead } from '../components/ui';

export default function Dashboard() {
  const s = useFetch(() => Promise.all([api.users(), api.posts(), api.comments(), api.albums(), api.todos()]));
  return (
    <>
      <PageHead title="Dashboard" sub="Live statistics from the JSONPlaceholder API" />
      <Async s={s} skeleton={<Skeleton n={5} className="h-32" />}>
        {s.data && (() => {
          const [users, posts, comments, albums, todos] = s.data;
          const done = todos.filter((t) => t.completed).length;
          const stats = [
            ['Total users', users.length, Users, '/users', 'bg-indigo-50 text-indigo-600'],
            ['Total posts', posts.length, FileText, '/posts', 'bg-violet-50 text-violet-600'],
            ['Comments', comments.length, MessageSquare, '/comments', 'bg-sky-50 text-sky-600'],
            ['Albums', albums.length, Image, '/albums', 'bg-amber-50 text-amber-600'],
            ['Completed todos', done, CheckCircle2, '/todos', 'bg-emerald-50 text-emerald-600'],
          ];
          const perUser = users.map((u) => ({ name: u.username, posts: posts.filter((p) => p.userId === u.id).length }));
          const pie = [{ name: 'Completed', value: done }, { name: 'Pending', value: todos.length - done }];
          const byId = Object.fromEntries(users.map((u) => [u.id, u]));
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {stats.map(([label, value, Icon, to, tone]) => (
                  <Link key={label} to={to}>
                    <Card className="h-full">
                      <div className={`mb-3 inline-flex rounded-xl p-2 ${tone}`}><Icon className="h-5 w-5" /></div>
                      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                      <div className="text-sm text-slate-500">{label}</div>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <h2 className="mb-4 font-semibold">Posts per user</h2>
                  <div className="h-64"><ResponsiveContainer><BarChart data={perUser}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip /><Bar dataKey="posts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart></ResponsiveContainer></div>
                </Card>
                <Card>
                  <h2 className="mb-4 font-semibold">Todo completion</h2>
                  <div className="h-52"><ResponsiveContainer><PieChart>
                    <Pie data={pie} dataKey="value" innerRadius={55} outerRadius={80}>
                      <Cell fill="#6366f1" /><Cell fill="#c7d2fe" />
                    </Pie><Tooltip />
                  </PieChart></ResponsiveContainer></div>
                  <p className="text-center text-sm text-slate-500">{Math.round((done / todos.length) * 100)}% completed</p>
                </Card>
              </div>
              <Card>
                <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent posts</h2><Link to="/posts" className="text-sm text-indigo-600 hover:underline">View all</Link></div>
                <ul className="divide-y divide-slate-100">
                  {posts.slice(-5).reverse().map((p) => (
                    <li key={p.id}><Link to={`/posts?open=${p.id}`} className="block py-3 hover:bg-slate-50">
                      <div className="font-medium capitalize">{p.title}</div>
                      <div className="text-xs text-slate-500">by {byId[p.userId]?.name}</div>
                    </Link></li>
                  ))}
                </ul>
              </Card>
            </div>
          );
        })()}
      </Async>
    </>
  );
}
