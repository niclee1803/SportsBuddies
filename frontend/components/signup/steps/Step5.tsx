import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Checkbox from "expo-checkbox";
import { NavigationButtons } from '../NavigationButtons';
import styles from '../styles';

interface Step5Props {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const Step5: React.FC<Step5Props> = ({
  isChecked,
  setIsChecked,
  onBack,
  onSubmit,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.y;
    const height = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    setScrollPosition(position);
    setContentHeight(height);
    setScrollViewHeight(scrollViewHeight);
    
    // Check if user has scrolled to the bottom (with a small buffer)
    if (position + scrollViewHeight >= height - 20) {
      setHasReadTerms(true);
    }
  };

  const openTerms = () => {
    setModalVisible(true);
  };

  const closeTerms = () => {
    setModalVisible(false);
  };

  const acceptTerms = () => {
    if (hasReadTerms) {
      setIsChecked(true);
      setModalVisible(false);
    }
  };

  // Calculate progress percentage
  const scrollProgress = contentHeight > 0 
    ? Math.min(100, ((scrollPosition + scrollViewHeight) / contentHeight) * 100) 
    : 0;

  return (
    <>
      <Text style={styles.subheading}>Step 5: Accept Terms</Text>
      <View style={styles.termsContainer}>
        <Checkbox
          value={isChecked}
          onValueChange={(value) => {
            // Only allow checking if terms have been read
            if (value && !hasReadTerms) {
              openTerms();
            } else {
              setIsChecked(value);
            }
          }}
          color={isChecked ? "#42c8f5" : undefined}
        />
        <Text style={styles.termsText}> I accept the </Text>
        <TouchableOpacity onPress={openTerms}>
          <Text style={styles.termsLink}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeTerms}
      >
        <SafeAreaView style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Terms and Conditions</Text>
            
            <ScrollView
              ref={scrollViewRef}
              style={modalStyles.scrollView}
              onScroll={handleScroll}
              scrollEventThrottle={16} // Update scroll position more frequently
            >
              <Text style={modalStyles.lastUpdated}>Last Updated: March 2, 2025</Text>
              
              <Text style={modalStyles.sectionTitle}>1. Introduction</Text>
              <Text style={modalStyles.paragraph}>
                Welcome to SportsBuddies! These Terms and Conditions govern your use of the SportsBuddies mobile application ("App"). By accessing or using the App, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use the App.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>2. Eligibility</Text>
              <Text style={modalStyles.paragraph}>
                You must be at least 18 years old or have parental/guardian consent to use the App. By using the App, you represent that you meet these requirements.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>3. Account Registration</Text>
              <Text style={modalStyles.paragraph}>
                To access certain features, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>4. Use of the App</Text>
              <Text style={modalStyles.paragraph}>
                You agree to use the App for lawful purposes only. Prohibited activities include, but are not limited to:
              </Text>
              <Text style={modalStyles.bullet}>• Violating any applicable laws or regulations.</Text>
              <Text style={modalStyles.bullet}>• Misrepresenting your identity.</Text>
              <Text style={modalStyles.bullet}>• Harassing, threatening, or harming other users.</Text>
              <Text style={modalStyles.bullet}>• Posting inappropriate, offensive, or misleading content.</Text>
              
              <Text style={modalStyles.sectionTitle}>5. Event Participation</Text>
              <Text style={modalStyles.paragraph}>
                SportsBuddies facilitates connections between users for sports events. The App is not responsible for any injuries, accidents, or disputes that may arise from event participation. Users participate in events at their own risk.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>6. User Content</Text>
              <Text style={modalStyles.paragraph}>
                You retain ownership of any content you submit through the App. By submitting content, you grant SportsBuddies a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for App-related purposes.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>7. Privacy Policy</Text>
              <Text style={modalStyles.paragraph}>
                Your use of the App is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>8. Limitation of Liability</Text>
              <Text style={modalStyles.paragraph}>
                SportsBuddies is provided on an "as is" basis. We do not guarantee uninterrupted or error-free operation. To the fullest extent permitted by law, we are not liable for any damages, losses, or injuries resulting from the use of the App.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>9. Termination</Text>
              <Text style={modalStyles.paragraph}>
                We reserve the right to terminate or suspend your account at our discretion if you violate these Terms.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>10. Acceptance of Terms</Text>
              <Text style={modalStyles.paragraph}>
                To proceed, you must read and accept the Terms & Conditions. Within the SportsBuddies app, users must open and review the Terms before they can check the acceptance box.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>11. Changes to Terms</Text>
              <Text style={modalStyles.paragraph}>
                We may update these Terms from time to time. Continued use of the App after changes constitute acceptance of the revised Terms.
              </Text>
              
              <Text style={modalStyles.sectionTitle}>12. Contact Us</Text>
              <Text style={modalStyles.paragraph}>
                If you have any questions about these Terms, please contact us at trevsweproj@gmail.com
              </Text>
              
              <View style={modalStyles.spacer} />
            </ScrollView>
            
            {/* Progress indicator */}
            <View style={modalStyles.progressContainer}>
              <View 
                style={[
                  modalStyles.progressBar, 
                  { width: `${scrollProgress}%` }
                ]} 
              />
            </View>
            
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonClose]}
                onPress={closeTerms}
              >
                <Text style={modalStyles.buttonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  modalStyles.button, 
                  modalStyles.buttonAccept,
                  !hasReadTerms && modalStyles.buttonDisabled
                ]}
                onPress={acceptTerms}
                disabled={!hasReadTerms}
              >
                <Text style={modalStyles.buttonText}>
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      
      <NavigationButtons
        step={5}
        onBack={onBack}
        onNext={onSubmit}
        isValid={isChecked}
        isLastStep
      />
    </>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  scrollView: {
    width: '100%',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 15,
    marginBottom: 5,
  },
  spacer: {
    height: 30,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#42c8f5',
    borderRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: '#a0a0a0',
  },
  buttonAccept: {
    backgroundColor: '#42c8f5',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});