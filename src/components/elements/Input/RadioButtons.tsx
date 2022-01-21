import React, { FC, ReactNode } from 'react'
import { ErrorMessage, Field } from 'formik'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
  options?: []
}

export const RadioButtons: FC = (props: Props) => {
  const { label, name, options, ...rest } = props
  return (
    <div className="form-control">
      <label htmlFor={name}>{label}</label>
      <Field id={name} name={name} {...rest}>
        {({ field }) => {
          return options.map((option) => (
            <React.Fragment key={option.key}>
              <input
                id={option.value}
                type="radio"
                {...field}
                value={option.value}
                checked={field.value === option.value}
              />
              <label htmlFor={option.value}>{option.key}</label>
            </React.Fragment>
          ))
        }}
      </Field>
      <ErrorMessage name={name} />
    </div>
  )
}

export default RadioButtons
