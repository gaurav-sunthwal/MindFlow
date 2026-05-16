import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Theme from '../../constants/Theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (isLoading) return;
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      alert(error.message);
      setIsLoading(false);
    } else {
      // Supabase might send a confirmation email or log in immediately depending on settings
      alert('Registration successful! Please check your email if confirmation is required.');
      setIsLoading(false);
      router.push('/login');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="infinite" size={40} color={Theme.colors.primary} />
              </View>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Join MindFlow to start organizing your cognitive space.</Text>
            </View>

            <View style={styles.form}>
              <Input 
                label="Full Name" 
                placeholder="Gaurav Sunthwal"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />

              <Input 
                ref={emailRef}
                label="Email Address" 
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              
              <Input 
                ref={passwordRef}
                label="Password" 
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="join"
                onSubmitEditing={handleRegister}
              />

              <View style={styles.terms}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.link}>Terms of Service</Text> and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>.
                </Text>
              </View>

              <Button 
                title="Create Account" 
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 60,
    paddingBottom: 100,
  },

  header: {
    marginBottom: 48,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Theme.shadows.level1,
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.onSurface,
    marginBottom: 12,
  },
  subtitle: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  form: {
    gap: 20,
  },
  terms: {
    marginTop: 8,
  },
  termsText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  link: {
    color: Theme.colors.primary,
    fontFamily: 'Geist-Medium',
  },
  registerButton: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.onSurfaceVariant,
  },
  signInText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-SemiBold',
    color: Theme.colors.primary,
  },
});
