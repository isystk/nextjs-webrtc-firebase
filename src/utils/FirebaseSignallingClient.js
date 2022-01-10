import firebase from 'firebase/app';
import 'firebase/database';

export default class FirebaseSignallingClient {
  constructor() {
    const {
      REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_DATABASE_URL,
      REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_STORAGE_BUCKET,
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      REACT_APP_FIREBASE_APP_ID,
    } = process.env;

    const firebaseConfig = {
      apiKey: REACT_APP_FIREBASE_API_KEY,
      authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: REACT_APP_FIREBASE_DATABASE_URL,
      projectId: REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: REACT_APP_FIREBASE_APP_ID,
    };
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);
    this.database = firebase.database();
    this.localPeerName = '';
    this.remotePeerName = '';
  }

  setPeerNames(localPeerName, remotePeerName) {
    this.localPeerName = localPeerName;
    this.remotePeerName = remotePeerName;
  }

  get targetRef() {
    return this.database.ref(this.remotePeerName);
  }

  async sendOffer(sessionDescription) {
    await this.targetRef.set({
      type: 'offer',
      sender: this.localPeerName,
      sessionDescription,
    });
  }

  async sendAnswer(sessionDescription) {
    await this.targetRef.set({
      type: 'answer',
      sender: this.localPeerName,
      sessionDescription,
    });
  }

  async sendCandidate(candidate) {
    await this.targetRef.set({
      type: 'candidate',
      sender: this.localPeerName,
      candidate,
    });
  }

  async remove(path) {
    await this.database.ref(path).remove();
  }
}
