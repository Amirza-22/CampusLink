import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebaseConfig'
import AuthScreen from './AuthScreen'

const C = {
  navy: '#0E1F38',
  blue: '#1F61D1',
  green: '#1F9E61',
  background: '#F2F7FF',
  white: '#FFFFFF',
  gray: '#697A92',
  lightGray: '#E7EEF8',
  border: '#DCE6F3',
}

const categories = ['All', 'Sports', 'Academic', 'Social', 'Creative', 'Wellness']

const initialActivities = [
  {
    id: '1', title: 'Campus Soccer', category: 'Sports',
    host: 'Campus Recreation', location: 'Recreation Center',
    time: 'Friday at 5:00 PM',
    description: 'Kick off the weekend with a casual soccer game. Everyone is welcome, no matter your experience.',
  },
  {
    id: '2', title: 'Study Group', category: 'Academic',
    host: 'Study Circle', location: 'University Library',
    time: 'Monday at 2:00 PM',
    description: 'Get together, share notes, and make studying a little less stressful.',
  },
  {
    id: '3', title: 'Campus Game Night', category: 'Social',
    host: 'Student Community', location: 'Student Union',
    time: 'Saturday at 6:00 PM',
    description: 'Board games, friendly competition, and a chance to meet new people.',
  },
  {
    id: '4', title: 'Creative Meetup', category: 'Creative',
    host: 'Creative Collective', location: 'Art Building',
    time: 'Thursday at 4:00 PM',
    description: 'Bring a sketchbook, a project, or just your ideas. Create something together.',
  },
  {
    id: '5', title: 'Campus Wellness Walk', category: 'Wellness',
    host: 'Campus Wellness', location: 'Campus Green',
    time: 'Wednesday at 9:00 AM',
    description: 'Take a break and meet other students on a laid-back walk around campus.',
  },
]

const categoryTheme = {
  Sports: { bg: '#DCEBFF', accent: '#1F61D1', icon: 'activity' },
  Academic: { bg: '#E6E2FF', accent: '#7561D1', icon: 'book' },
  Social: { bg: '#FFE9DD', accent: '#DE7543', icon: 'users' },
  Creative: { bg: '#FBE3F1', accent: '#BD548F', icon: 'sparkles' },
  Wellness: { bg: '#DDF5EA', accent: '#1F9E61', icon: 'heart' },
}

function Icon({ name, size = 22, color = C.navy, filled = false }) {
  const parts = {
    home: <><Path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3Z" fill={filled ? color : 'none'} /></>,
    explore: <><Circle cx="12" cy="12" r="9" /><Path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7Z" fill={filled ? color : 'none'} /></>,
    plus: <><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></>,
    calendar: <><Rect x="3" y="5" width="18" height="16" rx="2" /><Line x1="7" y1="3" x2="7" y2="7" /><Line x1="17" y1="3" x2="17" y2="7" /><Line x1="3" y1="10" x2="21" y2="10" /></>,
    user: <><Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-5 3.5-8 8-8s8 3 8 8" /></>,
    search: <><Circle cx="10.5" cy="10.5" r="6.5" /><Line x1="16" y1="16" x2="21" y2="21" /></>,
    bookmark: <><Path d="M6 3h12v18l-6-4-6 4Z" fill={filled ? color : 'none'} /></>,
    heart: <><Path d="M20.8 5.7a5 5 0 0 0-7.1 0L12 7.4l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.2a5 5 0 0 0 0-7.1Z" fill={filled ? color : 'none'} /></>,
    pin: <><Path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" /><Circle cx="12" cy="10" r="2.6" /></>,
    clock: <><Circle cx="12" cy="12" r="9" /><Path d="M12 6v6l4 2" /></>,
    users: <><Circle cx="9" cy="8" r="3" /><Path d="M2.5 20c0-4 2.5-6.5 6.5-6.5s6.5 2.5 6.5 6.5" /><Path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.6.3 4.5 2.5 4.5 6" /></>,
    arrow: <><Path d="M4 12h16m-7-7 7 7-7 7" /></>,
    close: <><Path d="M5 5 19 19M19 5 5 19" /></>,
    logout: <><Path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 7l5 5-5 5m-8-5h13" /></>,
    check: <><Path d="m5 12 4 4L19 6" /></>,
    activity: <><Path d="M2 12h4l3-7 5 14 3-7h5" /></>,
    book: <><Path d="M12 5c-3.1-2-6.5-2-9-1v15c3-1 6-.7 9 1 3-1.7 6-2 9-1V4c-2.5-1-5.9-1-9 1Zm0 0v15" /></>,
    sparkles: <><Path d="m12 2 2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2ZM19 18l.7 1.3L21 20l-1.3.7L19 22l-.7-1.3L17 20l1.3-.7Z" /></>,
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {parts[name] || parts.sparkles}
    </Svg>
  )
}

