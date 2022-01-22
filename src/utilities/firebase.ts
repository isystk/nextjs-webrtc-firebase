import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/database'

const isEmulator = () => {
  const useEmulator = process.env.USE_FIREBASE_EMULATOR
  return !!(useEmulator && useEmulator === 'true')
}

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
}

export const getApp = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)

    if (isEmulator()) {
      firebase.auth().useEmulator('http://localhost:9099')
      firebase.firestore().useEmulator('localhost', 8080)
      firebase.functions().useEmulator('localhost', 5001)
      firebase.database().useEmulator('localhost', 9000)
    }
  } else {
    firebase.app()
  }

  return firebase
}

export const getAuth = () => {
  return getApp().auth()
}

export const getFirestore = () => {
  return getApp().firestore()
}

export const getFunctions = () => {
  return getApp().functions()
}

export const getDatabase = (path: string) => {
  const databaseRoot = 'app/multi/'
  return getApp()
    .database()
    .ref(databaseRoot + path)
}
