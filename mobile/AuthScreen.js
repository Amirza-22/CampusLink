import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebaseConfig'

const colors = {
  navy: '#0E1F38',
  blue: '#1F61D1',
  green: '#1F9E61',
  background: '#F2F7FF',
  white: '#FFFFFF',
  gray: '#64748B',
  border: '#DCE6F4',
}

function CampusLogo() {
  return (
    <View style={styles.logoBox}>
      <Svg width={88} height={88} viewBox="0 0 100 100">
        <Path
          d="M72 19 A37 37 0 1 0 72 81"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={15}
          strokeLinecap="round"
        />
        <Path
          d="M58 37 V74 H82"
          fill="none"
          stroke="#BBDFFF"
          strokeWidth={13}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={79} cy={20} r={9} fill="#78C9FF" />
      </Svg>
    </View>
  )
}

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  const [viewHeight, setViewHeight] = useState(0)
  const [brandY, setBrandY] = useState(null)
  const [introDone, setIntroDone] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [focused, setFocused] = useState('')

  const started = useRef(false)
  const brandYAnimation = useRef(new Animated.Value(0)).current
  const brandScale = useRef(new Animated.Value(1.45)).current
  const brandOpacity = useRef(new Animated.Value(0)).current
  const splashOpacity = useRef(new Animated.Value(1)).current
  const darkNameOpacity = useRef(new Animated.Value(0)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const contentY = useRef(new Animated.Value(42)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!fontsLoaded || !viewHeight || brandY === null || started.current) {
      return
    }

    started.current = true

    // The real logo is inside ScrollView, so it will scroll with the form.
    // Move it from screen center to its natural layout position.
    const logoCenterAtRest = brandY + 56
    const initialOffset = viewHeight / 2 - logoCenterAtRest
    brandYAnimation.setValue(initialOffset)
    brandScale.setValue(1.45)
    brandOpacity.setValue(1)

    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(brandYAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(520),
          Animated.timing(darkNameOpacity, {
            toValue: 1,
            duration: 480,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setIntroDone(true)
    })
  }, [fontsLoaded, viewHeight, brandY])

  function switchMode(login) {
    if (loading) return
    setIsLogin(login)
    setPassword('')
    setShowPassword(false)
    setErrorMessage('')
    Keyboard.dismiss()
  }

  function animateButton(value) {
    Animated.spring(buttonScale, {
      toValue: value,
      useNativeDriver: true,
      speed: 28,
      bounciness: value === 1 ? 6 : 0,
    }).start()
  }

  async function handleSubmit() {
    if (loading) return
    Keyboard.dismiss()
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()
    if (!isLogin && !name.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter your email and password.')
      return
    }
    if (!isLogin && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, cleanEmail, password)
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        )
        try {
          await updateProfile(result.user, { displayName: name.trim() })
        } catch (profileError) {
          console.log('Profile update:', profileError.code)
        }
      }
    } catch (error) {
      console.log('Firebase authentication:', error.code, error.message)
      const messages = {
        'auth/email-already-in-use': 'This email already has an account. Try signing in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Please use a stronger password.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'Incorrect email or password.',
        'auth/wrong-password': 'Incorrect email or password.',
        'auth/network-request-failed': 'Check your internet connection.',
        'auth/operation-not-allowed': 'Email/Password sign-in is disabled in Firebase.',
        'auth/api-key-not-valid': 'The Firebase API key is incorrect. Check firebaseConfig.js.',
        'auth/invalid-api-key': 'The Firebase API key is incorrect. Check firebaseConfig.js.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      }
      setErrorMessage(messages[error.code] || `Sign-in error: ${error.code || 'unknown'}`)
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    setErrorMessage('')
    if (!email.trim()) {
      setErrorMessage('Enter your email address first.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      Alert.alert('Check your inbox', 'If an account exists, a reset email will be sent.')
    } catch (error) {
      setErrorMessage(
        error.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : `Could not send reset email: ${error.code || 'unknown error'}`
      )
    }
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
      onLayout={(event) => {
        if (!started.current) {
          setViewHeight(event.nativeEvent.layout.height)
        }
      }}
    >
      <StatusBar
        barStyle={introDone ? 'dark-content' : 'light-content'}
        backgroundColor={introDone ? colors.background : colors.navy}
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.splash, { opacity: splashOpacity }]}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={introDone}
        >
          <Animated.View
            onLayout={(event) => {
              if (!started.current) {
                setBrandY(event.nativeEvent.layout.y)
              }
            }}
            style={[
              styles.brand,
              {
                opacity: brandOpacity,
                transform: [
                  { translateY: brandYAnimation },
                  { scale: brandScale },
                ],
              },
            ]}
          >
            <CampusLogo />
            <View style={styles.nameStack}>
              <Text style={[styles.appName, styles.whiteName]}>CampusLink</Text>
              <Animated.Text
                style={[styles.appName, styles.navyName, { opacity: darkNameOpacity }]}
              >
                CampusLink
              </Animated.Text>
            </View>
            <Animated.Text style={[styles.tagline, { opacity: darkNameOpacity }]}>
              Your campus. Your community.
            </Animated.Text>
          </Animated.View>

          <Animated.View
            pointerEvents={introDone ? 'auto' : 'none'}
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            }}
          >
            <View style={styles.welcome}>
              <Text style={styles.welcomeTitle}>
                {isLogin ? 'Welcome back' : 'Welcome to CampusLink'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isLogin
                  ? 'Sign in to connect with your campus.'
                  : 'Create your account and find your people.'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tabs}>
                <Pressable
                  style={[styles.tab, isLogin && styles.activeTab]}
                  onPress={() => switchMode(true)}
                  disabled={loading}
                >
                  <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                    Sign In
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, !isLogin && styles.activeTab]}
                  onPress={() => switchMode(false)}
                  disabled={loading}
                >
                  <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </Pressable>
              </View>

              {!isLogin && (
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={[styles.inputBox, focused === 'name' && styles.focused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoComplete="name"
                      maxLength={60}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused('')}
                    />
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputBox, focused === 'email' && styles.focused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="name@university.edu"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <View style={styles.passwordRow}>
                  <Text style={styles.label}>Password</Text>
                  {isLogin && (
                    <Pressable onPress={resetPassword}>
                      <Text style={styles.forgot}>Forgot password?</Text>
                    </Pressable>
                  )}
                </View>
                <View style={[styles.inputBox, focused === 'password' && styles.focused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles.showText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>
                {!isLogin && (
                  <Text
                    style={[
                      styles.passwordHint,
                      password.length >= 6 && styles.passwordValid,
                    ]}
                  >
                    {password.length >= 6 ? '✓ ' : '• '}Minimum 6 characters
                  </Text>
                )}
              </View>

              {!!errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.submit,
                    pressed && styles.submitPressed,
                    loading && styles.disabled,
                  ]}
                  onPress={handleSubmit}
                  onPressIn={() => animateButton(0.97)}
                  onPressOut={() => animateButton(1)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.submitText}>
                      {isLogin ? 'Sign In' : 'Create Account'}  →
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <Pressable onPress={() => switchMode(!isLogin)} disabled={loading}>
                  <Text style={styles.switchLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.footer}>Connect. Discover. Belong.</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingScreen: {
    flex: 1, backgroundColor: colors.navy,
    justifyContent: 'center', alignItems: 'center',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.navy,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    flexGrow: 1, paddingHorizontal: 24, paddingTop: 42, paddingBottom: 40,
  },
  brand: { alignItems: 'center', marginBottom: 38 },
  logoBox: {
    width: 112, height: 112, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.blue,
    shadowColor: '#103A85', shadowOpacity: 0.22,
    shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 9,
  },
  nameStack: {
    width: '100%', height: 43, marginTop: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 31, letterSpacing: -1.4, textAlign: 'center',
  },
  whiteName: { color: colors.white, position: 'absolute' },
  navyName: { color: colors.navy, position: 'absolute' },
  tagline: {
    fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12,
    color: colors.gray, marginTop: 5, textAlign: 'center',
  },
  welcome: { alignItems: 'center', marginBottom: 26 },
  welcomeTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 25,
    color: colors.navy, letterSpacing: -0.8, textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12,
    color: colors.gray, marginTop: 9, textAlign: 'center', lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white, borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07, shadowRadius: 14, elevation: 4,
  },
  tabs: {
    flexDirection: 'row', backgroundColor: '#EEF3FA',
    borderRadius: 13, padding: 5, marginBottom: 24,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10,
  },
  activeTab: {
    backgroundColor: colors.white, elevation: 3,
    shadowColor: colors.navy, shadowOpacity: 0.08, shadowRadius: 5,
  },
  tabText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13, color: colors.gray,
  },
  activeTabText: { color: colors.blue },
  field: { marginBottom: 19 },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12, color: colors.navy, marginBottom: 9,
  },
  inputBox: {
    backgroundColor: '#FAFCFF', borderWidth: 1.5,
    borderColor: colors.border, borderRadius: 13,
    flexDirection: 'row', alignItems: 'center',
    minHeight: 54, paddingHorizontal: 14,
  },
  focused: { borderColor: colors.blue, backgroundColor: colors.white },
  input: {
    flex: 1, minWidth: 0, paddingVertical: 13,
    color: colors.navy, fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  passwordRow: { flexDirection: 'row', justifyContent: 'space-between' },
  forgot: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11,
    color: colors.blue, marginBottom: 9,
  },
  showButton: { paddingVertical: 12, paddingLeft: 12 },
  showText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: colors.blue,
  },
  passwordHint: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: colors.gray, fontSize: 11, marginTop: 10,
  },
  passwordValid: { color: colors.green },
  errorBox: {
    backgroundColor: '#FFF1F2', borderColor: '#FFE4E6',
    borderWidth: 1, borderRadius: 10, padding: 13, marginBottom: 16,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12,
    lineHeight: 20, color: '#BE123C',
  },
  submit: {
    marginTop: 7, minHeight: 56,
    backgroundColor: colors.blue, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 4, borderBottomColor: '#154494',
    elevation: 7, shadowColor: colors.blue,
    shadowOpacity: 0.27, shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
  },
  submitPressed: { borderBottomWidth: 1, elevation: 2 },
  disabled: { opacity: 0.65 },
  submitText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: colors.white,
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'center',
    flexWrap: 'wrap', marginTop: 26,
  },
  switchText: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: colors.gray,
  },
  switchLink: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: colors.blue,
  },
  footer: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#94A3B8', fontSize: 11,
    textAlign: 'center', letterSpacing: 0.5, marginTop: 30,
  },
})
