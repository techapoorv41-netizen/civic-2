import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen'); // citizen or official
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName.trim(), email: email.trim(), password, role }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.success && resJson.data) {
        await login(resJson.data.user, resJson.data.accessToken);
      } else {
        const errMsg = resJson.error?.message || 'Registration failed';
        Alert.alert('Registration Failed', errMsg);
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        `Unable to connect to CivicSense API at ${API_BASE_URL}. Ensure backend is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>🏙️ CivicSense</Text>
            <Text style={styles.subtitle}>Create your account to start reporting civic issues</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Register Account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="jane@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Role</Text>
              <View style={styles.rolePickerContainer}>
                <TouchableOpacity
                  style={[styles.roleOption, role === 'citizen' && styles.roleSelected]}
                  onPress={() => setRole('citizen')}
                >
                  <Text style={[styles.roleText, role === 'citizen' && styles.roleTextSelected]}>
                    Citizen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleOption, role === 'official' && styles.roleSelected]}
                  onPress={() => setRole('official')}
                >
                  <Text style={[styles.roleText, role === 'official' && styles.roleTextSelected]}>
                    Municipal Official
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  rolePickerContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  roleTextSelected: {
    color: '#2563EB',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
