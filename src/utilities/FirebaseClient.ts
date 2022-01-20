import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/database';

export default class FirebaseClient {
  constructor() {

    const REACT_APP_FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
    const REACT_APP_FIREBASE_AUTH_DOMAIN = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    const REACT_APP_FIREBASE_DATABASE_URL = process.env.REACT_APP_FIREBASE_DATABASE_URL;
    const REACT_APP_FIREBASE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
    const REACT_APP_FIREBASE_STORAGE_BUCKET = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
    const REACT_APP_FIREBASE_MESSAGING_SENDER_ID = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
    const REACT_APP_FIREBASE_APP_ID = process.env.REACT_APP_FIREBASE_APP_ID;
    const USE_FIREBASE_EMULATOR = process.env.USE_FIREBASE_EMULATOR;

    const isEmulator = () => {
      return !!(USE_FIREBASE_EMULATOR && USE_FIREBASE_EMULATOR === 'true')
    }

    const firebaseConfig = {
      apiKey: REACT_APP_FIREBASE_API_KEY,
      authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: REACT_APP_FIREBASE_DATABASE_URL,
      projectId: REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: REACT_APP_FIREBASE_APP_ID,
    };
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    this.auth = firebase.auth()
    this.firestore = firebase.firestore()
    this.functions = firebase.functions()
    this.database = firebase.database()
    if (isEmulator()) {
      this.auth.useEmulator('http://localhost:9099')
      this.firestore.useEmulator('localhost', 8080)
      this.functions.useEmulator('localhost', 5001)
      this.database.useEmulator('localhost', 9000)
    }
  }

}
