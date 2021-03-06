ð nextjs-webrtc-firebase
====

![GitHub issues](https://img.shields.io/github/issues/isystk/nextjs-webrtc-firebase)
![GitHub forks](https://img.shields.io/github/forks/isystk/nextjs-webrtc-firebase)
![GitHub stars](https://img.shields.io/github/stars/isystk/nextjs-webrtc-firebase)
![GitHub license](https://img.shields.io/github/license/isystk/nextjs-webrtc-firebase)

## ð ãã­ã¸ã§ã¯ãã®æ¦è¦

Next.js & Web-RTC ã®å­¦ç¿ç¨ã¢ããªã±ã¼ã·ã§ã³ã§ããFirebaseãå©ç¨ãã¦ãããªéè©±ãç»é¢å±æããã£ããæ©è½ãé²ç»æ©è½ãããã¤ã¹é¸æ ãªã©ã®æ©è½ãä½æãã¾ããã

## P2P éä¿¡ ãç¢ºç«ããã¾ã§ã®å¦çã®æµã

```
1. Aãããã«ã¼ã ã«å¥ã£ãããã­ã¼ãã­ã£ã¹ãã§ãã¹ã¦ã®ã¡ã³ãã¼ã«joinãéä¿¡ãã
2. BãããAããããjoinãåä¿¡ãããBããã¯Aããã«acceptãéä¿¡ãã
    2-1. joinãåä¿¡ãã¦æ°ã¡ã³ãã¼ã®æå ±ãã­ã¼ã«ã«ã«ç»é²ãã
    2-2. acceptãéä¿¡ãã
3. AãããBããããacceptãåä¿¡ãããAããã¯Bããã«offerãéä¿¡ãã
    3-1. acceptãåä¿¡ãã¦æ¢å­ã¡ã³ãã¼ã®æå ±ãã­ã¼ã«ã«ã«ç»é²ãã
    3-2. éä¿¡çµè·¯ãã·ã°ããªã³ã°ãµã¼ãã¼ã«éä¿¡ã§ããããã«ã¤ãã³ããã³ãã©ãç»é²ãã
    3-3. P2Pç¢ºç«å¾ãéä¿¡ç¸æã®ã¡ãã£ã¢ã¹ããªã¼ã æå ±ã®åä¿¡å¾ãè¡¨ç¤ºåã®DOMãç»é²ãã¦ãã
    3-4. SDP(offer)ãä½æãã
    3-5. ä½æããSDP(offer)ãä¿å­ãã
    3-6. SDP(offer)ãéä¿¡ãã
4. AãããBããããofferãåä¿¡ãããAããã¯Bããã«answerãéä¿¡ãã
    4-1. æ°ã¡ã³ãã¼ããofferãåä¿¡ãã
    4-2. éä¿¡çµè·¯ãã·ã°ããªã³ã°ãµã¼ãã¼ã«éä¿¡ã§ããããã«ã¤ãã³ããã³ãã©ãç»é²ãã
    4-3. P2Pç¢ºç«å¾ãéä¿¡ç¸æã®ã¡ãã£ã¢ã¹ããªã¼ã æå ±ã®åä¿¡å¾ãè¡¨ç¤ºåã®DOMãç»é²ãã¦ãã
    4-4. åä¿¡ããç¸æã®SDP(offer)ãä¿å­ãã
    4-5. SDP(answer)ãä½æãã
    4-6. ä½æããSDP(answer)ãä¿å­ãã
    4-7. SDP(answer)ãéä¿¡ãã
5. BãããAããããanswerãåä¿¡ãããBããã¯Aããã®SDP(answer)ãä¿å­ãã
    5-1. æ¢å­ã¡ã³ãã¼ããanswerãåä¿¡ãã
    5-2. åä¿¡ããç¸æã®SDP(answer)ãä¿å­ãã
6. ã·ã°ããªã³ã°ãµã¼ãã¼çµç±ã§candidateãåä¿¡ããç¸æã®éä¿¡çµè·¯(candidate)ãè¿½å ãã
    6-1. AãããBããã¯ã·ã°ããªã³ã°ãµã¼ãã¼ããcandidateãåä¿¡ãã
    6-2. åä¿¡ããç¸æã®éä¿¡çµè·¯(candidate)ãä¿å­ãã
```

## MediaDevices

##### getUserMedia()

è¦æ±ãããç¨®é¡ã®ã¡ãã£ã¢ãå«ããã©ãã¯ãæã¤ `MediaStream` ãçæããã¡ãã£ã¢å¥åãä½¿ç¨ããè¨±å¯ãã¦ã¼ã¶ã¼ã«æ±ãã¾ãã
```
ã«ã¡ã©
navigator.mediaDevices.getUserMedia({ audio: true, video: true })

ç»é¢å±æ
navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
```

ã¡ãã£ã¢ã¹ããªã¼ã ãVideoã¿ã°ã«æ¸ãåºã
```
const videoRef = document.querySelector(`#video-xxxx`)
videoRef.srcObject = mediaStream
```

## ð Demo

https://nextjs-webrtc-firebase.web.app

![æç¨¿ç»é¢](./app.png "æç¨¿ç»é¢")


## ð¦ ãã£ã¬ã¯ããªæ§é 

```
.
âââ docker/
â   âââ apache/ (Webãµã¼ãã¼)
â   â   âââ Dockerfile
â   âââ app/ (Node.js ãDockerã§åä½ããããå ´åã«å©ç¨ãã)
â   â   âââ Dockerfile
â   âââ firebase/ (Firebase ã®ã¨ãã¥ã¬ã¼ã¿)
â       âââ Dockerfile
â       âââ src
â           âââ functions (Cloud functions ã®ã½ã¼ã¹ã³ã¼ã)
âââ src/ (Next.js ã®ã½ã¼ã¹ã³ã¼ã)
â   âââ @types/
â   âââ common/
â   âââ components/
â   âââ pages/
â   âââ store/
â   âââ styles/
â   âââ utilities/
âââ test/
âââ dc.sh ï¼Dockerã®èµ·åç¨ã¹ã¯ãªããï¼
```

## ðï¸ Docker æä½ç¨ã·ã§ã«ã¹ã¯ãªããã®ä½¿ãæ¹

```
Usage:
  dc.sh [command] [<options>]

Options:
  stats|st                 Dockerã³ã³ããã®ç¶æãè¡¨ç¤ºãã¾ãã
  init                     Dockerã³ã³ããã»ã¤ã¡ã¼ã¸ã»çæãã¡ã¤ã«ã®ç¶æãåæåãã¾ãã
  start                    ãã¹ã¦ã®Daemonãèµ·åãã¾ãã
  stop                     ãã¹ã¦ã®Daemonãåæ­¢ãã¾ãã
  firebase login           Firebase ã«ã­ã°ã¤ã³ãã¾ãã
  firebase start           Firebase ã®ã¨ãã¥ã¬ã¼ã¿ãèµ·åãã¾ãã
  firebase build           Cloud Functions ããã«ããã¾ãã
  firebase deploy          Firebase ã«ããã­ã¤ãã¾ãã
  --version, -v     ãã¼ã¸ã§ã³ãè¡¨ç¤ºãã¾ãã
  --help, -h        ãã«ããè¡¨ç¤ºãã¾ãã
```


## ð¬ ä½¿ãæ¹

```
$ node -v
v17.9.0

# ä¸æºå
$ ./dc.sh init
$ cp .env.example .env

# Dockerãèµ·åãã
$ ./dc.sh start

# ååã®ã¿Firebaseã®ã»ããã¢ãã
./dc.sh firebase login
./dc.sh firebase init

# Firebaseã¨ãã¥ã¬ã¼ã¿ãèµ·åãã¾ãã
$ ./dc.sh firebase start
$ open http://localhost:4000

# Cloud Functions ããã«ããã¾ãã
docker-compose -f docker/docker-compose.yml exec firebase sh
cd ./functions
yarn
yarn build

# æç¨¿ãã¼ã¿ãPOST
curl -X POST -H "Content-Type: application/json" -d @post.json http://localhost:5001/nextjs-typescript-firestore/us-central1/api/posts
# æç¨¿ãã¼ã¿ã®ä¸è¦§ãåå¾ãã
curl http://localhost:5001/nextjs-typescript-firestore/us-central1/api/posts

# Next.jsã¢ããªãèµ·åãã¾ãã
./dc.sh app install
./dc.sh app dev
$ open http://localhost:3000

# Dockerãåæ­¢ããå ´å
$ ./dc.sh stop
```

## ð¨ åè

| ãã­ã¸ã§ã¯ã| æ¦è¦|
| :---------------------------------------| :-------------------------------|
| [RTCPeerConnection](https://developer.mozilla.org/ja/docs/Web/API/RTCPeerConnection)| RTCPeerConnection |
| [STUNTMAN](http://www.stunprotocol.org/)| Public STUN server |
| [Material Icons](https://v4.mui.com/components/material-icons/)| Material Icons |



## ð« Licence

[MIT](https://github.com/isystk/nextjs-webrtc-firebase/blob/master/LICENSE)

## ð Author

[isystk](https://github.com/isystk)

