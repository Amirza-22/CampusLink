

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
import DateTimePicker from '@react-native-community/datetimepicker'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { getFirestore, collection, onSnapshot, addDoc, doc, runTransaction, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { auth } from './firebaseConfig'
import AuthScreen from './AuthScreen'

const db = getFirestore(auth.app)

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

function dateLabel(value) {
  return value.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function sortedActivities(items) {
  const now = Date.now()
  return [...items].sort((a, b) => {
    const aDate = Number.isFinite(a.startsAt) ? a.startsAt : null
    const bDate = Number.isFinite(b.startsAt) ? b.startsAt : null
    const aGroup = aDate === null ? 2 : aDate >= now ? 0 : 1
    const bGroup = bDate === null ? 2 : bDate >= now ? 0 : 1
    if (aGroup !== bGroup) return aGroup - bGroup
    if (aDate !== null && bDate !== null) {
      return aGroup === 1 ? bDate - aDate : aDate - bDate
    }
    return 0
  })
}


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
    <Pressable onPress={onDetails} accessibilityRole="button" accessibilityLabel={`View details for ${activity.title}`}
      style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}>
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

      <View>
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
      </View>

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
            <Text style={[styles.miniJoinText, joined && { color: C.green }]}>{joined ? 'Joined' : (!activity.demo && Number.isInteger(activity.maxParticipants) && Object.keys(activity.participants || {}).length >= activity.maxParticipants ? 'Full' : 'Join')}</Text>
          </Pressable>
        </View>
        <Text style={styles.eventTitle}>{activity.title}</Text>
        {!activity.demo && <Text style={styles.capacityCard}>{Number.isInteger(activity.maxParticipants) && activity.maxParticipants > 0
          ? `${Object.keys(activity.participants || {}).length}/${activity.maxParticipants} spots filled`
          : `${Object.keys(activity.participants || {}).length} participants`}</Text>}
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
    </Pressable>
  )
}

function LoadingNotice({ message }) {
  return (
    <View style={styles.loadingNotice}>
      <ActivityIndicator color={C.blue} size="small" />
      <Text style={styles.loadingNoticeText}>{message}</Text>
    </View>
  )
}

