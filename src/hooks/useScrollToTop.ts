import { useEffect } from 'react';

/**
 * Custom hook to scroll to top when component mounts
 * Useful for ensuring pages start at the top when navigating
 */
export const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
