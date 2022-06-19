import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/functions'
import 'firebase/compat/database'
import 'firebase/compat/messaging'

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
  messagingVapidKey: process.env.REACT_APP_FIREBASE_MESSAGING_VAPID_KEY,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
}

export const getApp = () => {
  if (!firebase.apps.length) {
    console.log('config', config)

    firebase.initializeApp(config)

    if (isEmulator()) {
      console.log('Use Emulator!!')
      firebase.auth().useEmulator('http://localhost:9099')
      firebase.firestore().useEmulator('localhost', 8080)
      firebase.functions().useEmulator('localhost', 5001)
      firebase.database().useEmulator('localhost', 9000)
    }
    //
    // // this is working
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.addEventListener('message', (event) =>
    //     console.log('event for the service worker', event)
    //   )
    // }
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

export const getMessaging = () => {
  return getApp().messaging()
}
export const getMessagingToken = async () => {
  return await getMessaging()
    // .getToken({ vapidKey: config.messagingVapidKey })
    .getToken()
    .then((currentToken) => {
      console.log('Success!!', currentToken)
      return currentToken
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
      // ...
    })
}

export const getDatabase = (path = '') => {
  const databaseRoot = 'app/multi/'
  return getApp()
    .database()
    .ref(databaseRoot + path)
}
