import { Link } from 'react-router-dom'
import { seriesList } from '../lib/photos'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-note">
          光落在底片上，也落在被忽略的地方。所有照片均拍摄于高原与肖像现场，未经数字生成。
        </p>
        <nav className="footer-series" aria-label="系列导航">
          {seriesList.map(s => (
            <Link key={s.id} to={`/work/${s.id}`}>
              {s.title}
            </Link>
          ))}
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} 林见山 · 保留所有权利</p>
      </div>
    </footer>
  )
}
