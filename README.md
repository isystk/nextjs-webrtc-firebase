🌙 nextjs-webrtc-firebase
====

![GitHub issues](https://img.shields.io/github/issues/isystk/nextjs-webrtc-firebase)
![GitHub forks](https://img.shields.io/github/forks/isystk/nextjs-webrtc-firebase)
![GitHub stars](https://img.shields.io/github/stars/isystk/nextjs-webrtc-firebase)
![GitHub license](https://img.shields.io/github/license/isystk/nextjs-webrtc-firebase)

## 📗 プロジェクトの概要

Next.js ＆ Firebase の学習用サンプルアプリケーションです。


## 🌐 Demo

![投稿一覧画面](./app1.png "投稿一覧画面")
![投稿画面](./app2.png "投稿画面")

- ログイン/ログアウト
- 会員登録
- 投稿一覧
- 投稿詳細
- マイページ（一覧・登録・更新・削除）


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
├── public/
├── src/ (Next.js のソースコード)
│   ├── auth/
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
| [react-bootstrap](https://react-bootstrap.github.io/components/)| BootstrapのReact用コンポーネント |
| [今更ながらのNext.js + TypeScript + Firebaseで認証機能を実装する](https://zenn.dev/k_logic24/articles/react-auth-with-firebase)| 今更ながらのNext.js + TypeScript + Firebaseで認証機能を実装する |


## 🎫 Licence

[MIT](https://github.com/isystk/nextjs-webrtc-firebase/blob/master/LICENSE)

## 👀 Author

[isystk](https://github.com/isystk)

