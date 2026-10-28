import { useEffect, useState } from 'react';
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !off && setState({ data, loading: false, error: null }))
      .catch((e) => !off && setState({ data: null, loading: false, error: e.message }));
    return () => { off = true; };
    // eslint-disable-next-line
  }, [...deps, tick]);
  return {
    ...state,
    setData: (d) => setState((s) => ({ ...s, data: typeof d === 'function' ? d(s.data) : d })),
    retry: () => setTick((t) => t + 1),
  };
}
