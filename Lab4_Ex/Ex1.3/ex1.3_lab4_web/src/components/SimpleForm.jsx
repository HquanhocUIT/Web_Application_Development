import { useEffect, useRef, useState } from 'react'
import InputField from './InputField.jsx'

const initialValues = { name: '', email: '', password: '' }

function validateFields(values) {
  const nextErrors = {}

  if (values.name.trim().length < 2) {
    nextErrors.name = 'Enter at least 2 characters.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (values.password.length < 8) {
    nextErrors.password = 'Use at least 8 characters.'
  }

  return nextErrors
}

function SimpleForm({ onValuesChange }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [submitAttempt, setSubmitAttempt] = useState(0)
  const [formMessage, setFormMessage] = useState('')
  const renderCount = useRef(0)
  const fieldRefs = useRef({})
  renderCount.current += 1
  console.info(`[Render] SimpleForm render #${renderCount.current}`)

  // Effect 1: synchronize local form state up to the parent component.
  useEffect(() => {
    console.info('[Effect 1] Syncing input state up to parent')
    onValuesChange(values)
  }, [values, onValuesChange])

  // Effect 2: validate each field whenever the input state changes.
  useEffect(() => {
    console.info('[Effect 2] Validating Name, Email, and Password')
    setErrors(validateFields(values))
  }, [values])

  // Effect 3: derive form validity from the errors state (another render step).
  useEffect(() => {
    console.info('[Effect 3] Deriving form validity from validation errors')
    setIsValid(Object.keys(errors).length === 0)
  }, [errors])

  // Effect 5: after submit, scroll and move focus to the first field with an error.
  useEffect(() => {
    if (submitAttempt === 0) return

    const firstInvalidName = Object.keys(errors)[0]
    if (!firstInvalidName) return

    console.info(`[Effect 5] Scrolling to first invalid field: ${firstInvalidName}`)
    fieldRefs.current[firstInvalidName]?.scrollIntoView({ block: 'center', behavior: 'auto' })
    fieldRefs.current[firstInvalidName]?.focus()
  }, [errors, submitAttempt])

  function handleChange(event) {
    const { name, value } = event.target
    setFormMessage('')
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitAttempt((attempt) => attempt + 1)

    if (Object.keys(validateFields(values)).length === 0) {
      setFormMessage('Form submitted successfully.')
    } else {
      setFormMessage('Please correct the highlighted fields.')
    }
  }

  return (
    <section className="form-card" aria-labelledby="form-title">
      <div className="form-heading">
        <div>
          <p className="card-kicker">Legacy form</p>
          <h2 id="form-title">Create your profile</h2>
        </div>
        <p className="render-counter" aria-live="polite">
          Renders <strong>{renderCount.current}</strong>
        </p>
      </div>

      <p className="card-description">
        Each input change flows through multiple effects. Watch the render counter and console.
      </p>

      <form noValidate onSubmit={handleSubmit} aria-describedby="form-status">
        <InputField
          name="name"
          label="Name"
          value={values.name}
          error={errors.name}
          autoComplete="name"
          inputRef={(element) => { fieldRefs.current.name = element }}
          onChange={handleChange}
        />
        <InputField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          error={errors.email}
          autoComplete="email"
          inputRef={(element) => { fieldRefs.current.email = element }}
          onChange={handleChange}
        />
        <InputField
          name="password"
          label="Password"
          type="password"
          value={values.password}
          error={errors.password}
          autoComplete="new-password"
          inputRef={(element) => { fieldRefs.current.password = element }}
          onChange={handleChange}
        />

        <div className="submit-row">
          <button className="submit-button" type="submit">Submit</button>
          <p className={`validity-status ${isValid ? 'is-valid' : ''}`}>
            {isValid ? 'Form is valid' : 'Form has validation errors'}
          </p>
        </div>
        <p className="form-status" id="form-status" role="status" aria-live="polite">
          {formMessage}
        </p>
      </form>
    </section>
  )
}

export default SimpleForm
