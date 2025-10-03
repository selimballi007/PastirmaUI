import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AccountForm() {

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <LoginForm />
      <RegisterForm />
      {/* Login Form 
      <div className="flex-1 p-6 border rounded-lg shadow"></div>

      
      <div className="flex-1 p-6 border rounded-lg shadow"></div>*/}
    </div>
  )
}
