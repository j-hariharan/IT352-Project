import { useContext, useEffect } from "react"
import { useState } from "react"
import { createContext } from "react"
import { useAuth } from "./AuthContext"

let PKContext = createContext()

export function PKProvider ({ children }) {
    let [ pk, setPk ] = useState(null)
    let { user } = useAuth()

    useEffect(() => {
        if (user == false) setPk(false)
    }, [ user ])

    return (
        <PKContext.Provider value = {{ pk, setPk }}>
            { children }
        </PKContext.Provider>
    )
}

export let usePk = () => useContext(PKContext)

