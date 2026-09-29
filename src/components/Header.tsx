import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/work', label: '作品集', end: false },
  { to: '/about', label: '关于', end: false },
  { to: '/contact', label: '联系', end: false },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  // 打开移动菜单时锁住背景滚动
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/" onClick={() => setMenuOpen(false)}>
          Lin&nbsp;Zhao
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={`menu${menuOpen ? ' open' : ''}`}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="移动端导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
