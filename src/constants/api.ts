/**
 * BFF（バックエンドフォーフロントエンド）用の URL を作成する
 */
const getBffUrl = (path: string): string => {
  return ['', path].join('')
}

/** API のエンドポイント */
export const API_ENDPOINT = {
  HELLO_WORLD: getBffUrl('/helloWorld'),
}
