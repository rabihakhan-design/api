const BASE = import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com';
const cache = new Map();

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  return res.json();
}
// GET requests are cached so the same endpoint is never fetched twice.
const get = (path) =>
  cache.has(path) ? Promise.resolve(cache.get(path)) : request(path).then((d) => (cache.set(path, d), d));
const send = (method, path, body) => request(path, { method, body: body ? JSON.stringify(body) : undefined });

export const api = {
  users: () => get('/users'),
  user: (id) => get(`/users/${id}`),
  posts: () => get('/posts'),
  post: (id) => get(`/posts/${id}`),
  postsByUser: (id) => get(`/posts?userId=${id}`),
  comments: () => get('/comments'),
  postComments: (id) => get(`/posts/${id}/comments`),
  albums: () => get('/albums'),
  photos: () => get('/photos'),
  todos: () => get('/todos'),
  todosByUser: (id) => get(`/todos?userId=${id}`),
  create: (resource, data) => send('POST', `/${resource}`, data),
  replace: (resource, id, data) => send('PUT', `/${resource}/${id}`, data),
  patch: (resource, id, data) => send('PATCH', `/${resource}/${id}`, data),
  remove: (resource, id) => send('DELETE', `/${resource}/${id}`),
};
