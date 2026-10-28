import { useState } from 'react';
import { Images } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Card, Async, Empty, Modal, PageHead, Pager, SearchBox, Select, Skeleton } from '../components/ui';

const PER = 24;
const fallback = (t) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><defs><linearGradient id='g'><stop stop-color='#6366f1'/><stop offset='1' stop-color='#a78bfa'/></linearGradient></defs><rect width='300' height='300' fill='url(#g)'/><text x='150' y='160' fill='white' font-size='20' text-anchor='middle' font-family='sans-serif'>${t}</text></svg>`)}`;
function Img({ src, alt, ...p }) {
  return <img src={src} alt={alt} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback('Photo unavailable'); }} {...p} />;
}

export default function Albums() {
  const s = useFetch(() => Promise.all([api.albums(), api.photos()]));
  const [album, setAlbum] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [prev, setPrev] = useState(null);
  const [albums, photos] = s.data || [[], []];
  const pick = (id) => { setAlbum(String(id)); setPage(1); };
  const list = photos.filter((p) => (album === 'all' || p.albumId === Number(album)) && p.title.includes(q.toLowerCase()));
  const shownAlbums = albums.filter((a) => a.title.includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Albums & Photos" sub="Pick an album to filter the gallery" />
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search albums and photos" />
        <Select value={album} onChange={(e) => pick(e.target.value)} aria-label="Filter by album">
          <option value="all">All albums</option>{albums.map((a) => <option key={a.id} value={a.id}>Album {a.id}</option>)}
        </Select>
      </div>
      <Async s={s} skeleton={<Skeleton n={6} className="h-24" />}>
        <h2 className="mb-3 font-semibold">Albums</h2>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shownAlbums.slice(0, 12).map((a) => (
            <button key={a.id} onClick={() => pick(a.id)} className="text-left">
              <Card className={`h-full ${album === String(a.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                <Images className="mb-2 h-5 w-5 text-indigo-500" />
                <div className="text-sm font-medium capitalize line-clamp-2">{a.title}</div>
                <div className="text-xs text-slate-500">{photos.filter((p) => p.albumId === a.id).length} photos</div>
              </Card>
            </button>
          ))}
        </div>
        <h2 className="mb-3 font-semibold">Photos ({list.length})</h2>
        {list.length === 0 ? <Empty /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {list.slice((page - 1) * PER, page * PER).map((p) => (
              <button key={p.id} onClick={() => setPrev(p)} className="overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-100 transition hover:scale-[1.02]">
                <Img src={p.thumbnailUrl} alt={p.title} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <Pager page={page} pages={Math.ceil(list.length / PER)} set={setPage} />
      </Async>
      <Modal open={!!prev} onClose={() => setPrev(null)} title={prev?.title || ''}>
        {prev && <Img src={prev.url} alt={prev.title} className="w-full rounded-xl" />}
        {prev && <p className="mt-2 text-xs text-slate-500">Album {prev.albumId} · Photo #{prev.id}</p>}
      </Modal>
    </>
  );
}
