import React, { FC, ReactNode } from 'react'
import { ErrorMessage, Field } from 'formik'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
  options?: []
}

export const Select: FC = (props: Props) => {
  const { label, name, options, ...rest } = props
  return (
    <div className="form-control">
      <label htmlFor={name}>{label}</label>
      <Field as="select" id={name} name={name} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.key}
          </option>
        ))}
      </Field>
      <ErrorMessage name={name} />
    </div>
  )
}

export default Select
