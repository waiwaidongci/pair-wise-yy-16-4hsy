import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { WorkPage } from './pages/WorkPage'
import { SeriesDetailPage } from './pages/SeriesDetailPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { LightboxProvider, WorkFilterProvider } from './context/AppContext'
import './styles.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'work', element: <WorkPage /> },
      { path: 'work/:seriesId', element: <SeriesDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkFilterProvider>
      <LightboxProvider>
        <RouterProvider router={router} />
      </LightboxProvider>
    </WorkFilterProvider>
  </React.StrictMode>,
)
