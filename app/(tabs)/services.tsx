import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Hotel, Car, Utensils, Plane, Coffee, Map as MapIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const hotels = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    price: '$420',
    rating: '4.9',
    location: 'Paris, France',
  },
  {
    id: '2',
    name: 'Azure Resort & Spa',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    price: '$550',
    rating: '4.8',
    location: 'Maldives',
  },
];

const restaurants = [
  {
    id: '1',
    name: 'Le Petit Bistro',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
    cuisine: 'French',
    rating: '4.7',
    price: '€€€',
  },
  {
    id: '2',
    name: 'Sakura Japanese',
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b',
    cuisine: 'Japanese',
    rating: '4.8',
    price: '€€€€',
  },
];

export default function ServicesScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#4F46E5']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('services.title')}</Text>
        <Text style={styles.headerSubtitle}>Discover premium travel experiences</Text>
      </LinearGradient>

      <View style={styles.categories}>
        <TouchableOpacity style={styles.categoryButton}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.categoryGradient}
          >
            <Hotel size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.categoryText}>{t('common.services.hotels')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.categoryGradient}
          >
            <Plane size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.categoryText}>Flights</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryButton}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.categoryGradient}
          >
            <Car size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.categoryText}>{t('common.services.transport')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryButton}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.categoryGradient}
          >
            <Coffee size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.categoryText}>{t('common.services.restaurants')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('services.popularHotels')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hotels.map((hotel) => (
            <TouchableOpacity key={hotel.id} style={styles.card}>
              <Image
                source={{ uri: hotel.image }}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{hotel.name}</Text>
                <Text style={styles.location}>
                  <MapIcon size={14} color="#E2E8F0" /> {hotel.location}
                </Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.price}>{hotel.price}/night</Text>
                  <Text style={styles.rating}>★ {hotel.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('services.recommendedRestaurants')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {restaurants.map((restaurant) => (
            <TouchableOpacity key={restaurant.id} style={styles.card}>
              <Image
                source={{ uri: restaurant.image }}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{restaurant.name}</Text>
                <Text style={styles.cuisine}>{restaurant.cuisine} • {restaurant.price}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.rating}>★ {restaurant.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 8,
  },
  categoryButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  card: {
    width: 300,
    height: 320,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rating: {
    fontSize: 14,
    color: '#FACC15',
    fontWeight: '600',
  },
  cuisine: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
  },
});