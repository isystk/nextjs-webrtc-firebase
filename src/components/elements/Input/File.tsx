import React, { FC, ReactNode } from 'react'
import { ErrorMessage, Field } from 'formik'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
}

export const FileInput: FC = (props: Props) => {
  const { label, name, ...rest } = props
  return (
    <div className="form-control">
      <p>{label}</p>
      <Field name={name} {...rest}>
        {({ form }) => {
          const { setFieldValue } = form
          return (
            <input
              id={name}
              name={name}
              type="file"
              onChange={(event) => {
                setFieldValue(name, event.currentTarget.files[0])
              }}
            />
          )
        }}
      </Field>
      <ErrorMessage name={name} />
    </div>
  )
}

export default FileInput
