import { useId, useState } from 'react'
import { SMART_PEOPLE } from '../data/smartPeople.js'
import './ScientistDirectory.css'

function ScientistDirectory({ initialData = SMART_PEOPLE } = {}) {
  const [people] = useState(initialData)
  const headingId = useId()

  return (
    <section className="directory" aria-labelledby={headingId}>
      <h2 className="directoryHeading" id={headingId}>
        Scientist &amp; Pioneer Directory
      </h2>
      <ul className="peopleList">
        {people.map((person) => (
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
    </section>
  )
}

export default ScientistDirectory
