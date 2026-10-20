
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDxysddQv18SEg5R_fceaKbYfdlR-dO974',
  authDomain: 'campuslink-1c635.firebaseapp.com',
  projectId: 'campuslink-1c635',
  storageBucket: 'campuslink-1c635.firebasestorage.app',
  messagingSenderId: '273300494723',
  appId: '1:273300494723:web:f15a2b0a8bd01f18c9feb6',
  measurementId: 'G-R1E5LD1RTB',
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp()

let auth

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app)
  } else {
    throw error
  }
}

const db = getFirestore(app)

export { auth, db }
export default app
