import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Users, FileText, MessageSquare, Image, CheckSquare, PanelLeftClose, PanelLeftOpen, Menu, Layers } from 'lucide-react';

const nav = [
  ['/', 'Dashboard', LayoutDashboard], ['/users', 'Users', Users], ['/posts', 'Posts', FileText],
  ['/comments', 'Comments', MessageSquare], ['/albums', 'Albums & Photos', Image], ['/todos', 'Todos', CheckSquare],
];
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const cur = nav.find((n) => n[0] === pathname) || nav[0];
  const side = (c) => (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Main">
      <Link to="/" className="mb-4 flex items-center gap-2 px-2 py-2 text-lg font-bold text-indigo-600">
        <Layers className="h-6 w-6 shrink-0" />{!c && 'Placeholder'}
      </Link>
      {nav.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} title={label}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Icon className="h-5 w-5 shrink-0" />{!c && label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 hidden h-screen border-r border-slate-100 bg-white transition-all lg:block ${collapsed ? 'w-20' : 'w-64'}`}>{side(collapsed)}</aside>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>{side(false)}</aside></div>}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur">
          <button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <button aria-label="Toggle sidebar" className="hidden lg:block" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <div className="text-sm text-slate-500"><Link to="/" className="hover:text-indigo-600">Home</Link> / <span className="font-medium text-navy">{cur[1]}</span></div>
        </header>
        <main className="fade mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
