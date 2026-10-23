import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { token } = useContext(AuthContext);

  const categories = ['All', 'Roads & Infrastructure', 'Sanitation', 'Electricity', 'Water Supply'];

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/issues?all=true`, { headers });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && Array.isArray(resJson.data)) {
          const mapped = resJson.data.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'General',
            description: item.description,
            location: item.location?.address || item.locationAddress || 'Local Area',
            status: (item.status || 'Pending').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            upvotes: 0,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
            image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
          }));
          setIssues(mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch issues from backend:', e.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIssues();
    setRefreshing(false);
  };

  const handleUpvote = (id) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  };

  const filteredIssues = issues.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return { bg: '#DEF7EC', text: '#03543F' };
      case 'in progress':
        return { bg: '#E1F5FE', text: '#0288D1' };
      default:
        return { bg: '#FEF3C7', text: '#92400E' };
    }
  };

  const renderIssueCard = ({ item }) => {
    const badge = getStatusBadgeColor(item.status);
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🏙️ No Image</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryTag}>{item.category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusText, { color: badge.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <Text style={styles.locationText}>📍 {item.location}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>🕒 {item.date}</Text>
            <TouchableOpacity
              style={styles.upvoteButton}
              onPress={() => handleUpvote(item.id)}
            >
              <Text style={styles.upvoteIcon}>👍</Text>
              <Text style={styles.upvoteCount}>{item.upvotes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CivicSense Feed</Text>
          <Text style={styles.headerSubtitle}>Recent reported community issues</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search issues or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(cat) => cat}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id}
        renderItem={renderIssueCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No community issues found</Text>
          </View>
        }
      />
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
    paddingBottom: 12,
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
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upvoteIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  upvoteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
