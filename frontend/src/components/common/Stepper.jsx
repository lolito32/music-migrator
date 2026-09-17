import { Fragment } from 'react'
import { Check } from './Icons'

export function Stepper({ steps, done, currentIndex }) {
  return (
    <div className="steps">
      {steps.map((label, index) => {
        const completed = done[index]
        const isCurrent = index === currentIndex
        return (
          <Fragment key={label}>
            {index > 0 ? <span className="step-line" aria-hidden="true" /> : null}
            <span
              className={
                'step-node' +
                (completed ? ' done' : '') +
                (isCurrent ? ' current' : '')
              }
            >
              <span className="step-index">
                {completed ? <Check /> : `0${index + 1}`}
              </span>
              <span className="step-label">{label}</span>
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}