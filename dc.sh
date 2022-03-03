#! /bin/bash

DOCKER_HOME=./docker
DOCKER_COMPOSE="docker-compose -f ${DOCKER_HOME}/docker-compose.yml"

function usage {
    cat <<EOF
$(basename ${0}) is a tool for ...

Usage:
  $(basename ${0}) [command] [<options>]

Options:
  stats|st                 Dockerコンテナの状態を表示します。
  init                     Dockerコンテナ・イメージ・生成ファイルの状態を初期化します。
  start                    すべてのDaemonを起動します。
  stop                     すべてのDaemonを停止します。
  app install              アプリの起動に必要なモジュールをインストールします。
  app dev                  アプリを起動します。
  firebase login           Firebase にログインします。
  firebase logout          Firebase からログアウトします。
  firebase start           Firebase のエミュレータを起動します。
  firebase deploy          Firebase にデプロイします。
  --version, -v     バージョンを表示します。
  --help, -h        ヘルプを表示します。
EOF
}

function version {
    echo "$(basename ${0}) version 0.0.1 "
}


case ${1} in
    stats|st)
        docker container stats
    ;;

    init)
        # 停止＆削除（コンテナ・イメージ・ボリューム）
        pushd $DOCKER_HOME
        docker-compose down --rmi all --volumes
#        rm -Rf firebase/src && mkdir firebase/src && chmod -R 777 firebase/src
        popd
    ;;

    start)
        $DOCKER_COMPOSE up -d
    ;;
    
    stop)
        pushd $DOCKER_HOME
        docker-compose down
        popd
    ;;

    app)
      case ${2} in
          login)
              $DOCKER_COMPOSE exec app sh
          ;;
          install)
              COMMAND="yarn"
              $DOCKER_COMPOSE exec app $COMMAND
          ;;
          dev)
              COMMAND="yarn dev"
              $DOCKER_COMPOSE exec app $COMMAND
          ;;
          *)
              usage
          ;;
      esac
    ;;

    firebase)
      case ${2} in
          login)
              COMMAND="firebase login"
              $DOCKER_COMPOSE exec firebase $COMMAND
          ;;
          init)
              COMMAND="firebase init"
              $DOCKER_COMPOSE exec firebase $COMMAND
          ;;
          logout)
              COMMAND="firebase logout"
              $DOCKER_COMPOSE exec firebase $COMMAND
          ;;
          start)
              COMMAND="firebase emulators:start"
#              COMMAND="firebase emulators:start --import data --export-on-exit"
              $DOCKER_COMPOSE exec firebase $COMMAND
          ;;
          deploy)
              COMMAND="firebase deploy"
              $DOCKER_COMPOSE exec firebase $COMMAND
          ;;
          *)
              usage
          ;;
      esac
    ;;

    help|--help|-h)
        usage
    ;;

    version|--version|-v)
        version
    ;;
    
    *)
        echo "[ERROR] Invalid subcommand '${1}'"
        usage
        exit 1
    ;;
esac


