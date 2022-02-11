import ReactDOM from 'react-dom'
import React, { FC, useRef, useState, useEffect } from 'react'

const Portal: FC = ({ children }) => {
  const ref = useRef<HTMLElement>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const current = document.querySelector<HTMLElement>('body')
    if (current) {
      ref.current = current
    }
    setMounted(true)
  }, [])

  return mounted
    ? ReactDOM.createPortal(
        <>{children}</>,
        ref.current ? ref.current : new Element()
      )
    : null
}

export default Portal
