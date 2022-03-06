import axios from 'axios'

const get = async (url: string): Promise<any> => {
  return await request('get', url)
}

const post = async (url: string, values?: any, config?: any): Promise<any> => {
  return await request('post', url, values, config)
}

const put = async (url: string, values?: any, config?: any): Promise<any> => {
  return await request('put', url, values, config)
}

const del = async (url: string, values?: any, config?: any): Promise<any> => {
  return await request('delete', url, values, config)
}

const request = async (
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  values?: any,
  config?: any
): Promise<any> => {
  // console.log('Request:%s', url)
  // @ts-ignore
  const response = await axios[method](
    url,
    // jsonToForm(values, new FormData()),
    values,
    config
  ).catch(function (e: string | undefined) {
    if (axios.isAxiosError(e) && e.response) {
      throw new Error(e)
    }
  })
  // console.log('Response:%s', response.data.body)
  return response?.data?.body
}

export const API = {
  get,
  post,
  put,
  del,
}
