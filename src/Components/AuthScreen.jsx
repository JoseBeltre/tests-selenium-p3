import { useState } from 'react'
import PropTypes from 'prop-types'
import { LoginForm } from './LoginForm.jsx'
import { RegisterForm } from './RegisterForm.jsx'

const TABS = [
  { id: 'login', label: 'Iniciar sesión' },
  { id: 'register', label: 'Registrarse' }
]

export function AuthScreen ({ onAuthenticated }) {
  const [tab, setTab] = useState('login')

  return (
    <main className='flex-grow flex items-center justify-center'>
      <section className='w-full max-w-[440px] bg-itemBg p-6'>
        <h1 className='text-4xl font-bold text-center'>ChoresFlow</h1>
        <p className='text-white/50 text-center mt-1'>
          Organiza tus pendientes
        </p>

        <div className='flex gap-2 mt-6'>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              name={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex-1 p-2 transition-colors
                ${tab === id
                  ? 'bg-secondary text-white font-medium'
                  : 'bg-itemBgHover text-white/60 font-light'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'login'
          ? <LoginForm onAuthenticated={onAuthenticated} />
          : <RegisterForm onAuthenticated={onAuthenticated} />}
      </section>
    </main>
  )
}

AuthScreen.propTypes = {
  onAuthenticated: PropTypes.func.isRequired
}
