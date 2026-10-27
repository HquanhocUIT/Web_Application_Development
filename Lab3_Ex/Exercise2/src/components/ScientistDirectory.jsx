import { useId, useState } from 'react'
import { SMART_PEOPLE } from '../data/smartPeople.js'
import './ScientistDirectory.css'

export function deriveVisiblePeople(people, query, minIq, sortBy) {
  const normalizedQuery = query.trim().toLowerCase()

  return people
    .filter((person) => person.name.toLowerCase().includes(normalizedQuery))
    .filter((person) => person.iq >= minIq)
    .toSorted((first, second) => second[sortBy] - first[sortBy])
}

export function normalizeMinIq(valueAsNumber) {
  return Number.isFinite(valueAsNumber) ? valueAsNumber : 0
}

function ScientistDirectory({ initialData = SMART_PEOPLE } = {}) {
  const [people] = useState(initialData)
  const headingId = useId()
  const searchId = useId()
  const minIqId = useId()
  const sortId = useId()
  const [query, setQuery] = useState('')
  const [minIq, setMinIq] = useState(0)
  const [sortBy, setSortBy] = useState('iq')
  const visiblePeople = deriveVisiblePeople(people, query, minIq, sortBy)

  return (
    <section className="directory" aria-labelledby={headingId}>
      <h2 className="directoryHeading" id={headingId}>
        Scientist &amp; Pioneer Directory
      </h2>
      <form className="directoryControls" onSubmit={(event) => event.preventDefault()}>
        <div className="controlGroup">
          <label htmlFor={searchId}>Search by name</label>
          <input
            id={searchId}
            name="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search scientists"
          />
        </div>

        <div className="controlGroup">
          <label htmlFor={minIqId}>Minimum IQ</label>
          <input
            id={minIqId}
            name="minIq"
            type="number"
            min="0"
            step="1"
            value={minIq === 0 ? '' : minIq}
            onChange={(event) => setMinIq(normalizeMinIq(event.target.valueAsNumber))}
            placeholder="No minimum"
          />
        </div>

        <div className="controlGroup">
          <label htmlFor={sortId}>Sort by</label>
          <select
            id={sortId}
            name="sortBy"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="iq">IQ (highest first)</option>
            <option value="age">Age (oldest first)</option>
          </select>
        </div>
      </form>

      <output className="resultCount" role="status" aria-live="polite">
        {visiblePeople.length} {visiblePeople.length === 1 ? 'person' : 'people'} found
      </output>

      {visiblePeople.length > 0 ? (
        <ul className="peopleList">
          {visiblePeople.map((person) => (
            <li className="personItem" key={person.id}>
              <article className="personCard">
                <h3 className="personName">{person.name}</h3>
                <p className="personDetails">
                  Age: {person.age} <span aria-hidden="true">·</span> IQ: {person.iq}
                </p>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="emptyMessage">No scientists match your search and IQ filter.</p>
      )}
    </section>
  )
}

export default ScientistDirectory
