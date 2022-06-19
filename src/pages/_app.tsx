import React from 'react'
import App, { AppProps } from 'next/app'
// 全体に適応する外部 CSS を読み込む
import '@/assets/sass/app.scss'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import reducers from '@/stores'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

// 開発環境の場合は、redux-devtools-extension を利用できるようにする
const enhancer =
  process.env.NODE_ENV === 'development'
    ? composeWithDevTools(applyMiddleware(thunk))
    : applyMiddleware(thunk)
const store = createStore(reducers, enhancer)

class MyApp extends App {
  render(): JSX.Element {
    const { Component, pageProps }: AppProps = this.props

    return (
      <MuiThemeProvider>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </MuiThemeProvider>
    )
  }
}

export default MyApp
