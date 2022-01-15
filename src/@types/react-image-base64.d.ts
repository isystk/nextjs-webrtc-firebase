declare module 'react-image-base64' {
  import { FC } from 'react'
  declare type Props = {
    id?: string
    accept?: string
    capture?: string
    multiple?: boolean
    handleChange: (arg0: Return) => void
    maxFileSize: number
    thumbnail_size: number
    drop: boolean
    dropText: string
  }
  declare type Return = {
    result: boolean
    messages: string[]
    fileName?: string
    ofileData?: string
    fileData?: string
    ofileSize?: number
    fileSize?: number
    fileType?: string
  }
  declare const ImageFile: FC<Props>
  export default ImageFile
}
