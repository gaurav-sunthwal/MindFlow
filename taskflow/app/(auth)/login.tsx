import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Theme from '../../constants/Theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (isLoading) return;
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      alert(error.message);
      setIsLoading(false);
    } else {
      // AuthContext will update isAuthenticated and router will redirect based on (app)/_layout
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="infinite" size={40} color={Theme.colors.primary} />
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Enter your details to access your mind flow.</Text>
            </View>

            <View style={styles.form}>
              <Input 
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
              
              <View style={styles.passwordWrapper}>
                <Input 
                  ref={passwordRef}
                  label="Password" 
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot?</Text>
                </TouchableOpacity>
              </View>

              <Button 
                title="Sign In" 
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signUpText}>Create one</Text>
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
    flex: 1,
    paddingHorizontal: Theme.spacing.marginMobile,
    justifyContent: 'center',
    paddingBottom: 40,
    minHeight: height * 0.8,
  },
  header: {
    marginBottom: 48,
    alignItems: 'flex-start',
    marginTop: 40,
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
    maxWidth: width * 0.7,
  },
  form: {
    gap: 24,
  },
  passwordWrapper: {
    position: 'relative',
  },
  forgotPassword: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  forgotPasswordText: {
    ...Theme.typography.labelSm,
    color: Theme.colors.secondary,
  },
  loginButton: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.onSurfaceVariant,
  },
  signUpText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-SemiBold',
    color: Theme.colors.primary,
  },
});
