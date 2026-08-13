import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin'
import { ApiError } from '../services/http'
import Alert from '../components/ui/Alert'
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
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-[380px] max-w-full">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center text-xl text-white">
            🔧
          </span>
          <div>
            <div className="font-extrabold text-lg leading-[1.1]">FerreStock</div>
            <div className="text-xs text-muted-foreground font-medium">
              Gestión de inventario
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl px-6 py-7">
          <h1 className="font-extrabold text-xl mb-1">Iniciar sesión</h1>
          <p className="mb-5 text-muted-foreground text-[13px]">
            Ingresá tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3.5">
              <Field label="Usuario" htmlFor="login-username" error={errors.username?.message}>
                <Input
                  id="login-username"
                  placeholder="Ingresá tu usuario"
                  autoComplete="username"
                  {...register('username', { required: 'Ingresá tu usuario' })}
                />
              </Field>
            </div>

            <div className="mb-[18px]">
              <Field label="Contraseña" htmlFor="login-password" error={errors.password?.message}>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: 'Ingresá tu contraseña' })}
                />
              </Field>
            </div>

            {errorMessage && (
              <Alert style={{ marginBottom: 14 }}>{errorMessage}</Alert>
            )}

            <Button type="submit" disabled={loginMutation.isPending} className="w-full">
              {loginMutation.isPending ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
