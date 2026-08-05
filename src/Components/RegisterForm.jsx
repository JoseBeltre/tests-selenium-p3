import { useState } from 'react'
import PropTypes from 'prop-types'
import { FloatingInput } from './FloatingInput.jsx'
import { AuthModel } from '../model/auth.js'
import { validateRegister } from '../schemas/auth.js'

export function RegisterForm ({ onAuthenticated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmission = async () => {
    setErrorMsg(undefined)

    const res = validateRegister({ name, email, password, confirmPassword })
    if (!res.success) {
      return setErrorMsg(res.error.errors[0].message)
    }

    setIsSubmitting(true)
    const result = await AuthModel.register({ name, email, password })
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
        name='register-name'
        label='Nombre'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <FloatingInput
        name='register-email'
        label='Correo'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <FloatingInput
        name='register-password'
        label='Contraseña'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <FloatingInput
        name='register-confirm-password'
        label='Confirmar contraseña'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <p className='text-white/50 text-sm leading-5'>
        Mínimo 8 caracteres, con al menos una letra y un número.
      </p>

      {errorMsg && <span className='text-red-300'>{errorMsg}</span>}

      <button
        type='submit'
        disabled={isSubmitting}
        className='hover:bg-secondary hover:text-white border-2 p-2 font-bold text-lg bg-itemBg border-secondary text-secondary transition-colors disabled:opacity-50'
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

RegisterForm.propTypes = {
  onAuthenticated: PropTypes.func.isRequired
}
