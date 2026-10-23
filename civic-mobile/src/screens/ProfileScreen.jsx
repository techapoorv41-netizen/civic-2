import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Citizen User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'citizen@civicsense.org'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              Role: {(user?.role || 'Citizen').toUpperCase()}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 14,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