function LogoMark({ size = 38 }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.25 }]}>
      <Svg width={size * 0.77} height={size * 0.77} viewBox="0 0 100 100">
        <Path d="M72 19 A37 37 0 1 0 72 81" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
        <Path d="M58 37 V74 H82" fill="none" stroke="#BBDFFF" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="79" cy="20" r="9" fill="#78C9FF" />
      </Svg>
    </View>
  )
}

function CategoryPill({ name, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.categoryPill, selected && styles.categoryPillSelected,
      pressed && styles.pressed,
    ]}>
      <Text style={[styles.categoryPillText, selected && styles.categoryPillTextSelected]}>{name}</Text>
    </Pressable>
  )
}

function ActivityCard({ activity, joined, saved, liked, onJoin, onSave, onLike, onDetails }) {
  const theme = categoryTheme[activity.category] || categoryTheme.Social
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventTop}>
        <View style={[styles.hostAvatar, { backgroundColor: theme.bg }]}>
          <Icon name={theme.icon} size={21} color={theme.accent} />
        </View>
        <View style={styles.hostTextBox}>
          <Text style={styles.hostName}>{activity.host}</Text>
          <Text style={styles.hostSubtitle}>Campus activity · {activity.category}</Text>
        </View>
        <Pressable onPress={onSave} accessibilityLabel={saved ? 'Remove bookmark' : 'Bookmark activity'}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Icon name="bookmark" size={21} color={saved ? C.blue : C.gray} filled={saved} />
        </Pressable>
      </View>

      <Pressable onPress={onDetails} style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={[styles.eventArtwork, { backgroundColor: theme.bg }]}>
          <View style={[styles.artCircleLarge, { borderColor: theme.accent }]} />
          <View style={[styles.artCircleSmall, { backgroundColor: theme.accent }]} />
          <View style={[styles.eventArtIcon, { backgroundColor: theme.accent }]}>
            <Icon name={theme.icon} color={C.white} size={41} />
          </View>
          <View style={styles.artTag}>
            <Text style={[styles.artTagText, { color: theme.accent }]}>{activity.category}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.eventBody}>
        <View style={styles.eventActions}>
          <Pressable onPress={onLike} accessibilityLabel={liked ? 'Unlike activity' : 'Like activity'}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Icon name="heart" size={22} color={liked ? '#E65D78' : C.navy} filled={liked} />
            <Text style={[styles.actionLabel, liked && { color: '#E65D78' }]}>{liked ? 'Liked' : 'Like'}</Text>
          </Pressable>
          <Pressable onPress={onDetails} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Icon name="calendar" size={20} color={C.navy} />
            <Text style={styles.actionLabel}>Details</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onJoin} style={({ pressed }) => [
            styles.miniJoinButton, joined && styles.miniJoinedButton, pressed && styles.pressed,
          ]}>
            <Icon name={joined ? 'check' : 'plus'} size={16} color={joined ? C.green : C.white} />
            <Text style={[styles.miniJoinText, joined && { color: C.green }]}>{joined ? 'Joined' : 'Join'}</Text>
          </Pressable>
        </View>
        <Text style={styles.eventTitle}>{activity.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>{activity.description}</Text>
        <View style={styles.eventMeta}>
          <Icon name="pin" size={15} color={C.gray} />
          <Text style={styles.metaText} numberOfLines={1}>{activity.location}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Icon name="clock" size={15} color={C.gray} />
          <Text style={styles.metaText}>{activity.time}</Text>
        </View>
      </View>
    </View>
  )
}

