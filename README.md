🌙 nextjs-webrtc-firebase
====

![GitHub issues](https://img.shields.io/github/issues/isystk/nextjs-webrtc-firebase)
![GitHub forks](https://img.shields.io/github/forks/isystk/nextjs-webrtc-firebase)
![GitHub stars](https://img.shields.io/github/stars/isystk/nextjs-webrtc-firebase)
![GitHub license](https://img.shields.io/github/license/isystk/nextjs-webrtc-firebase)

## 📗 プロジェクトの概要

Next.js ＆ Firebase の学習用サンプルアプリケーションです。

## P2P 通信 が確立するまでの処理の流れ

```
1. Aさんがルームに入ったらブロードキャストですべてのメンバーにjoinを送信する
2. BさんがAさんからjoinを受信したらBさんはAさんにacceptを送信する
    2-1. joinを受信して新メンバーの情報をローカルに登録する
    2-2. acceptを送信する
3. AさんがBさんからacceptを受信したらAさんはBさんにofferを送信する
    3-1. acceptを受信して既存メンバーの情報をローカルに登録する
    3-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
    3-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
    3-4. SDP(offer)を作成する
    3-5. 作成したSDP(offer)を保存する
    3-6. SDP(offer)を送信する
4. AさんがBさんからofferを受信したらAさんはBさんにanswerを送信する
    4-1. 新メンバーからofferを受信する
    4-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
    4-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
    4-4. 受信した相手のSDP(offer)を保存する
    4-5. SDP(answer)を作成する
    4-6. 作成したSDP(answer)を保存する
    4-7. SDP(answer)を送信する
5. BさんがAさんからanswerを受信したらBさんはAさんのSDP(answer)を保存する
    5-1. 既存メンバーからanswerを受信する
    5-2. 受信した相手のSDP(answer)を保存する
6. シグナリングサーバー経由でcandidateを受信し、相手の通信経路(candidate)を追加する
    6-1. Aさん、Bさんはシグナリングサーバーからcandidateを受信する
    6-2. 受信した相手の通信経路(candidate)を保存する
```

## MediaDevices

##### getUserMedia()

要求された種類のメディアを含むトラックを持つ `MediaStream` を生成するメディア入力を使用する許可をユーザーに求めます。
```
カメラ
navigator.mediaDevices.getUserMedia({ audio: true, video: true })

画面共有
navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
```

メディアストリームをVideoタグに書き出す
```
const videoRef = document.querySelector(`#video-xxxx`)
videoRef.srcObject = mediaStream
```

## 🌐 Demo

https://nextjs-webrtc-firebase.web.app

![投稿画面](./app.png "投稿画面")


## 📦 ディレクトリ構造

```
.
├── docker/
│   ├── apache/ (Webサーバー)
│   │   └── Dockerfile
│   ├── app/ (Node.js をDockerで動作させたい場合に利用する)
│   │   └── Dockerfile
│   └── firebase/ (Firebase のエミュレータ)
│       ├── Dockerfile
│       └── src
│           └── functions (Cloud functions のソースコード)
├── src/ (Next.js のソースコード)
│   ├── @types/
│   ├── common/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── styles/
│   └── utilities/
├── test/
└── dc.sh （Dockerの起動用スクリプト）
```

## 🖊️ Docker 操作用シェルスクリプトの使い方

```
Usage:
  dc.sh [command] [<options>]

Options:
  stats|st                 Dockerコンテナの状態を表示します。
  init                     Dockerコンテナ・イメージ・生成ファイルの状態を初期化します。
  start                    すべてのDaemonを起動します。
  stop                     すべてのDaemonを停止します。
  firebase login           Firebase にログインします。
  firebase start           Firebase のエミュレータを起動します。
  firebase build           Cloud Functions をビルドします。
  firebase deploy          Firebase にデプロイします。
  --version, -v     バージョンを表示します。
  --help, -h        ヘルプを表示します。
```


## 💬 使い方

```
$ node -v
v17.9.0

# 下準備
$ ./dc.sh init
$ cp .env.example .env

# Dockerを起動する
$ ./dc.sh start

# 初回のみFirebaseのセットアップ
./dc.sh firebase login
./dc.sh firebase init

# Firebaseエミュレータを起動します。
$ ./dc.sh firebase start
$ open http://localhost:4000

# Cloud Functions をビルドします。
docker-compose -f docker/docker-compose.yml exec firebase sh
cd ./functions
yarn
yarn build

# 投稿データをPOST
curl -X POST -H "Content-Type: application/json" -d @post.json http://localhost:5001/nextjs-typescript-firestore/us-central1/api/posts
# 投稿データの一覧を取得する
curl http://localhost:5001/nextjs-typescript-firestore/us-central1/api/posts

# Next.jsアプリを起動します。
./dc.sh app install
./dc.sh app dev
$ open http://localhost:3000

# Dockerを停止する場合
$ ./dc.sh stop
```

## 🎨 参考

| プロジェクト| 概要|
| :---------------------------------------| :-------------------------------|
| [RTCPeerConnection](https://developer.mozilla.org/ja/docs/Web/API/RTCPeerConnection)| RTCPeerConnection |
| [STUNTMAN](http://www.stunprotocol.org/)| Public STUN server |
| [Material Icons](https://v4.mui.com/components/material-icons/)| Material Icons |



## 🎫 Licence

[MIT](https://github.com/isystk/nextjs-webrtc-firebase/blob/master/LICENSE)

## 👀 Author

[isystk](https://github.com/isystk)

