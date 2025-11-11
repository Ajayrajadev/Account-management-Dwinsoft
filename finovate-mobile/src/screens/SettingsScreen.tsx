import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    color = '#111827'
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={32} color="#3B82F6" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Demo User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'demo@finovate.com'}</Text>
              <Text style={styles.profileRole}>Role: {user?.role || 'USER'}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
            />
            <SettingItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}
            />
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Toggle dark theme"
              onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available soon')}
            />
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Coming Soon', 'Language selection will be available soon')}
            />
            <SettingItem
              icon="card-outline"
              title="Currency"
              subtitle="USD ($)"
              onPress={() => Alert.alert('Coming Soon', 'Currency selection will be available soon')}
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="download-outline"
              title="Export Data"
              subtitle="Download your data"
              onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon')}
            />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us. This is a demo app.')}
            />
            <SettingItem
              icon="document-text-outline"
              title="Terms of Service"
              subtitle="Read our terms"
              onPress={() => Alert.alert('Terms of Service', 'This is a demo application for portfolio purposes.')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="help-circle-outline"
              title="Help & FAQ"
              subtitle="Get help and find answers"
              onPress={() => Alert.alert('Help', 'This is a demo app. Contact the developer for support.')}
            />
            <SettingItem
              icon="mail-outline"
              title="Contact Support"
              subtitle="Get in touch with us"
              onPress={() => Alert.alert('Contact', 'Email: support@finovate-demo.com')}
            />
            <SettingItem
              icon="star-outline"
              title="Rate App"
              subtitle="Rate us on the app store"
              onPress={() => Alert.alert('Thank You', 'Thank you for using our demo app!')}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0 (Demo)"
              showArrow={false}
            />
            <SettingItem
              icon="code-outline"
              title="Developer"
              subtitle="Built with React Native"
              showArrow={false}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              color="#EF4444"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Finovate Mobile v1.0.0</Text>
          <Text style={styles.footerSubtext}>Demo Application</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default SettingsScreen;
