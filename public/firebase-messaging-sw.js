// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAqRx-RcXMoQfzddGj5Fl-092yabJildGM",
  authDomain: "nextjs-webrtc-firebase.firebaseapp.com",
  databaseURL: "https://nextjs-webrtc-firebase-default-rtdb.firebaseio.com",
  projectId: "nextjs-webrtc-firebase",
  storageBucket: "nextjs-webrtc-firebase.appspot.com",
  messagingSenderId: "419265009864",
  appId: "1:419265009864:web:ea83c5636bf7208e432dfd",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// 通知を受けとると push イベントが呼び出される。
self.addEventListener(
  "push",
  function (event) {
    let message = event.data.json();
    console.log("event:push", message);
    let messageTitle = message.notification.title;
    let messageBody = message.notification.body;
    let tag = "cuppa";

    const notificationPromise = self.registration.showNotification(
      messageTitle,
      {
        icon: "/img/icons/favicon-32x32.png",
        body: messageBody,
        tag: tag,
      }
    );

    event.waitUntil(notificationPromise);
  },
  false
);

// WEBアプリがバックグラウンドの場合にはsetBackGroundMessageHandlerが呼び出される。
messaging.setBackgroundMessageHandler(function (payload) {
  console.log("backgroundMessage");

  return self.registration.showNotification(payload.title, {
    body: payload.body,
  });
});