function LoadProblem({ message, onRetry }) {
  return (
    <View style={styles.loadProblem}>
      <Text style={styles.loadProblemText}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
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
  const [demoJoined, setDemoJoined] = useState([])
  const [cloudActivities, setCloudActivities] = useState([])
  const [busyActivity, setBusyActivity] = useState(null)
  const [cloudError, setCloudError] = useState('')
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [preferencesError, setPreferencesError] = useState('')
  const [profileLoadError, setProfileLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [creatingActivity, setCreatingActivity] = useState(false)
  const [busyPreference, setBusyPreference] = useState(null)
  const [saved, setSaved] = useState([])
  const [liked, setLiked] = useState([])
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [category, setCategory] = useState('All')
  const [dateFilter, setDateFilter] = useState('Upcoming')
  const [availabilityFilter, setAvailabilityFilter] = useState('All spots')
  const [search, setSearch] = useState('')
  const [activityView, setActivityView] = useState('Joined')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Social')
  const [newLocation, setNewLocation] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newDate, setNewDate] = useState(() => new Date(Date.now() + 86400000))
  const [createPicker, setCreatePicker] = useState(null)
  const [newDescription, setNewDescription] = useState('')
  const [newCapacity, setNewCapacity] = useState('10')
  const [createError, setCreateError] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('Social')
  const [editLocation, setEditLocation] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editDate, setEditDate] = useState(() => new Date(Date.now() + 86400000))
  const [editPicker, setEditPicker] = useState(null)
  const [editDescription, setEditDescription] = useState('')
  const [editCapacity, setEditCapacity] = useState('10')
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [profile, setProfile] = useState({})
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileUniversity, setProfileUniversity] = useState('')
  const [profileMajor, setProfileMajor] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setCheckingAuth(false)
      setTab('Home')
      setDemoJoined([])
      setCloudActivities([])
      setActivitiesLoading(true)
      setCloudError('')
      setProfileLoading(true)
      setProfileLoadError('')
      setPreferencesError('')
      setSaved([])
      setLiked([])
      setPreferencesLoaded(false)
      setSelectedEvent(null)
      setEditingEvent(null)
      setEditingProfile(false)
      setProfile({})
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    setActivitiesLoading(true)
    const stop = onSnapshot(collection(db, 'activities'), (snapshot) => {
      setCloudActivities(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })))
      setCloudError('')
      setActivitiesLoading(false)
    }, (error) => {
      setCloudError('Could not load shared activities. Check that Firestore is enabled and its rules allow signed-in users to read activities.')
      console.log('Firestore activities error:', error.message)
      setActivitiesLoading(false)
    })
    return stop
  }, [user?.uid, reloadKey])

  useEffect(() => {
    if (!user?.uid) return
    setProfileLoading(true)
    const stop = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() : {})
      setProfileLoadError('')
      setProfileLoading(false)
    }, (error) => {
      console.log('Load profile error:', error.message)
      setProfileLoadError('Unable to load your profile. Check your connection and try again.')
      setProfileLoading(false)
    })
    return stop
  }, [user?.uid, reloadKey])

  useEffect(() => {
    if (!user?.uid) return
    const reference = doc(db, 'users', user.uid, 'preferences', 'activityInteractions')
    setPreferencesLoaded(false)
    const stop = onSnapshot(reference, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {}
      setSaved(Array.isArray(data.saved) ? data.saved : [])
      setLiked(Array.isArray(data.liked) ? data.liked : [])
      setPreferencesLoaded(true)
      setPreferencesError('')
    }, (error) => {
      console.log('Load saved activities error:', error.message)
      setPreferencesLoaded(false)
      setPreferencesError('Unable to load saved activities and likes.')
    })
    return stop
  }, [user?.uid, reloadKey])

  function retryLoading() {
    setCloudError('')
    setPreferencesError('')
    setProfileLoadError('')
    setReloadKey((value) => value + 1)
  }

  async function togglePreference(kind, activityId) {
    if (!user || !preferencesLoaded) {
      Alert.alert('Loading', 'Your saved activities are still loading. Please try again.')
      return
    }
    if (busyPreference) return
    setBusyPreference(`${kind}:${activityId}`)
    try {
      const reference = doc(db, 'users', user.uid, 'preferences', 'activityInteractions')
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference)
        const data = snapshot.exists() ? snapshot.data() : {}
        const existing = Array.isArray(data[kind]) ? data[kind] : []
        const updated = existing.includes(activityId)
          ? existing.filter((id) => id !== activityId)
          : [...existing, activityId]
        if (updated.length > 500) throw new Error('You have reached the 500-activity limit.')
        transaction.set(reference, { saved: [], liked: [], ...data, [kind]: updated })
      })
    } catch (error) {
      console.log('Save preference error:', error.message)
      Alert.alert('Unable to save', 'Your changes could not be saved. Please try again.')
    } finally {
      setBusyPreference(null)
    }
  }

  function openProfileEditor() {
    setProfileName(profile.displayName || user.displayName || '')
    setProfileUniversity(profile.university || '')
    setProfileMajor(profile.major || '')
    setProfileBio(profile.bio || '')
    setProfileError('')
    setEditingProfile(true)
  }

  async function saveProfile() {
    if (savingProfile || !user) return
    const name = profileName.trim()
    if (!name || name.length > 80) {
      setProfileError('Enter a name (up to 80 characters).')
      return
    }
    setSavingProfile(true)
    setProfileError('')
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        university: profileUniversity.trim(),
        major: profileMajor.trim(),
        bio: profileBio.trim(),
      }, { merge: true })
      try {
        await updateProfile(user, { displayName: name })
      } catch (authError) {
        console.log('Auth display name update:', authError.message)
      }
      setEditingProfile(false)
      Alert.alert('Profile saved', 'Your changes are saved in Firebase.')
    } catch (error) {
      console.log('Save profile error:', error.message)
      setProfileError('Could not save your profile. Check the Firestore users rules.')
    } finally {
      setSavingProfile(false)
    }
  }

  const activities = sortedActivities(cloudActivities)
  const joined = activities.filter((item) => item.demo
    ? demoJoined.includes(item.id)
    : Boolean(item.participants?.[user?.uid])).map((item) => item.id)

  function participantsFor(activity) {
    if (!activity) return []
    if (activity.demo) return demoJoined.includes(activity.id)
      ? [{ uid: user.uid, name: profile.displayName || user.displayName || user.email?.split('@')[0] || 'Student' }] : []
    return Object.entries(activity.participants || {}).map(([uid, name]) => ({ uid, name }))
  }

  function capacityFor(activity) {
    return Number.isInteger(activity?.maxParticipants) && activity.maxParticipants > 0
      ? activity.maxParticipants : null
  }

  function spotsText(activity) {
    const count = Object.keys(activity?.participants || {}).length
    const limit = capacityFor(activity)
    return limit ? `${count}/${limit} spots filled` : `${count} participants`
  }

  async function handleJoin(activity) {
    if (activity.demo) {
      toggle(setDemoJoined, activity.id)
      return
    }
    if (busyActivity) return
    setBusyActivity(activity.id)
    try {
      const reference = doc(db, 'activities', activity.id)
      await runTransaction(db, async (transaction) => {
        const current = await transaction.get(reference)
        if (!current.exists()) throw new Error('This activity no longer exists.')
        const participants = { ...(current.data().participants || {}) }
        if (participants[user.uid]) {
          delete participants[user.uid]
        } else {
          const limit = capacityFor(current.data())
          if (limit && Object.keys(participants).length >= limit) {
            throw new Error('This activity is full.')
          }
          participants[user.uid] = profile.displayName || user.displayName || user.email?.split('@')[0] || 'Student'
        }
        transaction.update(reference, { participants })
      })
    } catch (error) {
      Alert.alert('Unable to update activity', error.message || 'Please try again.')
    } finally {
      setBusyActivity(null)
    }
  }

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
    setDateFilter('Upcoming')
    setAvailabilityFilter('All spots')
  }

  function exploreCategory(name) {
    setTab('Explore')
    setCategory(name)
    setSearch('')
    setDateFilter('Upcoming')
    setAvailabilityFilter('All spots')
  }

  async function handleSignOut() {
    try {
      await signOut(auth)
    } catch (error) {
      Alert.alert('Sign Out Error', 'Please try again.')
    }
  }

  async function handleCreate() {
    if (creatingActivity) return
    if (!newTitle.trim() || !newLocation.trim() || !newDescription.trim()) {
      setCreateError('Fill in every field to create your activity.')
      return
    }

    if (newDate.getTime() <= Date.now()) {
      setCreateError('Choose a future date and time.')
      return
    }
    const capacity = Number(newCapacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
      setCreateError('Maximum participants must be a number from 1 to 100.')
      return
    }

    const activity = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      host: user?.displayName || user?.email?.split('@')[0] || 'Student',
      location: newLocation.trim(),
      time: dateLabel(newDate),
      startsAt: newDate.getTime(),
      description: newDescription.trim(),
      createdBy: user?.uid,
    }

    setCreatingActivity(true)
    try {
      await addDoc(collection(db, 'activities'), {
        title: activity.title, category: activity.category, host: activity.host,
        location: activity.location, time: activity.time, startsAt: activity.startsAt, description: activity.description,
        createdBy: user.uid, participants: {}, createdAt: Date.now(),
        maxParticipants: capacity,
      })
    } catch (error) {
      setCreateError('Unable to save to Firestore. Check Firestore setup and permissions.')
      console.log('Create activity error:', error.message)
      return
    } finally {
      setCreatingActivity(false)
    }
    setNewTitle('')
    setNewLocation('')
    setNewTime('')
    setNewDate(new Date(Date.now() + 86400000))
    setNewDescription('')
    setNewCategory('Social')
    setNewCapacity('10')
    setCreateError('')
    setTab('Home')
    Alert.alert('Activity created', 'Your activity is now shared with other students.')
  }

  function openEdit(activity) {
    if (!activity || activity.demo || activity.createdBy !== user.uid) return
    setSelectedEvent(null)
    setEditingEvent(activity)
    setEditTitle(activity.title)
    setEditCategory(activity.category)
    setEditLocation(activity.location)
    setEditTime(activity.time)
    setEditDate(Number.isFinite(activity.startsAt) ? new Date(activity.startsAt) : new Date(Date.now() + 86400000))
    setEditDescription(activity.description)
    setEditCapacity(String(capacityFor(activity) || 10))
    setEditError('')
  }

  async function saveEdit() {
    if (!editingEvent || savingEdit || editingEvent.createdBy !== user.uid) return
    if (!editTitle.trim() || !editLocation.trim() || !editDescription.trim()) {
      setEditError('Please fill in all fields.')
      return
    }
    if (editDate.getTime() <= Date.now()) {
      setEditError('Choose a future date and time.')
      return
    }
    const capacity = Number(editCapacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
      setEditError('Maximum participants must be from 1 to 100.')
      return
    }
    const latest = cloudActivities.find((item) => item.id === editingEvent.id)
    const numberJoined = Object.keys(latest?.participants || {}).length
    if (capacity < numberJoined) {
      setEditError(`There are already ${numberJoined} participants. Choose a higher limit.`)
      return
    }
    setSavingEdit(true)
    try {
      await updateDoc(doc(db, 'activities', editingEvent.id), {
        title: editTitle.trim(), category: editCategory,
        location: editLocation.trim(), time: dateLabel(editDate), startsAt: editDate.getTime(),
        description: editDescription.trim(), maxParticipants: capacity,
      })
      setEditingEvent(null)
      Alert.alert('Saved', 'Your activity has been updated.')
    } catch (error) {
      setEditError(error.code === 'permission-denied'
        ? 'Firestore rules do not allow editing yet.'
        : 'Unable to save changes. Please try again.')
      console.log('Edit activity error:', error.message)
    } finally {
      setSavingEdit(false)
    }
  }

  function confirmDelete(activity) {
    if (!activity || activity.demo || activity.createdBy !== user.uid || savingEdit) return
    Alert.alert('Delete activity?', `Delete "${activity.title}" for everyone? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setSavingEdit(true)
        try {
          await deleteDoc(doc(db, 'activities', activity.id))
          setSelectedEvent(null)
          setEditingEvent(null)
          Alert.alert('Deleted', 'Your activity has been removed.')
        } catch (error) {
          Alert.alert('Unable to delete', error.code === 'permission-denied'
            ? 'Firestore rules do not allow deleting yet.' : 'Please try again.')
        } finally {
          setSavingEdit(false)
        }
      } },
    ])
  }

  if (!fontsLoaded || checkingAuth) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={C.blue} /></View>
  }

  if (!user) {
    return <SafeAreaProvider><AuthScreen /></SafeAreaProvider>
  }

  const fullName = profile.displayName || user.displayName || 'CampusLink Student'
  const firstName = fullName.trim().split(' ')[0] || user.email?.split('@')[0] || 'Student'
  const visibleActivities = activities.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const content = [item.title, item.description, item.location, item.host].join(' ').toLowerCase()
    const matchesSearch = content.includes(search.trim().toLowerCase())
    const eventTime = typeof item.startsAt === 'number' && Number.isFinite(item.startsAt)
      ? item.startsAt : null
    const now = Date.now()
    const matchesDate = dateFilter === 'All dates'
      || (dateFilter === 'Upcoming' && eventTime !== null && eventTime >= now)
      || (dateFilter === 'Past' && eventTime !== null && eventTime < now)
      || (dateFilter === 'No date' && eventTime === null)
    const max = Number.isInteger(item.maxParticipants) && item.maxParticipants > 0
      ? item.maxParticipants : null
    const participantCount = Object.keys(item.participants || {}).length
    const hasSpots = max === null || participantCount < max || joined.includes(item.id)
    const matchesAvailability = availabilityFilter === 'All spots' || hasSpots
    return matchesCategory && matchesSearch && matchesDate && matchesAvailability
  })
  const myActivities = activities.filter((item) => (
    activityView === 'Joined' ? joined.includes(item.id) : activityView === 'Created' ? item.createdBy === user.uid : saved.includes(item.id)
  ))
  const createdCount = activities.filter((item) => item.createdBy === user.uid).length
  const validSavedCount = activities.filter((item) => saved.includes(item.id)).length

  function cardFor(activity) {
    return <ActivityCard
      key={activity.id}
      activity={activity}
      joined={joined.includes(activity.id)}
      saved={saved.includes(activity.id)}
      liked={liked.includes(activity.id)}
      onJoin={() => handleJoin(activity)}
      onSave={() => togglePreference('saved', activity.id)}
      onLike={() => togglePreference('liked', activity.id)}
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
              {!!cloudError && <LoadProblem message={cloudError} onRetry={retryLoading} />}
              {activitiesLoading && <LoadingNotice message="Loading campus activities..." />}
              {!activitiesLoading && activities.length ? activities.slice(0, 3).map(cardFor) : !activitiesLoading && !cloudError &&
                <EmptyState icon="calendar" title="No activities yet"
                  description="Be the first to bring students together. Create an activity to get started."
                  onAction={() => navigate('Create')} actionText="Create an activity" />}
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
              <Text style={styles.filterHeading}>When</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}
                contentContainerStyle={styles.filtersRow}>
                {['Upcoming', 'Past', 'All dates', 'No date'].map((item) =>
                  <CategoryPill key={item} name={item} selected={dateFilter === item}
                    onPress={() => setDateFilter(item)} />)}
              </ScrollView>
              <Text style={styles.filterHeading}>Availability</Text>
              <View style={styles.filterAvailabilityRow}>
                {['All spots', 'Spots available'].map((item) =>
                  <CategoryPill key={item} name={item} selected={availabilityFilter === item}
                    onPress={() => setAvailabilityFilter(item)} />)}
              </View>
              <View style={styles.filterResultRow}>
                <Text style={styles.resultLabel}>{visibleActivities.length} activities</Text>
                <Pressable onPress={() => { setSearch(''); setCategory('All'); setDateFilter('Upcoming'); setAvailabilityFilter('All spots') }}>
                  <Text style={styles.resetFilters}>Reset filters</Text>
                </Pressable>
              </View>
              {!!cloudError && <LoadProblem message={cloudError} onRetry={retryLoading} />}
              {activitiesLoading && <LoadingNotice message="Finding activities..." />}
              {!activitiesLoading && !cloudError && (visibleActivities.length ? visibleActivities.map(cardFor) :
                <EmptyState icon="search" title="No matching activities" description="Try All dates, another category, or reset your filters." />)}
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
                <Text style={styles.inputLabel}>Date and time</Text>
                <Text style={styles.dateValue}>{dateLabel(newDate)}</Text>
                <View style={styles.dateActions}>
                  <Pressable style={styles.dateButton} onPress={() => setCreatePicker('date')}><Text style={styles.dateButtonText}>Choose date</Text></Pressable>
                  <Pressable style={styles.dateButton} onPress={() => setCreatePicker('time')}><Text style={styles.dateButtonText}>Choose time</Text></Pressable>
                </View>
                {!!createPicker && <DateTimePicker value={newDate} mode={createPicker} display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={createPicker === 'date' ? new Date() : undefined}
                  onChange={(event, chosen) => {
                    if (Platform.OS !== 'ios') setCreatePicker(null)
                    if (event.type === 'dismissed' || !chosen) return
                    setNewDate((previous) => {
                      const next = new Date(previous)
                      if (createPicker === 'date') next.setFullYear(chosen.getFullYear(), chosen.getMonth(), chosen.getDate())
                      else next.setHours(chosen.getHours(), chosen.getMinutes(), 0, 0)
                      return next
                    })
                  }} />}
                {Platform.OS === 'ios' && !!createPicker && <Pressable style={styles.dateDone} onPress={() => setCreatePicker(null)}><Text style={styles.dateButtonText}>Done</Text></Pressable>}
                <Text style={styles.inputLabel}>Maximum participants (1-100)</Text>
                <TextInput style={styles.formInput} value={newCapacity} onChangeText={setNewCapacity}
                  keyboardType="number-pad" maxLength={3} placeholder="e.g. 10" />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.formInput, styles.multilineInput]} value={newDescription}
                  onChangeText={setNewDescription} multiline textAlignVertical="top"
                  placeholder="Tell people what to expect..." placeholderTextColor="#91A1B6" maxLength={400} />
                {!!createError && <Text style={styles.formError}>{createError}</Text>}
                <Pressable disabled={creatingActivity} onPress={handleCreate} style={({ pressed }) => [styles.createButton, (pressed || creatingActivity) && styles.pressed]}>
                  {creatingActivity ? <ActivityIndicator color={C.white} /> : <Icon name="plus" color={C.white} size={20} />}
                  <Text style={styles.createButtonText}>{creatingActivity ? 'Posting activity...' : 'Post activity'}</Text>
                </Pressable>
                <Text style={styles.createNote}>New activities are shared with signed-in CampusLink users.</Text>
              </View>
            </>}

            {tab === 'Activities' && <>
              <View style={styles.innerHeader}>
                <Text style={styles.sectionTitle}>My activities</Text>
                <Text style={styles.sectionCaption}>Your plans, all in one place</Text>
              </View>
              <View style={styles.activityTabs}>
                {['Joined', 'Created', 'Saved'].map((item) => <Pressable key={item}
                  onPress={() => setActivityView(item)} style={[styles.activityTab, activityView === item && styles.activityTabSelected]}>
                  <Text style={[styles.activityTabText, activityView === item && styles.activityTabTextSelected]}>
                    {item} ({item === 'Joined' ? joined.length : item === 'Created' ? createdCount : validSavedCount})
                  </Text>
                </Pressable>)}
              </View>
              {!!cloudError && <LoadProblem message={cloudError} onRetry={retryLoading} />}
              {activitiesLoading || (activityView === 'Saved' && !preferencesLoaded && !preferencesError) ?
                <LoadingNotice message="Loading your activities..." /> : !cloudError && (myActivities.length ? myActivities.map(cardFor) :
                <EmptyState icon={activityView === 'Saved' ? 'bookmark' : 'calendar'}
                  title={activityView === 'Joined' ? 'No plans just yet' : activityView === 'Created' ? 'No activities created yet' : 'Nothing saved yet'}
                  description={activityView === 'Joined'
                    ? 'Find an activity you like and tap Join to see it here.'
                    : activityView === 'Created' ? 'Create your first activity to see it here.'
                    : 'Bookmark interesting activities to find them again.'}
                  onAction={() => navigate('Explore')} actionText="Explore activities" />)}
            </>}

            {tab === 'Profile' && <>
              {!!profileLoadError && <LoadProblem message={profileLoadError} onRetry={retryLoading} />}
              {!!preferencesError && <LoadProblem message={preferencesError} onRetry={retryLoading} />}
              {profileLoading && <LoadingNotice message="Loading your profile..." />}
              <View style={styles.profileTop}>
                <View style={styles.profileAvatar}><Text style={styles.profileInitial}>{firstName[0]?.toUpperCase() || 'C'}</Text></View>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                {!!profile.university && <Text style={styles.profileDetail}>{profile.university}</Text>}
                {!!profile.major && <Text style={styles.profileDetail}>{profile.major}</Text>}
                {!!profile.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
                <Pressable onPress={openProfileEditor} style={styles.editProfileButton}>
                  <Text style={styles.editProfileText}>Edit profile</Text>
                </Pressable>
                <View style={styles.profileStats}>
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{joined.length}</Text><Text style={styles.statLabel}>Joined</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{validSavedCount}</Text><Text style={styles.statLabel}>Saved</Text></View>
                  <View style={styles.statDivider} />
                  <View style={styles.profileStat}><Text style={styles.statNumber}>{createdCount}</Text><Text style={styles.statLabel}>Created</Text></View>
                </View>
              </View>
              <View style={styles.profileActions}>
                <Pressable style={styles.profileAction} onPress={() => { setActivityView('Created'); navigate('Activities') }}>
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
              <ScrollView style={{ maxHeight: '90%' }} contentContainerStyle={{ paddingBottom: 12 }}>
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
                {!selectedEvent.demo && selectedEvent.createdBy === user.uid && (
                  <View style={styles.ownerActions}>
                    <Pressable style={styles.ownerEditButton}
                      onPress={() => openEdit(activities.find((item) => item.id === selectedEvent.id) || selectedEvent)}>
                      <Text style={styles.ownerEditText}>Edit activity</Text>
                    </Pressable>
                    <Pressable style={styles.ownerDeleteButton}
                      onPress={() => confirmDelete(selectedEvent)}>
                      <Text style={styles.ownerDeleteText}>Delete</Text>
                    </Pressable>
                  </View>
                )}
                {!selectedEvent.demo && (
                  <Text style={styles.capacitySummary}>{spotsText(activities.find((item) => item.id === selectedEvent.id) || selectedEvent)}</Text>
                )}
                <View style={styles.participantsBlock}>
                  <Text style={styles.participantsHeading}>Participants ({participantsFor(activities.find((item) => item.id === selectedEvent.id) || selectedEvent).length})</Text>
                  {participantsFor(activities.find((item) => item.id === selectedEvent.id) || selectedEvent).length ?
                    participantsFor(activities.find((item) => item.id === selectedEvent.id) || selectedEvent).map((person) => (
                      <View key={person.uid} style={styles.participantRow}>
                        <View style={styles.participantAvatar}><Text style={styles.participantInitial}>{person.name[0]?.toUpperCase() || 'S'}</Text></View>
                        <Text style={styles.participantName}>{person.name}{person.uid === user.uid ? ' (You)' : ''}</Text>
                      </View>
                    )) : <Text style={styles.modalDescription}>Nobody has joined yet. Be the first!</Text>}
                </View>
                <Pressable onPress={() => handleJoin(activities.find((item) => item.id === selectedEvent.id) || selectedEvent)}
                  disabled={busyActivity === selectedEvent.id}
                  style={[styles.createButton, joined.includes(selectedEvent.id) && { backgroundColor: C.green }]}>
                  {busyActivity === selectedEvent.id ? <ActivityIndicator color={C.white} /> : <Icon name={joined.includes(selectedEvent.id) ? 'check' : 'plus'} size={21} color={C.white} />}
                  <Text style={styles.createButtonText}>{busyActivity === selectedEvent.id ? 'Updating...' : joined.includes(selectedEvent.id) ? 'Joined - Tap to leave' : (!selectedEvent.demo && capacityFor(activities.find((item) => item.id === selectedEvent.id) || selectedEvent) && Object.keys((activities.find((item) => item.id === selectedEvent.id) || selectedEvent).participants || {}).length >= capacityFor(activities.find((item) => item.id === selectedEvent.id) || selectedEvent) ? 'Activity full' : 'Join this activity')}</Text>
                </Pressable>
              </>}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal visible={editingProfile} animationType="slide" transparent
          onRequestClose={() => { if (!savingProfile) setEditingProfile(false) }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={{ maxHeight: '85%' }} keyboardShouldPersistTaps="handled">
                  <View style={styles.modalTop}>
                    <Text style={styles.modalHeading}>Edit profile</Text>
                    <Pressable disabled={savingProfile} onPress={() => setEditingProfile(false)} style={styles.modalClose}>
                      <Icon name="close" size={21} color={C.navy} />
                    </Pressable>
                  </View>
                  <Text style={[styles.inputLabel, { marginTop: 22 }]}>Name</Text>
                  <TextInput style={styles.formInput} value={profileName} onChangeText={setProfileName} maxLength={80} />
                  <Text style={styles.inputLabel}>University</Text>
                  <TextInput style={styles.formInput} value={profileUniversity} onChangeText={setProfileUniversity}
                    placeholder="e.g. University of North Texas" maxLength={100} />
                  <Text style={styles.inputLabel}>Major</Text>
                  <TextInput style={styles.formInput} value={profileMajor} onChangeText={setProfileMajor}
                    placeholder="e.g. Computer Science" maxLength={100} />
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput style={[styles.formInput, styles.multilineInput]} value={profileBio}
                    onChangeText={setProfileBio} placeholder="A little about you..." maxLength={300}
                    multiline textAlignVertical="top" />
                  {!!profileError && <Text style={styles.formError}>{profileError}</Text>}
                  <Pressable disabled={savingProfile} onPress={saveProfile}
                    style={[styles.createButton, savingProfile && { opacity: 0.6 }]}>
                    <Text style={styles.createButtonText}>{savingProfile ? 'Saving...' : 'Save profile'}</Text>
                  </Pressable>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
        <Modal visible={!!editingEvent} animationType="slide" transparent onRequestClose={() => { if (!savingEdit) setEditingEvent(null) }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={{ maxHeight: '87%' }} keyboardShouldPersistTaps="handled">
                  <View style={styles.modalTop}>
                    <Text style={styles.modalHeading}>Edit activity</Text>
                    <Pressable disabled={savingEdit} onPress={() => setEditingEvent(null)} style={styles.modalClose}>
                      <Icon name="close" size={21} color={C.navy} />
                    </Pressable>
                  </View>
                  <Text style={[styles.inputLabel, { marginTop: 20 }]}>Title</Text>
                  <TextInput style={styles.formInput} value={editTitle} onChangeText={setEditTitle} maxLength={80} />
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.createCategories}>
                    {categories.slice(1).map((item) => <Pressable key={item} onPress={() => setEditCategory(item)}
                      style={[styles.createCategory, editCategory === item && styles.createCategorySelected]}>
                      <Text style={[styles.createCategoryText, editCategory === item && styles.createCategoryTextSelected]}>{item}</Text>
                    </Pressable>)}
                  </View>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput style={styles.formInput} value={editLocation} onChangeText={setEditLocation} maxLength={90} />
                  <Text style={styles.inputLabel}>Date and time</Text>
                  <Text style={styles.dateValue}>{dateLabel(editDate)}</Text>
                  <View style={styles.dateActions}>
                    <Pressable style={styles.dateButton} onPress={() => setEditPicker('date')}><Text style={styles.dateButtonText}>Choose date</Text></Pressable>
                    <Pressable style={styles.dateButton} onPress={() => setEditPicker('time')}><Text style={styles.dateButtonText}>Choose time</Text></Pressable>
                  </View>
                  {!!editPicker && <DateTimePicker value={editDate} mode={editPicker} display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={editPicker === 'date' ? new Date() : undefined}
                    onChange={(event, chosen) => {
                      if (Platform.OS !== 'ios') setEditPicker(null)
                      if (event.type === 'dismissed' || !chosen) return
                      setEditDate((previous) => {
                        const next = new Date(previous)
                        if (editPicker === 'date') next.setFullYear(chosen.getFullYear(), chosen.getMonth(), chosen.getDate())
                        else next.setHours(chosen.getHours(), chosen.getMinutes(), 0, 0)
                        return next
                      })
                    }} />}
                  {Platform.OS === 'ios' && !!editPicker && <Pressable style={styles.dateDone} onPress={() => setEditPicker(null)}><Text style={styles.dateButtonText}>Done</Text></Pressable>}
                  <Text style={styles.inputLabel}>Maximum participants (1-100)</Text>
                  <TextInput style={styles.formInput} value={editCapacity} onChangeText={setEditCapacity}
                    keyboardType="number-pad" maxLength={3} />
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput style={[styles.formInput, styles.multilineInput]} value={editDescription}
                    onChangeText={setEditDescription} maxLength={400} multiline textAlignVertical="top" />
                  {!!editError && <Text style={styles.formError}>{editError}</Text>}
                  <Pressable disabled={savingEdit} onPress={saveEdit} style={[styles.createButton, savingEdit && { opacity: 0.6 }]}>
                    <Text style={styles.createButtonText}>{savingEdit ? 'Saving...' : 'Save changes'}</Text>
                  </Pressable>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingNotice: { paddingVertical: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 11 },
  loadingNoticeText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: C.gray },
  loadProblem: { backgroundColor: '#FFF1F2', padding: 15, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: '#F4C6CC' },
  loadProblemText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#9A2638', lineHeight: 19 },
  retryButton: { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9, marginTop: 11 },
  retryText: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  dateValue: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: C.navy, marginBottom: 12 },
  dateActions: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  dateButton: { flex: 1, backgroundColor: '#E5EEFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  dateDone: { alignItems: 'center', marginBottom: 16, paddingVertical: 10 },
  dateButtonText: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  capacityCard: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.green, marginTop: 7 },
  capacitySummary: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: C.blue, marginTop: 18 },
  profileDetail: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: C.gray, marginTop: 7 },
  profileBio: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: C.navy, lineHeight: 19, textAlign: 'center', marginTop: 12, paddingHorizontal: 24 },
  editProfileButton: { marginTop: 18, backgroundColor: '#E5EEFF', paddingHorizontal: 25, paddingVertical: 11, borderRadius: 12 },
  editProfileText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: C.blue },
  ownerActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  ownerEditButton: { flex: 1, backgroundColor: '#E5EEFF', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  ownerEditText: { fontFamily: 'PlusJakartaSans_700Bold', color: C.blue, fontSize: 12 },
  ownerDeleteButton: { backgroundColor: '#FFF0F1', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 12 },
  ownerDeleteText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#C43E53', fontSize: 12 },
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
  pageContent: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 38, flexGrow: 1 },
  greetingBlock: { marginHorizontal: 2, marginBottom: 23 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', color: C.blue, letterSpacing: 1.6, fontSize: 10, marginBottom: 7 },
  greeting: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 30, color: C.navy, letterSpacing: -1.1 },
  greetingSub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: C.gray, marginTop: 9, lineHeight: 21 },
  storiesScroll: { marginHorizontal: -17, marginBottom: 22 },
  storiesRow: { paddingHorizontal: 17, gap: 15 },
  story: { alignItems: 'center', width: 65 },
  storyRing: { borderWidth: 2, borderRadius: 40, width: 61, height: 61, padding: 3, alignItems: 'center', justifyContent: 'center' },
  storyCircle: { width: '100%', height: '100%', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  storyText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.navy, fontSize: 10, marginTop: 7 },
  featuredBanner: { backgroundColor: C.navy, minHeight: 183, borderRadius: 24, marginBottom: 30, overflow: 'hidden', padding: 23, justifyContent: 'center', elevation: 3, shadowColor: C.navy, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  featuredCircle: { position: 'absolute', right: -60, top: -67, width: 190, height: 190, borderRadius: 95, borderWidth: 36, borderColor: '#1F61D1', opacity: 0.65 },
  featuredCircleSmall: { position: 'absolute', right: 30, bottom: -43, height: 90, width: 90, borderRadius: 45, backgroundColor: '#4266B7', opacity: 0.52 },
  featuredCopy: { alignItems: 'flex-start' },
  featuredKicker: { fontFamily: 'PlusJakartaSans_700Bold', color: '#A7CBFF', fontSize: 9, letterSpacing: 1.3, marginBottom: 7 },
  featuredTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.white, fontSize: 22, lineHeight: 30, letterSpacing: -0.7 },
  featuredLink: { backgroundColor: C.white, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  featuredLinkText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.blue },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.navy, fontSize: 23, letterSpacing: -0.7 },
  sectionCaption: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 19, marginTop: 4 },
  seeAll: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: C.blue },
  eventCard: { backgroundColor: C.white, borderRadius: 23, overflow: 'hidden', borderWidth: 1, borderColor: '#E2EAF5', marginBottom: 20, elevation: 4, shadowColor: C.navy, shadowOpacity: 0.09, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  eventTop: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  hostAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  hostTextBox: { flex: 1, marginLeft: 10 },
  hostName: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12 },
  hostSubtitle: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 10, marginTop: 2 },
  iconButton: { padding: 7 },
  eventArtwork: { height: 155, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artCircleLarge: { position: 'absolute', width: 205, height: 205, borderRadius: 103, right: -50, top: -67, borderWidth: 40, opacity: 0.12 },
  artCircleSmall: { position: 'absolute', width: 77, height: 77, borderRadius: 39, bottom: -32, left: 30, opacity: 0.12 },
  eventArtIcon: { width: 75, height: 75, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowOpacity: 0.12, shadowRadius: 6 },
  artTag: { position: 'absolute', bottom: 12, left: 13, backgroundColor: C.white, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  artTagText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  eventBody: { paddingHorizontal: 16, paddingBottom: 19 },
  eventActions: { flexDirection: 'row', alignItems: 'center', paddingTop: 14, paddingBottom: 11, gap: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  actionLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: C.navy },
  miniJoinButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.blue, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 13, gap: 5, minHeight: 40 },
  miniJoinedButton: { backgroundColor: '#E1F7EB' },
  miniJoinText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.white },
  eventTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: C.navy, marginTop: 6, letterSpacing: -0.35 },
  eventDescription: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 20, marginTop: 9, marginBottom: 11 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  metaText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: C.gray, flexShrink: 1 },
  demoNote: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: '#95A2B4', textAlign: 'center', marginVertical: 14 },
  innerHeader: { marginHorizontal: 3, marginBottom: 21 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: '#CFDBEC', borderRadius: 17, paddingHorizontal: 15, height: 56, gap: 10, elevation: 1 },
  searchInput: { flex: 1, color: C.navy, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 },
  filterHeading: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12, marginTop: 5 },
  filterAvailabilityRow: { flexDirection: 'row', gap: 9, marginTop: 12, marginBottom: 18 },
  filterResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetFilters: { color: C.blue, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, marginBottom: 13 },
  filtersScroll: { marginHorizontal: -17, marginTop: 18, marginBottom: 15 },
  filtersRow: { paddingHorizontal: 17, gap: 9 },
  categoryPill: { borderRadius: 23, paddingHorizontal: 17, paddingVertical: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  categoryPillSelected: { borderColor: C.blue, backgroundColor: C.blue },
  categoryPillText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.gray, fontSize: 11 },
  categoryPillTextSelected: { color: C.white },
  resultLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12, marginBottom: 13, marginLeft: 2 },
  bottomBar: { backgroundColor: C.white, borderTopColor: C.lightGray, borderTopWidth: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 9, minHeight: 73, justifyContent: 'space-around' },
  navItem: { width: '20%', alignItems: 'center', justifyContent: 'center', gap: 5 },
  navCreate: { backgroundColor: C.blue, borderRadius: 15, height: 40, width: 45, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: '#174795', elevation: 3 },
  navLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, color: '#8A9AAF' },
  navLabelActive: { color: C.blue },
  emptyState: { backgroundColor: C.white, borderRadius: 22, borderWidth: 1, borderColor: C.border, padding: 30, alignItems: 'center', marginTop: 9 },
  emptyIcon: { backgroundColor: '#E7EFFF', borderRadius: 26, width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 16, marginTop: 15, textAlign: 'center' },
  emptyDescription: { fontFamily: 'PlusJakartaSans_400Regular', color: C.gray, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  emptyAction: { marginTop: 19, backgroundColor: C.blue, paddingHorizontal: 17, paddingVertical: 12, borderRadius: 11 },
  emptyActionText: { fontFamily: 'PlusJakartaSans_700Bold', color: C.white, fontSize: 12 },
  createCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 23, padding: 22, elevation: 2, shadowColor: C.navy, shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  inputLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: C.navy, fontSize: 12, marginBottom: 9 },
  formInput: { borderRadius: 14, borderWidth: 1, borderColor: '#D3DFEE', backgroundColor: '#FAFCFF', padding: 15, fontFamily: 'PlusJakartaSans_500Medium', color: C.navy, fontSize: 13, marginBottom: 20, minHeight: 53 },
  multilineInput: { minHeight: 115 },
  createCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 21 },
  createCategory: { borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9 },
  createCategorySelected: { backgroundColor: '#E5EEFF', borderColor: C.blue },
  createCategoryText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: C.gray },
  createCategoryTextSelected: { color: C.blue },
  createButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, backgroundColor: C.blue, minHeight: 54, borderRadius: 14, borderBottomWidth: 3, borderBottomColor: '#164590', paddingHorizontal: 12 },
  createButtonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: C.white },
  createNote: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 17, color: C.gray, marginTop: 14 },
  formError: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#C43E53', marginBottom: 13 },
  activityTabs: { flexDirection: 'row', padding: 5, backgroundColor: '#E5ECF6', borderRadius: 15, marginBottom: 22 },
  activityTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 },
  activityTabSelected: { backgroundColor: C.white, elevation: 2 },
  activityTabText: { fontFamily: 'PlusJakartaSans_600SemiBold', color: C.gray, fontSize: 12 },
  activityTabTextSelected: { color: C.blue },
  profileTop: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 24, paddingTop: 27, alignItems: 'center', overflow: 'hidden', elevation: 2 },
  profileAvatar: { backgroundColor: C.blue, width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#E5EEFF' },
  profileInitial: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: C.white, fontSize: 29 },
  profileName: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 19, color: C.navy, marginTop: 13 },
  profileEmail: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: C.gray, marginTop: 5 },
  profileStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.lightGray, marginTop: 22, width: '100%', paddingVertical: 17, justifyContent: 'space-evenly', alignItems: 'center' },
  profileStat: { alignItems: 'center', flex: 1 },
  statNumber: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: C.navy },
  statLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: C.gray, marginTop: 3 },
  statDivider: { backgroundColor: C.lightGray, height: 28, width: 1 },
  profileActions: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 19, marginTop: 22, overflow: 'hidden' },
  profileAction: { paddingVertical: 19, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: C.lightGray, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileActionText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: C.navy },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,21,42,0.42)' },
  modalSheet: { backgroundColor: C.white, padding: 24, paddingBottom: 38, borderTopLeftRadius: 29, borderTopRightRadius: 29 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalHeading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: C.gray },
  modalClose: { padding: 5 },
  modalCategory: { backgroundColor: '#E5EEFF', alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, marginTop: 20 },
  modalCategoryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: C.blue },
  modalEventTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 23, color: C.navy, marginTop: 13 },
  modalDescription: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 22, color: C.gray, marginVertical: 13 },
  modalInfo: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 12 },
  modalInfoText: { flex: 1, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: C.navy },
  participantsBlock: { marginTop: 22, marginBottom: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: C.border },
  participantsHeading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: C.navy, marginBottom: 12 },
  participantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  participantAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5EEFF', alignItems: 'center', justifyContent: 'center' },
  participantInitial: { fontFamily: 'PlusJakartaSans_700Bold', color: C.blue },
  participantName: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: C.navy },
})
