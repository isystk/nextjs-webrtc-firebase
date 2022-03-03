import Env from '@/common/env/'

/**
 * BFF（バックエンドフォーフロントエンド）用の URL を作成する
 */
const getBffUrl = (path: string): string => {
  return [Env.externalEndpointUrl, path].join('')
}

/** API のエンドポイント */
export const API_ENDPOINT = {
  HELLO_WORLD: getBffUrl('/helloWorld'),
  SEND_FCM: getBffUrl('/sendFcm'),
}
