import 'react-datepicker/dist/react-datepicker.css'

import { ErrorMessage, Field } from 'formik'

import DateView from 'react-datepicker'
import React, { FC, ReactNode } from 'react'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
}

export const DatePicker: FC = (props: Props) => {
  const { label, name, ...rest } = props
  return (
    <div className="form-control">
      <label htmlFor={name}>{label}</label>
      <Field name={name}>
        {({ field, form }) => {
          const { setFieldValue } = form
          const { value } = field
          return (
            <DateView
              id={name}
              {...field}
              {...rest}
              selected={value}
              onChange={(val) => setFieldValue(name, val)}
            />
          )
        }}
      </Field>
      <ErrorMessage name={name} />
    </div>
  )
}

export default DatePicker
