import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useThemeEffect() {
  const theme = useSelector((state) => state.preferences?.theme || 'light');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const isDark = theme === 'dark';

      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    applyTheme();
  }, [theme]);
}
