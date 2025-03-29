import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Simple cross-platform alert that uses native Alert on mobile and browser confirm/alert on web
 */
export const showAlert = (
  title: string, 
  message: string, 
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      // For confirmation dialogs with multiple buttons
      const cancelButton = buttons.find(b => b.style === 'cancel');
      const confirmButton = buttons.find(b => b.style !== 'cancel');
      
      if (confirmButton) {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && confirmButton.onPress) {
          confirmButton.onPress();
        } else if (!result && cancelButton?.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // For simple alerts
      window.alert(`${title}\n\n${message}`);
      if (buttons?.[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // Use React Native's Alert for mobile platforms
    Alert.alert(
      title,
      message,
      buttons?.map(button => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style
      })) || [{ text: 'OK' }]
    );
  }
};