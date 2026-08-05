import { useState } from 'react'
import PropTypes from 'prop-types'
import { FloatingInput } from './FloatingInput.jsx'
import { AuthModel } from '../model/auth.js'
import { validateLogin } from '../schemas/auth.js'

export function LoginForm ({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmission = async () => {
    setErrorMsg(undefined)

    const res = validateLogin({ email, password })
    if (!res.success) {
      return setErrorMsg(res.error.errors[0].message)
    }

    setIsSubmitting(true)
    const result = await AuthModel.login({ email, password })
    setIsSubmitting(false)

    if (!result.success) {
      return setErrorMsg(result.message)
    }
    onAuthenticated(result.user)
  }

  return (
    <form
      className='mt-6 grid gap-6'
      onSubmit={(e) => {
        e.preventDefault()
        handleFormSubmission()
      }}
    >
      <FloatingInput
        name='login-email'
        label='Correo'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <FloatingInput
        name='login-password'
        label='Contraseña'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {errorMsg && <span className='text-red-300'>{errorMsg}</span>}

      <button
        type='submit'
        disabled={isSubmitting}
        className='hover:bg-secondary hover:text-white border-2 p-2 font-bold text-lg bg-itemBg border-secondary text-secondary transition-colors disabled:opacity-50'
      >
        {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

LoginForm.propTypes = {
  onAuthenticated: PropTypes.func.isRequired
}
