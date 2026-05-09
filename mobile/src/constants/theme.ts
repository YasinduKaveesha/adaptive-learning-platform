// Duolingo-inspired theme — bright, playful, child-friendly

export const COLORS = {
  // Backgrounds
  background: '#F0FBF1',   // very light mint
  surface: '#FFFFFF',
  surfaceLight: '#F7FFF8',
  surfaceAlt: '#EEF9EF',
  border: '#E5E5E5',

  // Brand green (Duolingo palette)
  primary: '#58CC6C',
  primaryLight: '#A8E6A3',
  primaryDark: '#46A354',   // used as button bottom-shadow
  accent: '#FFD900',        // Duolingo yellow

  // Domain accent colours (green / blue / orange / yellow)
  working_memory: '#58CC6C',      // primary green
  pattern_recognition: '#1CB0F6', // Duolingo blue
  attention: '#FF9600',           // Duolingo orange
  logical_reasoning: '#FFD900',   // Duolingo yellow

  // Classification groups
  group_a: '#FF4B4B',
  group_b: '#CE82FF',
  group_c: '#58CC6C',

  // Text — dark gray, never pure black
  textPrimary: '#3C3C3C',
  textSecondary: '#777777',
  textTertiary: '#AFAFAF',
  textDisabled: '#CCCCCC',

  // Feedback
  success: '#58CC6C',
  error: '#FF4B4B',
  warning: '#FFD900',
  info: '#1CB0F6',

  // Confidence
  confidenceLow: '#FF4B4B',
  confidenceMid: '#FFD900',
  confidenceHigh: '#58CC6C',
  confidenceThreshold: '#1CB0F6',

  // Overlays
  glassLight: 'rgba(0, 0, 0, 0.02)',
  glassMedium: 'rgba(0, 0, 0, 0.04)',
  glassDark: 'rgba(0, 0, 0, 0.08)',

  // Glows
  glowPurple: 'rgba(206, 130, 255, 0.18)',
  glowBlue: 'rgba(28, 176, 246, 0.18)',
  glowGreen: 'rgba(88, 204, 108, 0.18)',
};

export const DOMAIN_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string; shortLabel: string; glow: string }
> = {
  working_memory: {
    label: 'Working Memory',
    shortLabel: 'Memory',
    color: COLORS.working_memory,
    bg: '#EDFBEF',
    icon: '🧠',
    glow: COLORS.glowGreen,
  },
  pattern_recognition: {
    label: 'Pattern Recognition',
    shortLabel: 'Patterns',
    color: COLORS.pattern_recognition,
    bg: '#E8F6FF',
    icon: '🧩',
    glow: COLORS.glowBlue,
  },
  attention: {
    label: 'Attention',
    shortLabel: 'Focus',
    color: COLORS.attention,
    bg: '#FFF3E0',
    icon: '🎯',
    glow: 'rgba(255, 150, 0, 0.18)',
  },
  logical_reasoning: {
    label: 'Logical Reasoning',
    shortLabel: 'Logic',
    color: COLORS.logical_reasoning,
    bg: '#FFFDE7',
    icon: '💡',
    glow: 'rgba(255, 217, 0, 0.20)',
  },
};

export const GROUP_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  group_a: {
    label: 'Group A',
    color: COLORS.group_a,
    description: 'Personalised support activities recommended',
  },
  group_b: {
    label: 'Group B',
    color: COLORS.group_b,
    description: 'Core curriculum activities recommended',
  },
  group_c: {
    label: 'Group C',
    color: COLORS.group_c,
    description: 'Extension and challenge activities recommended',
  },
};

export const TYPOGRAPHY = {
  // Display
  display: { fontSize: 36, fontFamily: 'Poppins_800ExtraBold', lineHeight: 44 },
  h1: { fontSize: 32, fontFamily: 'Poppins_700Bold', lineHeight: 40 },
  h2: { fontSize: 28, fontFamily: 'Poppins_700Bold', lineHeight: 36 },
  h3: { fontSize: 24, fontFamily: 'Poppins_600SemiBold', lineHeight: 32 },
  h4: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', lineHeight: 28 },

  // Body
  body: { fontSize: 16, fontFamily: 'Poppins_400Regular', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontFamily: 'Poppins_500Medium', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontFamily: 'Poppins_400Regular', lineHeight: 20 },
  bodySmallMedium: { fontSize: 14, fontFamily: 'Poppins_500Medium', lineHeight: 20 },

  // Labels
  label: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', lineHeight: 16 },
  labelMedium: { fontSize: 13, fontFamily: 'Poppins_500Medium', lineHeight: 18 },
  labelSmall: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', lineHeight: 14 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

// Animation & Transition
export const ANIMATIONS = {
  // Durations (ms)
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,

  // Easing functions
  easing: {
    ease: [0.25, 0.1, 0.25, 1.0],
    easeOut: [0.0, 0.0, 0.58, 1.0],
    easeIn: [0.42, 0.0, 1.0, 1.0],
    easeInOut: [0.42, 0.0, 0.58, 1.0],
    spring: [0.68, -0.55, 0.265, 1.55],
  },
};

// Shadow & Depth
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
};
