const USERS_KEY = 'users'
const SESSION_KEY = 'session'
const LEGACY_TASKS_KEY = 'tasks'

/**
 * Hashea la contraseña con SHA-256 y un salt propio de cada usuario.
 *
 * OJO: esto NO es seguridad real. Todo vive en el navegador y cualquiera puede
 * abrir localStorage y leer el hash. Es una simulación: solo evita guardar la
 * contraseña en texto plano. Un login de verdad valida contra un servidor.
 */
async function hashPassword ({ password, salt }) {
  const data = `${salt}:${password}`

  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
    return Array.from(new Uint8Array(buffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  // crypto.subtle solo existe en contextos seguros (https o localhost). Si la app
  // se sirve por IP de red, caemos a un hash simple para no romper la simulación.
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash |= 0
  }
  return `insecure-${(hash >>> 0).toString(16)}`
}

/** Quita el hash y el salt antes de exponer el usuario a los componentes. */
function toPublicUser (user) {
  const { id, name, email, createdAt } = user
  return { id, name, email, createdAt }
}

/**
 * Las tareas que existían antes del login no tenían dueño. Al registrarse el
 * primer usuario se las pasamos a él para que no se pierdan.
 */
function migrateLegacyTasks ({ userId }) {
  const legacyTasks = window.localStorage.getItem(LEGACY_TASKS_KEY)
  if (!legacyTasks) return

  window.localStorage.setItem(`${LEGACY_TASKS_KEY}:${userId}`, legacyTasks)
  window.localStorage.removeItem(LEGACY_TASKS_KEY)
}

export class AuthModel {
  static getUsers () {
    const usersStorage = window.localStorage.getItem(USERS_KEY)
    try {
      return usersStorage ? JSON.parse(usersStorage) : []
    } catch (error) {
      console.error('Error parsing users from localStorage:', error)
      return []
    }
  }

  static findByEmail ({ email }) {
    const normalizedEmail = email.trim().toLowerCase()
    return AuthModel.getUsers().find(user => user.email === normalizedEmail)
  }

  static async register ({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    if (AuthModel.findByEmail({ email: normalizedEmail })) {
      return { success: false, message: 'Ya existe una cuenta con ese correo.' }
    }

    const users = AuthModel.getUsers()
    const salt = crypto.randomUUID()
    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: await hashPassword({ password, salt }),
      createdAt: new Date().toISOString()
    }

    const isFirstUser = users.length === 0
    users.push(newUser)
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))

    if (isFirstUser) migrateLegacyTasks({ userId: newUser.id })

    AuthModel.startSession({ userId: newUser.id })
    return { success: true, user: toPublicUser(newUser) }
  }

  static async login ({ email, password }) {
    // Mensaje genérico a propósito: no delatamos si el correo está registrado.
    const invalidCredentials = { success: false, message: 'Correo o contraseña incorrectos.' }

    const user = AuthModel.findByEmail({ email })
    if (!user) return invalidCredentials

    const passwordHash = await hashPassword({ password, salt: user.salt })
    if (passwordHash !== user.passwordHash) return invalidCredentials

    AuthModel.startSession({ userId: user.id })
    return { success: true, user: toPublicUser(user) }
  }

  static startSession ({ userId }) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }))
  }

  static logout () {
    window.localStorage.removeItem(SESSION_KEY)
  }

  static getCurrentUser () {
    const sessionStorage = window.localStorage.getItem(SESSION_KEY)
    if (!sessionStorage) return null

    try {
      const { userId } = JSON.parse(sessionStorage)
      const user = AuthModel.getUsers().find(user => user.id === userId)
      // La sesión puede apuntar a un usuario que ya no existe.
      return user ? toPublicUser(user) : null
    } catch (error) {
      console.error('Error parsing session from localStorage:', error)
      return null
    }
  }

  static getCurrentUserId () {
    return AuthModel.getCurrentUser()?.id
  }
}
