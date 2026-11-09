import {defineTheme} from '@astryxdesign/core/theme';
import {stoneTheme} from '@astryxdesign/theme-stone/built';

/** Refined fintech skin on top of Astryx Stone. */
export const fintechTheme = defineTheme({
  name: 'fintech',
  extends: stoneTheme,
  tokens: {
    '--color-accent': ['#0F766E', '#2DD4BF'],
    '--radius-container': '16px',
    '--radius-element': '12px',
    '--radius-inner': '8px',
    '--font-family-body':
      "'Inter', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif",
    '--font-family-heading':
      "'Inter', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif",
    '--shadow-low': [
      '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
      '0 1px 2px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.25)',
    ],
    '--shadow-med': [
      '0 4px 16px rgba(15, 23, 42, 0.08)',
      '0 8px 28px rgba(0, 0, 0, 0.45)',
    ],
  },
});
