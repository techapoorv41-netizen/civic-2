import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';

export default function MyReportsScreen() {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    try {
      if (!token) {
        setReports([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/issues`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && Array.isArray(resJson.data)) {
          const mapped = resJson.data.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'General',
            status: (item.status || 'pending').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
          }));
          setReports(mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user submissions:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyReports();
  };

  const renderMyReport = ({ item }) => {
    const isResolved = item.status.toLowerCase() === 'resolved';
    const isInProgress = item.status.toLowerCase() === 'in progress';
    const badgeBg = isResolved ? '#DEF7EC' : isInProgress ? '#E1F5FE' : '#FEF3C7';
    const badgeTextColor = isResolved ? '#03543F' : isInProgress ? '#0288D1' : '#92400E';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category}</Text>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>Submitted: {item.date}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Submissions</Text>
        <Text style={styles.headerSubtitle}>Track the status of your reported issues</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderMyReport}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No submitted reports yet</Text>
            </View>
          }
        />
      )}
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
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },
});
