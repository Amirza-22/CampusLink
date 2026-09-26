
import { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native'
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context'
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter'

const colors = {
  navy: '#0E1F38',
  blue: '#1F61D1',
  green: '#1F9E61',
  background: '#F2F7FF',
  white: '#FFFFFF',
  gray: '#52647A',
}

const activities = [
  {
    id: 1,
    title: 'Campus Soccer',
    category: 'Sports',
    location: 'Recreation Center',
    time: 'Friday at 5:00 PM',
    description: 'Come play soccer and meet other students.',
  },
  {
    id: 2,
    title: 'Study Group',
    category: 'Academic',
    location: 'University Library',
    time: 'Monday at 2:00 PM',
    description: 'Join other students for a group study session.',
  },
  {
    id: 3,
    title: 'Campus Game Night',
    category: 'Social',
    location: 'Student Union',
    time: 'Saturday at 6:00 PM',
    description: 'Enjoy games and meet new people on campus.',
  },
]

const categories = ['All', 'Sports', 'Academic', 'Social']

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [tab, setTab] = useState('Explore')
  const [joined, setJoined] = useState([])

  function toggleJoin(id) {
    if (joined.includes(id)) {
      setJoined(joined.filter((item) => item !== id))
    } else {
      setJoined([...joined, id])
    }
  }

  function changeTab(newTab) {
    setTab(newTab)
    setCategory('All')
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || activity.category === category

    const matchesTab =
      tab === 'Explore' || joined.includes(activity.id)

    return matchesSearch && matchesCategory && matchesTab
  })

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.navy}
        />

        <View style={styles.header}>
          <Text style={styles.logo}>CampusLink</Text>
          <Text style={styles.subtitle}>
            Your campus. Your community.
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              Find your people.
            </Text>

            <Text style={styles.heroText}>
              Discover activities, meet new friends, and
              get involved in your college community.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.tabs}>
              <Pressable
                style={[
                  styles.tab,
                  tab === 'Explore' && styles.activeTab,
                ]}
                onPress={() => changeTab('Explore')}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === 'Explore' && styles.activeTabText,
                  ]}
                >
                  Explore
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tab,
                  tab === 'My Activities' && styles.activeTab,
                ]}
                onPress={() => changeTab('My Activities')}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === 'My Activities' &&
                      styles.activeTabText,
                  ]}
                >
                  My Activities ({joined.length})
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.search}
              placeholder="Search campus activities..."
              placeholderTextColor="#7C8DA6"
              value={search}
              onChangeText={setSearch}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
            >
              {categories.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.categoryButton,
                    category === item &&
                      styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>
              {tab === 'Explore'
                ? 'Discover Activities'
                : 'My Activities'}
            </Text>

            <Text style={styles.sectionDescription}>
              {tab === 'Explore'
                ? 'Find something happening on campus.'
                : 'Activities you have joined.'}
            </Text>

            {filteredActivities.map((activity) => {
              const isJoined = joined.includes(activity.id)

              return (
                <View
                  key={activity.id}
                  style={styles.activityCard}
                >
                  <Text style={styles.activityCategory}>
                    {activity.category}
                  </Text>

                  <Text style={styles.activityTitle}>
                    {activity.title}
                  </Text>

                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>

                  <Text style={styles.activityDetails}>
                    Location: {activity.location}
                  </Text>

                  <Text style={styles.activityDetails}>
                    Time: {activity.time}
                  </Text>

                  <Pressable
                    style={[
                      styles.joinButton,
                      isJoined && styles.joinedButton,
                    ]}
                    onPress={() => toggleJoin(activity.id)}
                  >
                    <Text style={styles.joinButtonText}>
                      {isJoined
                        ? 'Joined ✓'
                        : 'Join Activity'}
                    </Text>
                  </Pressable>
                </View>
              )
            })}

            {filteredActivities.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {tab === 'My Activities' && joined.length === 0
                    ? "You haven't joined any activities yet."
                    : 'No activities found.'}
                </Text>
              </View>
            )}

            <Text style={styles.footer}>
              CampusLink | CSCE 3444
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  logo: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 26,
    color: colors.white,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#C9D8F0',
    marginTop: 4,
  },
  hero: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
  heroTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 30,
    color: colors.white,
    marginBottom: 14,
  },
  heroText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: colors.white,
  },
  content: {
    padding: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#E3EBF7',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.blue,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.navy,
  },
  activeTabText: {
    color: colors.white,
  },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CDD9EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.navy,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 20,
  },
  categories: {
    marginBottom: 25,
  },
  categoryButton: {
    backgroundColor: '#E3EBF7',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: colors.blue,
  },
  categoryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.navy,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 23,
    color: colors.navy,
    marginBottom: 8,
  },
  sectionDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCE5F2',
  },
  activityCategory: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.blue,
    marginBottom: 14,
  },
  activityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.navy,
    marginBottom: 10,
  },
  activityDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray,
    marginBottom: 16,
  },
  activityDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: colors.blue,
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },
  joinedButton: {
    backgroundColor: colors.green,
  },
  joinButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  emptyState: {
    backgroundColor: colors.white,
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  footer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
})
