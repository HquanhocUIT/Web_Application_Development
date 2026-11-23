import { lazy, Suspense } from 'react'
import { useParams } from 'react-router'
import { PersonCard } from '../components/PersonCard'
import { PersonDetailSkeleton } from '../components/PersonDetailSkeleton'
import { people } from '../data/people'

const PersonDetailPage = lazy(() => import('./PersonDetailPage'))

function PeopleListPage() {
  const { personId } = useParams()

  return (
    <section className="people-page" aria-labelledby="people-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Directory</p>
          <h1 className="page-title" id="people-title">
            People
          </h1>
        </div>
        <p className="people-count">{people.length} team members</p>
      </div>

      <div className="people-layout">
        <aside className="people-list-pane" aria-label="People directory">
          <ul className="people-grid">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </ul>
        </aside>

        <section className="person-detail-pane" aria-label="Person details">
          {personId ? (
            <Suspense fallback={<PersonDetailSkeleton />}>
              <PersonDetailPage />
            </Suspense>
          ) : (
            <p className="detail-prompt">Select a person to view their details.</p>
          )}
        </section>
      </div>
    </section>
  )
}

export default PeopleListPage
