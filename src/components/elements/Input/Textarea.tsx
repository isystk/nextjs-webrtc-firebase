import React, { FC, ReactNode } from 'react'
import { ErrorMessage, Field } from 'formik'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
}

export const Textarea: FC = (props: Props) => {
  const { label, name, ...rest } = props
  return (
    <div className="form-control">
      <p>{label}</p>
      <Field as="textarea" id={name} name={name} {...rest} />
      <ErrorMessage name={name} />
    </div>
  )
}
