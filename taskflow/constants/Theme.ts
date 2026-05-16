export const Colors = {
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#444748',
  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',
  outline: '#747878',
  outlineVariant: '#c4c7c7',
  surfaceTint: '#5f5e5e',
  primary: '#000000',
  onPrimary: '#ffffff',
  primaryContainer: '#1c1b1b',
  onPrimaryContainer: '#858383',
  inversePrimary: '#c8c6c5',
  secondary: '#4a654e',
  onSecondary: '#ffffff',
  secondaryContainer: '#c9e8cb',
  onSecondaryContainer: '#4e6952',
  tertiary: '#000000',
  onTertiary: '#ffffff',
  tertiaryContainer: '#1c1b1a',
  onTertiaryContainer: '#868382',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  primaryFixed: '#e5e2e1',
  primaryFixedDim: '#c8c6c5',
  onPrimaryFixed: '#1c1b1b',
  onPrimaryFixedVariant: '#474746',
  secondaryFixed: '#cceace',
  secondaryFixedDim: '#b0ceb2',
  onSecondaryFixed: '#07200f',
  onSecondaryFixedVariant: '#334d38',
  tertiaryFixed: '#e6e2df',
  tertiaryFixedDim: '#cac6c4',
  onTertiaryFixed: '#1c1b1a',
  onTertiaryFixedVariant: '#484645',
  background: '#f8f9ff',
  onBackground: '#0b1c30',
  surfaceVariant: '#d3e4fe',
};

export const Typography = {
  displayLg: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.04 * 48,
  },
  displayMd: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.03 * 36,
  },
  headlineLg: {
    fontFamily: 'Geist-Medium',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.02 * 32,
  },
  headlineLgMobile: {
    fontFamily: 'Geist-Medium',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.01 * 24,
  },
  titleMd: {
    fontFamily: 'Geist-Medium',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.01 * 20,
  },
  bodyLg: {
    fontFamily: 'Geist-Regular',
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0.01 * 16,
  },
  bodySm: {
    fontFamily: 'Geist-Regular',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.01 * 14,
  },
  labelCaps: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.08 * 12,
    textTransform: 'uppercase' as const,
  },
};

export const Spacing = {
  base: 8,
  marginMobile: 20,
  marginDesktop: 64,
  gutter: 24,
  containerMax: 1120,
};

export const Rounding = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },
};

const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  rounding: Rounding,
  shadows: Shadows,
};

export default Theme;
