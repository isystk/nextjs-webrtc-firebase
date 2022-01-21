import React, { FC, ReactNode } from 'react'

type Props = {
  children?: ReactNode
  formik?: any
}

export const SubmitButton: FC = (props: Props) => {
  const { formik } = props
  return (
    <button type="submit" disabled={!formik.isValid}>
      Submit
    </button>
  )
}
