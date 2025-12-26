// ============================================
// LOADING - Loading spinner component
// ============================================

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import colors from '../../constants/colors';

export type LoadingSize = 'small' | 'medium' | 'large';

interface LoadingProps {
  size?: LoadingSize;
  text?: string;
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  color = colors.appleBlue,
  fullScreen = false,
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'large';
    }
  };

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={getSize()} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray1,
    textAlign: 'center',
  },
});

export default Loading;
