import Env from '../env/'

/**
 * フロントエンド用の URL を作成する
 */
const getFrontUrl = (path: string): string => {
  return [Env.internalEndpointUrl, path].join('')
}

/** API のエンドポイント */
export const URL = {
  /** HOME */
  HOME: getFrontUrl('/'),
}
