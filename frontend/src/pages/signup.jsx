import { useState } from "react"
import { Link } from "react-router"
import { generateRSAKeyPair } from "../lib/utils"
import { useAuth } from "../lib/AuthContext"
import { usePk } from "../lib/PKContext"
import { Key } from "lucide-react"

export default function SignupPage () {
    let [ username, setUsername ] = useState("")
    let [ password, setPassword ] = useState("")
    let [ confirmPassword, setConfirmPassword ] = useState("")
    let [ role, setRole ] = useState("none")
    let [ downloaded, setDownloaded ] = useState(false)

    let { pk, setPk } = usePk()

    let { login } = useAuth()

    async function handleSubmit (e) {
        e.preventDefault()
        if (!username || !password) {
            alert("Username and password are both required fields")
            return
        }

        if (password != confirmPassword) {
            alert("Passwords don't match")
            return
        }

        if (password.length < 8) {
            alert("Password should be atleast 8 characters long")
            return
        }

        if (role == "none") {
            alert("Please choose a valid role")
            return
        }

        if (role != "lab") {
            let { publicKey, privateKey } = await generateRSAKeyPair()
            
            let res = await fetch("http://localhost:8000/signup", {
                method: "POST",
                body: JSON.stringify({
                    username, password, publicKey, role
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (res.status == 400) {
                alert("Sign up failed: User already exists")
                return
            }

            setPk(privateKey)
        } else {
            let res = await fetch("http://localhost:8000/signup", {
                method: "POST",
                body: JSON.stringify({
                    username, password, publicKey: "", role
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (res.status == 400) {
                alert("Sign up failed: User already exists")
                return
            }

            login(username, password)
        }
    }

    async function handleDownload () {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pk));
        element.setAttribute('download', "private-key.txt");
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
        setDownloaded(true)
    }

    async function handleContinue () {
        login(username, password)
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="bg-slate-50 shadow rounded-lg p-10 w-96">
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        className="block w-full py-2 px-4 bg-white border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4"
                        type="email"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    
                    <input
                        className="block w-full py-2 px-4 bg-white border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <input
                        className="block w-full py-2 px-4 bg-white border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    <select className="block w-full py-2 px-4 bg-white border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg outline-none my-4" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="none">Choose a Role</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                        <option value="lab">Lab</option>
                    </select>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white duration-200 rounded-full py-2 cursor-pointer">Sign Up</button>
                    <p className="my-2 text-center">Already have an account? <Link to="/login" className="underline text-indigo-600">Sign In</Link></p>
                </form>
            </div>
            {
                pk ? 
                <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center bg-black/60">
                    <div className="bg-white w-[400px] rounded-lg p-10">
                        <h1 className="text-center text-xl font-semibold mb-2">Download your Private Key!</h1>
                        <p className="text-justify mb-3 px-2">Save the private key safely on your system. You will require this key to read any of your files in the future. Do not share this key with anyone for any reason.</p>
                        <div className="bg-slate-300 text-slate-800 rounded-full px-3 py-1 mb-3 flex gap-2 items-center">
                            <Key size={18} className="shrink-0"/>
                            <p className="whitespace-nowrap  text-ellipsis overflow-hidden">{pk}</p>
                        </div>
                        { downloaded ? 
                            <div className="flex gap-3">
                                <button className="text-center py-2 rounded-lg grow cursor-pointer duration-200 border border-slate-600" onClick={handleDownload}>Download</button>
                                <button className="text-center py-2 rounded-lg bg-indigo-600 text-white grow cursor-pointer hover:bg-indigo-700 duration-200" onClick={handleContinue}>Continue</button>
                            </div>
                            :
                            <button className="py-2 px-20 rounded-lg bg-indigo-600 text-white w-full cursor-pointer hover:bg-indigo-700 duration-200" onClick={handleDownload}>Download</button>
                        }
                    </div>
                </div>
                : null
            }
        </div>
    )
}