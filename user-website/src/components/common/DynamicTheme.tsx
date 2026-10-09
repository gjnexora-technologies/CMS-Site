import React, { useEffect } from 'react';
import { SiteSettings } from '../../types';

interface DynamicThemeProps {
  settings: SiteSettings | null;
}

export const DynamicTheme: React.FC<DynamicThemeProps> = ({ settings }) => {
  useEffect(() => {
    if (!settings?.branding) return;

    const root = document.documentElement;
    const { primary_color, secondary_color, accent_color, font_family, border_radius } =
      settings.branding;

    if (primary_color) {
      root.style.setProperty('--color-primary', primary_color);
    }
    if (secondary_color) {
      root.style.setProperty('--color-secondary', secondary_color);
    }
    if (accent_color) {
      root.style.setProperty('--color-accent', accent_color);
    }
    if (font_family) {
      root.style.setProperty('--font-custom', `"${font_family}", sans-serif`);
      document.body.style.fontFamily = `"${font_family}", sans-serif`;
    }
    if (border_radius) {
      const radiusMap: Record<string, string> = {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      };
      root.style.setProperty('--radius-custom', radiusMap[border_radius] || '0.75rem');
    }
  }, [settings]);

  return null;
};
