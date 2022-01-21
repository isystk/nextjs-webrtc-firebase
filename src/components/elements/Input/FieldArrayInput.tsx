import { ErrorMessage, Field, FieldArray } from 'formik'

import React, { FC, ReactNode } from 'react'

type Props = {
  children?: ReactNode
  label?: string
  name?: string
}

export const FieldArrayInput: FC = (props: Props) => {
  const { label, name } = props

  const validateArrayInput = (value) => {
    let error
    if (!value) {
      error = 'FieldArrayInput is Required'
    }
    return error
  }

  return (
    <div className="form-control">
      <label htmlFor={name}>{label}</label>
      <FieldArray name={name}>
        {(fieldArrayProps) => {
          const { push, remove, form } = fieldArrayProps
          const { values } = form
          return (
            <div>
              {values[name].map((value, index) => (
                <div key={index}>
                  {/* 1つ目のInputは入力必須にする */}
                  {index === 0 ? (
                    <Field
                      name={`${name}[${index}]`}
                      validate={validateArrayInput}
                    />
                  ) : (
                    <>
                      <Field name={`${name}[${index}]`} />
                      <button type="button" onClick={() => remove(index)}>
                        -
                      </button>
                    </>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => push('')}>
                +
              </button>
            </div>
          )
        }}
      </FieldArray>
      <ErrorMessage name={name} />
    </div>
  )
}

export default FieldArrayInput
