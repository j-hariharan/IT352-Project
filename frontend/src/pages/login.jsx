import { useState } from "react"
import { Link } from "react-router"
import { useAuth } from "../lib/AuthContext"

export default function LoginPage () {
    let [ username, setUsername ] = useState("")
    let [ password, setPassword ] = useState("")

    let { login } = useAuth()

    async function handleSubmit (e) {
        e.preventDefault()

        if (!username || !password) {
            alert("Username and password are both required fields")
            return
        }

        let res = await login(username, password)

        if (res == 404) {
            alert("Username does not exist")
            return
        }
        if (res == 401) {
            alert("Wrong password")
            return
        }
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="bg-slate-50 shadow rounded-lg p-10 w-96">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        className="block w-full py-2 px-4 border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4"
                        type="email"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    
                    <input
                        className="block w-full py-2 px-4 border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white duration-200 rounded-full py-2 cursor-pointer">Sign In</button>
                    <p className="my-2 text-center">Don't have an account? <Link to="/signup" className="underline text-indigo-600">Sign Up</Link></p>
                </form>
            </div>
        </div>
    )
}