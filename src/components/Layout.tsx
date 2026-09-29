import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Lightbox } from './Lightbox'

// 进入新路由时回到页首；浏览器后退（如系列页返回 /work）同样触发，不影响筛选状态。
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Layout() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Lightbox />
    </div>
  )
}
