import axios from 'axios'
import * as _ from 'lodash'

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
  method: string,
  url: string,
  values?: any,
  config?: any
): Promise<any> => {
  // console.log('Request:%s', url)
  const response = await axios[method](
    url,
    // jsonToForm(values, new FormData()),
    values,
    config
  ).catch(function (error) {
    if (error.response) {
      throw new Error(error)
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
