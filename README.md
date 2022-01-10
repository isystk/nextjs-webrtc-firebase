# React Starter Kit in JavaScript

## Node のインストール方法

本アプリケーションは [Node.js](https://nodejs.org/) を前提としています。macOS の場合だと以下の手順で導入できます。Node のバージョンは`.node-version`を参照し、同じものを使用してください。

    $ wget -P /tmp https://nodejs.org/download/release/v14.15.1/node-v14.15.1.pkg
    $ sudo installer -pkg /tmp/node-v14.15.1.pkg -target /
    installer: Package name is Node.js
    installer: Upgrading at base path /
    installer: The upgrade was successful.
    $ node -v
    v14.15.1

## アプリケーションの起動方法(Docker を使用しない場合)

本プロジェクトは、[create-react-app](https://reactjs.org/docs/create-a-new-react-app.html) により作成したアプリケーションから React の学習に最低限必要な機能のみを厳選し、軽量化したものです。
以下の手順でアプリケーションを起動できます。

    $ wget https://github.com/DiveIntoHacking/react-starter-kit-in-javascript-with-node-v14.15.1/archive/v1.2.tar.gz
    $ tar zxvf v1.2.tar.gz
    $ cd react-starter-kit-in-javascript-with-node-v14.15.1-1.2
    $ yarn install
    $ yarn start

## アプリケーションの起動方法(Docker を使用する場合)

    $ wget https://github.com/DiveIntoHacking/react-starter-kit-in-javascript-with-node-v14.15.1/archive/v1.2.tar.gz
    $ tar zxvf v1.2.tar.gz
    $ cd react-starter-kit-in-javascript-with-node-v14.15.1-1.2
    $ touch .bash_history
    $ docker-compose build
    $ docker-compose run --rm app yarn install
    $ docker-compose up


<div align='right'>

[はむさんのオンラインスクール](https://diveintohacking.com/)

</div>
