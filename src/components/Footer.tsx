import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">Lin Zhao</p>
          <p className="footer-note">用镜头记录凝视、旷野与高原上的时间。</p>
        </div>
        <nav className="footer-nav" aria-label="页脚导航">
          <Link to="/">首页</Link>
          <Link to="/work">作品集</Link>
          <Link to="/about">关于</Link>
          <Link to="/contact">联系</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {year} 林昭 · 全部照片保留所有权利</span>
      </div>
    </footer>
  )
}
