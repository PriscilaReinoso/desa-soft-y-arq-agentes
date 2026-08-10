import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin'
import { ApiError } from '../services/http'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'

type LoginFormValues = {
  username: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()

  const loginMutation = useLogin()

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({ username: values.username, password: values.password })
  }

  const errorMessage = (() => {
    if (!loginMutation.error) return null
    if (loginMutation.error instanceof ApiError) return loginMutation.error.message
    return loginMutation.error.message
  })()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: 24,
      }}
    >
      <div style={{ width: 380, maxWidth: '100%' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
          <span
            style={{
              width: 40,
              height: 40,
              background: 'var(--primary)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#fff',
            }}
          >
            🔧
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>FerreStock</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Gestión de inventario
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '28px 24px',
          }}
        >
          <h1 style={{ fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>Iniciar sesión</h1>
          <p style={{ margin: '0 0 20px', color: 'var(--muted-foreground)', fontSize: 13 }}>
            Ingresá tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: 14 }}>
              <Field label="Usuario" htmlFor="login-username">
                <Input
                  id="login-username"
                  placeholder="Ingresá tu usuario"
                  autoComplete="username"
                  {...register('username', { required: 'Ingresá tu usuario' })}
                />
              </Field>
              {errors.username && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#C85A3A', fontWeight: 600 }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <Field label="Contraseña" htmlFor="login-password">
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: 'Ingresá tu contraseña' })}
                />
              </Field>
              {errors.password && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#C85A3A', fontWeight: 600 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <div
                style={{
                  background: '#C85A3A18',
                  color: '#C85A3A',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              >
                {errorMessage}
              </div>
            )}

            <Button type="submit" disabled={loginMutation.isPending} style={{ width: '100%' }}>
              {loginMutation.isPending ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
