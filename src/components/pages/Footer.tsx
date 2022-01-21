import React, { VFC } from 'react'

const CommonFooter: VFC = () => {
  return (
    <>
      <footer className="App-footer">
        <strong>
          Copyright &copy; 2021-2022{' '}
          <a href="#" className="App-link">
            isystk.com
          </a>
          .
        </strong>{' '}
        All rights reserved.
      </footer>
    </>
  )
}

export default CommonFooter
