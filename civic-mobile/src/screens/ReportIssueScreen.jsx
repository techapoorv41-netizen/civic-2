import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';

export default function ReportIssueScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Roads & Infrastructure',
    'Sanitation',
    'Electricity',
    'Water Supply',
    'Public Safety',
    'Parks & Trees',
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to automatically fetch GPS coordinates.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords);

      // Reverse geocode to human-readable address
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const formattedAddress = [item.name, item.street, item.city, item.region]
          .filter(Boolean)
          .join(', ');
        setLocationText(formattedAddress || `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
      } else {
        setLocationText(`Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
      }
    } catch (e) {
      Alert.alert('Location Error', 'Failed to acquire location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Validation Error', 'Please fill in Title, Category, and Description.');
      return;
    }

    setSubmitting(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        locationAddress: locationText || 'Pin Location',
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      };

      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error?.message || 'Failed to submit report');
      }

      const createdIssue = resJson.data;

      // If photo was selected, upload as issue attachment
      if (imageUri && createdIssue?.id && token) {
        try {
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          const photoData = new FormData();
          photoData.append('file', { uri: imageUri, name: filename, type });

          await fetch(`${API_BASE_URL}/issues/${createdIssue.id}/attachments`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: photoData,
          });
        } catch {
          // Photo upload error does not invalidate issue creation
        }
      }

      Alert.alert(
        'Issue Reported!',
        'Thank you for contributing to your community. The report has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setDescription('');
              setImageUri(null);
              setLocationText('');
              navigation.navigate('HomeTab');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Error', error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Report a Civic Issue</Text>
        <Text style={styles.headerSubtitle}>
          Snap a photo and report potholes, garbage, broken streetlights, or water leaks.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>📸 Issue Photo</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.removeImageText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButtonOutline} onPress={pickImage}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonOutlineText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>📋 Issue Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title / Heading</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Broken Water Pipe near Block B"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    category === cat && styles.catChipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      category === cat && styles.catChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the problem, severity, and any details..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter address or tap GPS"
                value={locationText}
                onChangeText={setLocationText}
              />
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={getCurrentLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.gpsButtonText}>📍 GPS</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Issue Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
    marginTop: 8,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  photoButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButtonOutlineText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  removeImageText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  catChipTextSelected: {
    color: '#FFFFFF',
  },
  locationInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gpsButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
