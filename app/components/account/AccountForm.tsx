import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AccountForm() {

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Login Form */}
      <div className="flex-1 p-6 border rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Giriş Yap</h2>
        <LoginForm />
      </div>

      {/* Register Form */}
      <div className="flex-1 p-6 border rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Üye Ol</h2>
        <RegisterForm />
      </div>
    </div>
  )
}
