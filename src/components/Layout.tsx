import React, { FC } from 'react'
import PropTypes from 'prop-types'

const Layout: FC = (props) => {
  return <>{props.children}</>
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
}

export default Layout
