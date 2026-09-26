import './App.css'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      {/*
        The AuthProvider makes the following available to all child components via useAuth():
        - user: Supabase user object
        - profile: User profile from public.profiles table
        - loading: Boolean indicating if auth state is initializing
        - login: Function to log in with email/password
        - logout: Function to log out

        All routes are wrapped in AuthProvider so they can access authentication state.
      */}
      <AppRoutes />
    </AuthProvider>
  )
}

export default App