import React, { FC } from 'react'
import { useDispatch } from 'react-redux'
import { URL } from '../../common/constants/url'
import { push } from 'connected-react-router'

export const SideMenu: FC = () => {
  const dispatch = useDispatch()

  return (
    <>
      <aside className="main-sidebar sidebar-dark-purple elevation-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            dispatch(push(URL.HOME))
          }}
          className="brand-link"
        >
          <img
            src="/assets/image/github-icon.svg"
            alt="AdminSample Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: 0.8 }}
          />
          <span className="brand-text font-weight-light">React Sample</span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className="nav-item has-treeview">
                <a href="#" className="nav-link">
                  <i className="nav-icon fas fa-table"></i>
                  <p>
                    Firebase
                    <i className="fas fa-angle-left right"></i>
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        dispatch(push(URL.FCM))
                      }}
                      className="nav-link"
                    >
                      <i className="fas fa-box-open nav-icon"></i>
                      <p>FCM(プッシュ通知)</p>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default SideMenu
