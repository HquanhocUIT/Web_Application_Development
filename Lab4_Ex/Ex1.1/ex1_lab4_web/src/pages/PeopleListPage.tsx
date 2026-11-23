import { PersonCard } from '../components/PersonCard'
import { people } from '../data/people'

function PeopleListPage() {
  return (
    <section aria-labelledby="people-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Directory</p>
          <h1 className="page-title" id="people-title">
            People
          </h1>
        </div>
        <p className="people-count">{people.length} team members</p>
      </div>

      <ul className="people-grid" aria-label="People directory">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </ul>
    </section>
  )
}

export default PeopleListPage
