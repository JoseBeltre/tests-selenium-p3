import z from 'zod'

const email = z
  .string({ message: 'Debes de ingresar un correo.' })
  .min(1,
    { message: 'Debes de ingresar un correo.' })
  .email(
    { message: 'Introduce un correo válido.' })

const password = z
  .string({ message: 'Debes de ingresar una contraseña.' })
  .min(8,
    { message: 'La contraseña debe tener un mínimo de 8 caracteres.' })
  .max(64,
    { message: 'La contraseña no puede sobrepasar los 64 caracteres.' })
  .regex(/[a-zA-Z]/,
    { message: 'La contraseña debe incluir al menos una letra.' })
  .regex(/[0-9]/,
    { message: 'La contraseña debe incluir al menos un número.' })

export const RegisterSchema = z
  .object({
    name: z
      .string({ message: 'Debes de ingresar tu nombre.' })
      .trim()
      .min(3,
        { message: 'El nombre debe tener un mínimo de 3 caracteres.' })
      .max(40,
        { message: 'El nombre no puede sobrepasar los 40 caracteres.' }),
    email,
    password,
    confirmPassword: z
      .string({ message: 'Debes de confirmar la contraseña.' })
      .min(1,
        { message: 'Debes de confirmar la contraseña.' })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword']
  })

export const LoginSchema = z.object({
  email,
  password: z
    .string({ message: 'Debes de ingresar una contraseña.' })
    .min(1,
      { message: 'Debes de ingresar una contraseña.' })
})

export function validateRegister (object) {
  return RegisterSchema.safeParse(object)
}

export function validateLogin (object) {
  return LoginSchema.safeParse(object)
}