function EmptyState({ icon = 'calendar', title, description, onAction, actionText }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Icon name={icon} color={C.blue} size={27} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {onAction && <Pressable onPress={onAction} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>{actionText}</Text>
      </Pressable>}
    </View>
  )
}

const navItems = [
  { key: 'Home', icon: 'home', label: 'Home' },
  { key: 'Explore', icon: 'explore', label: 'Explore' },
  { key: 'Create', icon: 'plus', label: 'Create' },
  { key: 'Activities', icon: 'calendar', label: 'Activities' },
  { key: 'Profile', icon: 'user', label: 'Profile' },
]

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tab, setTab] = useState('Home')
  const [activities, setActivities] = useState(initialActivities)
  const [joined, setJoined] = useState([])
  const [saved, setSaved] = useState([])
  const [liked, setLiked] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [activityView, setActivityView] = useState('Joined')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Social')
  const [newLocation, setNewLocation] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setCheckingAuth(false)
      setTab('Home')
      setActivities(initialActivities)
      setJoined([])
      setSaved([])
      setLiked([])
      setSelectedEvent(null)
    })
    return unsubscribe
  }, [])

  function toggle(setter, id) {
    setter((items) => items.includes(id)
      ? items.filter((item) => item !== id)
      : [...items, id]
    )
  }

  function navigate(nextTab) {
    setTab(nextTab)
    setSearch('')
    setCategory('All')
  }

  function exploreCategory(name) {
    setTab('Explore')
    setCategory(name)
    setSearch('')
  }

  async function handleSignOut() {
    try {
      await signOut(auth)
    } catch (error) {
      Alert.alert('Sign Out Error', 'Please try again.')
    }
  }

  function handleCreate() {
    if (!newTitle.trim() || !newLocation.trim() || !newTime.trim() || !newDescription.trim()) {
      setCreateError('Fill in every field to create your activity.')
      return
    }

    const activity = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      host: user?.displayName || user?.email?.split('@')[0] || 'Student',
      location: newLocation.trim(),
      time: newTime.trim(),
      description: newDescription.trim(),
      createdBy: user?.uid,
    }

    setActivities((items) => [activity, ...items])
    setNewTitle('')
    setNewLocation('')
    setNewTime('')
    setNewDescription('')
    setNewCategory('Social')
    setCreateError('')
    setTab('Home')
    Alert.alert('Activity created', 'Your demo activity is ready! Cloud saving comes in the next step.')
  }

  if (!fontsLoaded || checkingAuth) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={C.blue} /></View>
  }

  if (!user) {
    return <SafeAreaProvider><AuthScreen /></SafeAreaProvider>
  }

  const firstName = user.displayName?.trim().split(' ')[0]
    || user.email?.split('@')[0] || 'Student'
  const fullName = user.displayName || 'CampusLink Student'
  const visibleActivities = activities.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const content = [item.title, item.description, item.location, item.host].join(' ').toLowerCase()
    return matchesCategory && content.includes(search.trim().toLowerCase())
  })
  const myActivities = activities.filter((item) => (
    activityView === 'Joined' ? joined.includes(item.id) : saved.includes(item.id)
  ))
  const createdCount = activities.filter((item) => item.createdBy === user.uid).length

  function cardFor(activity) {
    return <ActivityCard
      key={activity.id}
      activity={activity}
      joined={joined.includes(activity.id)}
      saved={saved.includes(activity.id)}
      liked={liked.includes(activity.id)}
      onJoin={() => toggle(setJoined, activity.id)}
      onSave={() => toggle(setSaved, activity.id)}
      onLike={() => toggle(setLiked, activity.id)}
      onDetails={() => setSelectedEvent(activity)}
    />
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={C.background} />
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <LogoMark size={37} />
            <Text style={styles.brandTitle}>Campus<Text style={styles.brandTitleBlue}>Link</Text></Text>
          </View>
          <Pressable style={({ pressed }) => [styles.topAvatar, pressed && styles.pressed]}
            onPress={() => navigate('Profile')} accessibilityLabel="Open profile">
            <Text style={styles.topAvatarText}>{firstName[0]?.toUpperCase() || 'C'}</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView key={tab} style={styles.page} contentContainerStyle={styles.pageContent}
            keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {tab === 'Home' && <>
              <View style={styles.greetingBlock}>
                <Text style={styles.eyebrow}>GOOD TO SEE YOU</Text>
                <Text style={styles.greeting}>Hey, {firstName}.</Text>
                <Text style={styles.greetingSub}>Your campus is full of possibilities. Find your people.</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesScroll}
                contentContainerStyle={styles.storiesRow}>
                {categories.slice(1).map((name) => {
                  const theme = categoryTheme[name]
                  return <Pressable key={name} onPress={() => exploreCategory(name)}
                    style={({ pressed }) => [styles.story, pressed && styles.pressed]}>
                    <View style={[styles.storyRing, { borderColor: theme.accent }]}>
                      <View style={[styles.storyCircle, { backgroundColor: theme.bg }]}>
                        <Icon name={theme.icon} color={theme.accent} size={26} />
                      </View>
                    </View>
                    <Text style={styles.storyText}>{name}</Text>
                  </Pressable>
                })}
              </ScrollView>
              <Pressable onPress={() => navigate('Explore')} style={({ pressed }) => [styles.featuredBanner, pressed && styles.pressed]}>
                <View style={styles.featuredCircle} />
                <View style={styles.featuredCircleSmall} />
                <View style={styles.featuredCopy}>
                  <Text style={styles.featuredKicker}>WHAT'S HAPPENING?</Text>
                  <Text style={styles.featuredTitle}>Find your next{'\n'}favorite memory.</Text>
                  <View style={styles.featuredLink}>
                    <Text style={styles.featuredLinkText}>Explore activities</Text>
                    <Icon name="arrow" size={17} color={C.blue} />
                  </View>
                </View>
              </Pressable>
              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.sectionTitle}>Around campus</Text>
                  <Text style={styles.sectionCaption}>Discover what students are sharing</Text>
                </View>
                <Pressable onPress={() => navigate('Explore')}><Text style={styles.seeAll}>See all</Text></Pressable>
              </View>
              {activities.slice(0, 3).map(cardFor)}
              <Text style={styles.demoNote}>Sample events for the CampusLink demo</Text>
            </>}

            {tab === 'Explore' && <>
              <View style={styles.innerHeader}>
                <Text style={styles.sectionTitle}>Explore</Text>
                <Text style={styles.sectionCaption}>Find something worth showing up for</Text>
              </View>
              <View style={styles.searchBox}>
                <Icon name="search" color={C.gray} size={20} />
                <TextInput value={search} onChangeText={setSearch} style={styles.searchInput}
                  placeholder="Search activities, places, people..." placeholderTextColor="#91A1B6" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}
                contentContainerStyle={styles.filtersRow}>
                {categories.map((item) => <CategoryPill key={item} name={item}
                  selected={category === item} onPress={() => setCategory(item)} />)}
              </ScrollView>
              <Text style={styles.resultLabel}>{visibleActivities.length} activities</Text>
              {visibleActivities.length ? visibleActivities.map(cardFor) :
                <EmptyState icon="search" title="Nothing found yet" description="Try another search or choose a different category." />}
            </>}

            {tab === 'Create' && <>
              <View style={styles.innerHeader}>
                <Text style={styles.sectionTitle}>Create an activity</Text>
                <Text style={styles.sectionCaption}>Bring people together, one event at a time</Text>
              </View>
              <View style={styles.createCard}>
                <Text style={styles.inputLabel}>Activity title</Text>
                <TextInput style={styles.formInput} value={newTitle} onChangeText={setNewTitle}
                  placeholder="e.g. Friday pickup basketball" placeholderTextColor="#91A1B6" maxLength={80} />
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.createCategories}>
                  {categories.slice(1).map((item) => <Pressable key={item}
                    onPress={() => setNewCategory(item)}
                    style={[styles.createCategory, newCategory === item && styles.createCategorySelected]}>
                    <Text style={[styles.createCategoryText, newCategory === item && styles.createCategoryTextSelected]}>{item}</Text>
                  </Pressable>)}
                </View>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput style={styles.formInput} value={newLocation} onChangeText={setNewLocation}
                  placeholder="e.g. Student Union" placeholderTextColor="#91A1B6" maxLength={90} />
                <Text style={styles.inputLabel}>When</Text>
                <TextInput style={styles.formInput} value={newTime} onChangeText={setNewTime}
                  placeholder="e.g. Friday at 6:00 PM" placeholderTextColor="#91A1B6" maxLength={80} />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.formInput, styles.multilineInput]} value={newDescription}
                  onChangeText={setNewDescription} multiline textAlignVertical="top"
                  placeholder="Tell people what to expect..." placeholderTextColor="#91A1B6" maxLength={400} />
                {!!createError && <Text style={styles.formError}>{createError}</Text>}
                <Pressable onPress={handleCreate} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
                  <Icon name="plus" color={C.white} size={20} />
                  <Text style={styles.createButtonText}>Post activity</Text>
                </Pressable>
                <Text style={styles.createNote}>Demo mode: new activities are not saved to the cloud yet.</Text>
              </View>
            </>}

            {tab === 'Activities' && <>
              <View style={styles.innerHeader}>
                <Text style={styles.sectionTitle}>My activities</Text>
                <Text style={styles.sectionCaption}>Your plans, all in one place</Text>
              </View>
              <View style={styles.activityTabs}>
                {['Joined', 'Saved'].map((item) => <Pressable key={item}
                  onPress={() => setActivityView(item)} style={[styles.activityTab, activityView === item && styles.activityTabSelected]}>
                  <Text style={[styles.activityTabText, activityView === item && styles.activityTabTextSelected]}>
                    {item} ({item === 'Joined' ? joined.length : saved.length})
                  </Text>
                </Pressable>)}
              </View>
              {myActivities.length ? myActivities.map(cardFor) :
                <EmptyState icon={activityView === 'Joined' ? 'calendar' : 'bookmark'}
                  title={activityView === 'Joined' ? 'No plans just yet' : 'Nothing saved yet'}
                  description={activityView === 'Joined'
                    ? 'Find an activity you like and tap Join to see it here.'
                    : 'Bookmark interesting activities to find them again.'}
                  onAction={() => navigate('Explore')} actionText="Explore activities" />}
            </>}

            {tab === 'Profile' && <>
              <View style={styles.profileTop}>
                <View style={styles.profileAvatar}><Text style={styles.profileInitial}>{firstName[0]?.toUpperCase() || 'C'}</Text></View>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View style={styles.profileStats}>
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{joined.length}</Text><Text style={styles.statLabel}>Joined</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{saved.length}</Text><Text style={styles.statLabel}>Saved</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{createdCount}</Text><Text style={styles.statLabel}>Created</Text></View>
                </View>
              </View>
              <View style={styles.profileActions}>
                <Pressable style={styles.profileAction} onPress={() => navigate('Activities')}>
                  <View style={styles.profileActionLeft}><Icon name="calendar" size={20} color={C.blue} /><Text style={styles.profileActionText}>My activities</Text></View>
                  <Icon name="arrow" size={19} color={C.gray} />
                </Pressable>
                <Pressable style={styles.profileAction} onPress={() => { setActivityView('Saved'); navigate('Activities') }}>
                  <View style={styles.profileActionLeft}><Icon name="bookmark" size={20} color={C.blue} /><Text style={styles.profileActionText}>Saved activities</Text></View>
                  <Icon name="arrow" size={19} color={C.gray} />
                </Pressable>
                <Pressable style={styles.profileAction} onPress={handleSignOut}>
                  <View style={styles.profileActionLeft}><Icon name="logout" size={20} color="#C43E53" /><Text style={[styles.profileActionText, { color: '#C43E53' }]}>Sign out</Text></View>
                  <Icon name="arrow" size={19} color={C.gray} />
                </Pressable>
              </View>
              <Text style={styles.demoNote}>CampusLink · CSCE 3444</Text>
            </>}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomBar}>
          {navItems.map((item) => {
            const active = tab === item.key
            return <Pressable key={item.key} onPress={() => navigate(item.key)}
              accessibilityRole="tab" accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
              {item.key === 'Create'
                ? <View style={styles.navCreate}><Icon name="plus" size={23} color={C.white} /></View>
                : <Icon name={item.icon} size={24} color={active ? C.blue : '#8A9AAF'} filled={active && item.key === 'Home'} />}
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          })}
        </View>

        <Modal visible={!!selectedEvent} animationType="slide" transparent onRequestClose={() => setSelectedEvent(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalTop}>
                <Text style={styles.modalHeading}>Activity details</Text>
                <Pressable onPress={() => setSelectedEvent(null)} style={styles.modalClose}>
                  <Icon name="close" size={21} color={C.navy} />
                </Pressable>
              </View>
              {selectedEvent && <>
                <View style={styles.modalCategory}><Text style={styles.modalCategoryText}>{selectedEvent.category}</Text></View>
                <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                <View style={styles.modalInfo}><Icon name="pin" size={19} color={C.blue} /><Text style={styles.modalInfoText}>{selectedEvent.location}</Text></View>
                <View style={styles.modalInfo}><Icon name="clock" size={19} color={C.blue} /><Text style={styles.modalInfoText}>{selectedEvent.time}</Text></View>
                <View style={styles.modalInfo}><Icon name="users" size={19} color={C.blue} /><Text style={styles.modalInfoText}>Hosted by {selectedEvent.host}</Text></View>
                <Pressable onPress={() => toggle(setJoined, selectedEvent.id)}
                  style={[styles.createButton, joined.includes(selectedEvent.id) && { backgroundColor: C.green }]}>
                  <Icon name={joined.includes(selectedEvent.id) ? 'check' : 'plus'} size={21} color={C.white} />
                  <Text style={styles.createButtonText}>{joined.includes(selectedEvent.id) ? 'Joined - Tap to leave' : 'Join this activity'}</Text>
                </Pressable>
              </>}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  page: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  topBar: { height: 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.lightGray },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: C.navy, letterSpacing: -1 },
  brandTitleBlue: { color: C.blue },
  topAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5EEFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CADBFA' },
  topAvatarText: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.blue, fontSize: 15 },
  pageContent: { paddingHorizontal: 17, paddingTop: 24, paddingBottom: 24, flexGrow: 1 },
  greetingBlock: { marginHorizontal: 3, marginBottom: 19 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', color: C.blue, letterSpacing: 1.6, fontSize: 10, marginBottom: 7 },
  greeting: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 29, color: C.navy, letterSpacing: -1.2 },
  greetingSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: C.gray, marginTop: 7, lineHeight: 21 },
  storiesScroll: { marginHorizontal: -17, marginBottom: 22 },
  storiesRow: { paddingHorizontal: 17, gap: 15 },
  story: { alignItems: 'center', width: 65 },
  storyRing: { borderWidth: 2, borderRadius: 40, width: 61, height: 61, padding: 3, alignItems: 'center', justifyContent: 'center' },
  storyCircle: { width: '100%', height: '100%', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  storyText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.navy, fontSize: 10, marginTop: 7 },
  featuredBanner: { backgroundColor: C.navy, minHeight: 178, borderRadius: 23, marginBottom: 28, overflow: 'hidden', padding: 22, justifyContent: 'center' },
  featuredCircle: { position: 'absolute', right: -60, top: -67, width: 190, height: 190, borderRadius: 95, borderWidth: 36, borderColor: '#1F61D1', opacity: 0.65 },
  featuredCircleSmall: { position: 'absolute', right: 30, bottom: -43, height: 90, width: 90, borderRadius: 45, backgroundColor: '#4266B7', opacity: 0.52 },
  featuredCopy: { alignItems: 'flex-start' },
  featuredKicker: { fontFamily: 'PlusJakartaSans_700Bold', color: '#A7CBFF', fontSize: 9, letterSpacing: 1.3, marginBottom: 7 },
  featuredTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.white, fontSize: 22, lineHeight: 30, letterSpacing: -0.7 },
  featuredLink: { backgroundColor: C.white, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  featuredLinkText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.blue },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.navy, fontSize: 22, letterSpacing: -0.7 },
  sectionCaption: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 19, marginTop: 4 },
  seeAll: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: C.blue },
  eventCard: { backgroundColor: C.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 18, elevation: 2, shadowColor: C.navy, shadowOpacity: 0.04, shadowRadius: 9, shadowOffset: { width: 0, height: 3 } },
  eventTop: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  hostAvatar: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hostTextBox: { flex: 1, marginLeft: 10 },
  hostName: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12 },
  hostSubtitle: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 10, marginTop: 2 },
  iconButton: { padding: 7 },
  eventArtwork: { height: 146, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artCircleLarge: { position: 'absolute', width: 205, height: 205, borderRadius: 103, right: -50, top: -67, borderWidth: 40, opacity: 0.12 },
  artCircleSmall: { position: 'absolute', width: 77, height: 77, borderRadius: 39, bottom: -32, left: 30, opacity: 0.12 },
  eventArtIcon: { width: 75, height: 75, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowOpacity: 0.12, shadowRadius: 6 },
  artTag: { position: 'absolute', bottom: 12, left: 13, backgroundColor: C.white, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  artTagText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  eventBody: { paddingHorizontal: 14, paddingBottom: 16 },
  eventActions: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 19 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: C.navy },
  miniJoinButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.blue, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11, gap: 3 },
  miniJoinedButton: { backgroundColor: '#E1F7EB' },
  miniJoinText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.white },
  eventTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: C.navy, marginTop: 5 },
  eventDescription: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 10 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5 },
  metaText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: C.gray, flexShrink: 1 },
  demoNote: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: '#95A2B4', textAlign: 'center', marginVertical: 14 },
  innerHeader: { marginHorizontal: 3, marginBottom: 21 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 15, paddingHorizontal: 13, height: 53, gap: 9 },
  searchInput: { flex: 1, color: C.navy, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 },
  filtersScroll: { marginHorizontal: -17, marginTop: 18, marginBottom: 15 },
  filtersRow: { paddingHorizontal: 17, gap: 9 },
  categoryPill: { borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  categoryPillSelected: { borderColor: C.blue, backgroundColor: C.blue },
  categoryPillText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.gray, fontSize: 11 },
  categoryPillTextSelected: { color: C.white },
  resultLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12, marginBottom: 13, marginLeft: 2 },
  bottomBar: { backgroundColor: C.white, borderTopColor: C.lightGray, borderTopWidth: 1, flexDirection: 'row', paddingVertical: 8, minHeight: 69, justifyContent: 'space-around' },
  navItem: { width: '20%', alignItems: 'center', justifyContent: 'center', gap: 5 },
  navCreate: { backgroundColor: C.blue, borderRadius: 15, height: 37, width: 43, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: '#174795', elevation: 3 },
  navLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, color: '#8A9AAF' },
  navLabelActive: { color: C.blue },
  emptyState: { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 26, alignItems: 'center', marginTop: 7 },
  emptyIcon: { backgroundColor: '#E7EFFF', borderRadius: 26, width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 16, marginTop: 15, textAlign: 'center' },
  emptyDescription: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  emptyAction: { marginTop: 19, backgroundColor: C.blue, paddingHorizontal: 17, paddingVertical: 12, borderRadius: 11 },
  emptyActionText: { fontFamily: 'PlusJakartaSans_700Bold', color: C.white, fontSize: 12 },
  createCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 21, padding: 20 },
  inputLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12, marginBottom: 9 },
  formInput: { borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: '#FAFCFF', padding: 14, fontFamily: 'PlusJakartaSans_500Medium', color: C.navy, fontSize: 12, marginBottom: 19, minHeight: 51 },
  multilineInput: { minHeight: 115 },
  createCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 21 },
  createCategory: { borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9 },
  createCategorySelected: { backgroundColor: '#E5EEFF', borderColor: C.blue },
  createCategoryText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: C.gray },
  createCategoryTextSelected: { color: C.blue },
  createButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: C.blue, minHeight: 52, borderRadius: 13, borderBottomWidth: 3, borderBottomColor: '#164590' },
  createButtonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: C.white },
  createNote: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 17, color: C.gray, marginTop: 14 },
  formError: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#C43E53', marginBottom: 13 },
  activityTabs: { flexDirection: 'row', padding: 5, backgroundColor: '#E5ECF6', borderRadius: 13, marginBottom: 20 },
  activityTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 },
  activityTabSelected: { backgroundColor: C.white, elevation: 2 },
  activityTabText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.gray, fontSize: 12 },
  activityTabTextSelected: { color: C.blue },
  profileTop: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 21, paddingTop: 24, alignItems: 'center', overflow: 'hidden' },
  profileAvatar: { backgroundColor: C.blue, width: 77, height: 77, borderRadius: 39, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.white, fontSize: 29 },
  profileName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 19, color: C.navy, marginTop: 13 },
  profileEmail: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: C.gray, marginTop: 5 },
  profileStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.lightGray, marginTop: 22, width: '100%', paddingVertical: 17, justifyContent: 'space-evenly', alignItems: 'center' },
  profileStat: { alignItems: 'center', flex: 1 },
  statNumber: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: C.navy },
  statLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: C.gray, marginTop: 3 },
  statDivider: { backgroundColor: C.lightGray, height: 28, width: 1 },
  profileActions: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 18, marginTop: 20, overflow: 'hidden' },
  profileAction: { padding: 17, borderBottomWidth: 1, borderBottomColor: C.lightGray, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileActionText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: C.navy },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,21,42,0.42)' },
  modalSheet: { backgroundColor: C.white, padding: 23, paddingBottom: 35, borderTopLeftRadius: 27, borderTopRightRadius: 27 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalHeading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: C.gray },
  modalClose: { padding: 5 },
  modalCategory: { backgroundColor: '#E5EEFF', alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, marginTop: 20 },
  modalCategoryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.blue },
  modalEventTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 23, color: C.navy, marginTop: 13 },
  modalDescription: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 22, color: C.gray, marginVertical: 13 },
  modalInfo: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 12 },
  modalInfoText: { flex: 1, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: C.navy },
})
