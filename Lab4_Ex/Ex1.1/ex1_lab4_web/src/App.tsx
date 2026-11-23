import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { SiteLayout } from './components/SiteLayout'
import { PersonDetailSkeleton } from './components/PersonDetailSkeleton'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const PeopleListPage = lazy(() => import('./pages/PeopleListPage'))
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="people" element={<PeopleListPage />} />
        <Route
          path="people/:personId"
          element={
            <Suspense fallback={<PersonDetailSkeleton />}>
              <PersonDetailPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
