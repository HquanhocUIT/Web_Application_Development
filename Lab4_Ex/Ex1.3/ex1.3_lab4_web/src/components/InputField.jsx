import { useEffect, useState } from 'react'

function InputField({ name, label, type = 'text', value, error, autoComplete, inputRef, onChange }) {
  const [displayedError, setDisplayedError] = useState('')
  const errorId = `${name}-error`

  // Effect 4: legacy prop-to-local-state synchronization for child validation feedback.
  useEffect(() => {
    console.info(`[Effect 4] ${name}: syncing validation error into InputField state`)
    setDisplayedError(error || '')
  }, [error, name])

  return (
    <div className="field-group">
      <label htmlFor={name}>{label}<span aria-hidden="true"> *</span></label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required
        aria-invalid={displayedError ? 'true' : 'false'}
        aria-describedby={displayedError ? errorId : undefined}
        onChange={onChange}
      />
      <p className="field-message" id={errorId} aria-live="polite">
        {displayedError}
      </p>
    </div>
  )
}

export default InputField
