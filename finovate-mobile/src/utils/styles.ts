import { Platform } from 'react-native';

// Cross-platform shadow utility
export const getShadowStyle = (elevation: number = 2) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    };
  }
  
  // iOS shadow
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.1,
      shadowRadius: elevation,
    };
  }
  
  // Android elevation
  return {
    elevation,
  };
};

// Common card style with cross-platform shadow
export const getCardStyle = (elevation: number = 2) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  ...getShadowStyle(elevation),
});
