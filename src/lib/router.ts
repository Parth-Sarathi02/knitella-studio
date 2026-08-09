import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'shop'; category?: string }
  | { name: 'product'; id: string }
  | { name: 'admin' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'shop') {
    return { name: 'shop', category: parts[1] };
  }
  if (parts[0] === 'product' && parts[1]) {
    return { name: 'product', id: parts[1] };
  }
  if (parts[0] === 'admin') {
    return { name: 'admin' };
  }
  return { name: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}

export function navigate(path: string) {
  window.location.hash = path;
}
