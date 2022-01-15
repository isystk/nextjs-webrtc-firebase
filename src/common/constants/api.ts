import Env from '@/common/env/'

/**
 * BFF（バックエンドフォーフロントエンド）用の URL を作成する
 */
const getBffUrl = (path: string): string => {
  return [Env.externalEndpointUrl, path].join('')
}

/** API のエンドポイント */
export const API_ENDPOINT = {
  /** 投稿 */
  POSTS: getBffUrl('/posts'),
}
