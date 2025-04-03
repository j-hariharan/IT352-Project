import "./App.css"
import { Navigate, Outlet, Route, Routes } from "react-router"
import HomePage from "./pages/home"
import { useAuth } from "./lib/AuthContext"
import LoginPage from "./pages/login"
import SignupPage from "./pages/signup"

function App() {
	let { user } = useAuth()

	const RequireAuth = () => {
		return user ? <Outlet /> : <Navigate to="/login" />
	}

	const RequireNoAuth = () => {
		return user ? <Navigate to="/" /> : <Outlet />
	}

	return (
		<>
			<Routes>
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<HomePage />} />
                </Route>

                <Route element={<RequireNoAuth />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Route>
			</Routes>
		</>
	)
}

export default App
