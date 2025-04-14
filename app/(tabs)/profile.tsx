import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Settings, Globe, Bell, CreditCard, LogOut, Shield, Gift } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#4F46E5']}
        style={styles.header}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Gold</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={24} color="#7C3AED" />
            <Text style={styles.menuText}>{t('profile.settings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
            <Globe size={24} color="#7C3AED" />
            <Text style={styles.menuText}>
              {t('profile.language')} ({i18n.language.toUpperCase()})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Bell size={24} color="#7C3AED" />
            <Text style={styles.menuText}>{t('profile.notifications')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <CreditCard size={24} color="#7C3AED" />
            <Text style={styles.menuText}>{t('profile.payment')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Shield size={24} color="#7C3AED" />
            <Text style={styles.menuText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Gift size={24} color="#7C3AED" />
            <Text style={styles.menuText}>Rewards Program</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={24} color="#EF4444" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>{t('profile.version')} 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 16,
    color: '#E2E8F0',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginTop: 24,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  version: {
    fontSize: 14,
    color: '#64748B',
  },
});