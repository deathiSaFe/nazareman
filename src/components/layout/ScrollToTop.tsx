'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Resets the window scroll to the top whenever the route changes, so every
 * page opens at the top of the viewport. Client-side navigation in the App
 * Router can otherwise preserve the previous page's scroll position, leaving
 * new pages mid-scroll. Renders nothing.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
