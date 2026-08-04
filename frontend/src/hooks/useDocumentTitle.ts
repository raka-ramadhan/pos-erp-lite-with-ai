import { useEffect } from 'react';

export function useDocumentTitle(title: string, suffix: string = 'Nexus') {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    document.title = fullTitle;

    // Reset title on unmount
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
}
