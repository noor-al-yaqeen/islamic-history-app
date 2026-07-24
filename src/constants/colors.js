export const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#0D47A1',
  secondaryLight: '#1976D2',
  accent: '#C62828',
  accentLight: '#E53935',
  gold: '#FFD54F',
  goldDark: '#F9A825',
  background: '#0D1117',
  surface: '#161B22',
  surfaceLight: '#21262D',
  card: '#1C2333',
  text: '#F0F0F0',
  textLight: '#8B949E',
  textMuted: '#484F58',
  textOnPrimary: '#FFFFFF',
  border: '#30363D',
  borderLight: '#21262D',
  haqeem: '#2E7D32',
  haqeemLight: '#4CAF50',
  haqeemBg: '#0A1F0A',
  saail: '#1565C0',
  saailLight: '#42A5F5',
  saailBg: '#0A0F1F',
  whatsappGreen: '#075E54',
  chatBg: '#121B22',
  myMessage: '#005C4B',
  otherMessage: '#202C33',
  divider: '#30363D',
  overlay: 'rgba(0,0,0,0.5)',
};

export const SHADOWS = (isWeb = false) => ({
  small: isWeb
    ? { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
  medium: isWeb
    ? { boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      },
  large: isWeb
    ? { boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 32,
        elevation: 16,
      },
  glow: (color) =>
    isWeb
      ? { boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}20` }
      : {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
        },
});