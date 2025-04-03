import { useEffect } from "react"
import { useContext } from "react"
import { useState } from "react"
import { createContext } from "react"

let AuthContext = createContext()

export function AuthProvider ({ children }) {
    let [ user, setUser ] = useState(null)

    useEffect(() => {
        let userItem = window.localStorage.getItem("user")

        if (!userItem) setUser(false)
        else setUser(JSON.parse(userItem))
    }, [])

    useEffect(() => {
        if (user === null) return

        if (!user) window.localStorage.removeItem("user")
        else window.localStorage.setItem("user", JSON.stringify(user))
    }, [ user ])

    async function login (username, password) {
        let res = await fetch("http://localhost:8000/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (res.ok) {
            let { token, role } = await res.json()
            setUser({ token, role })
        }

        return res.status
    }

    function logout () {
        setUser(false)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            { children }
        </AuthContext.Provider>
    )
}

export let useAuth = () => useContext(AuthContext)