import { Check, Download, Key, MoveRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Base64Tab from "./Base64Tab"
import { computeHash, decryptAES, decryptRSA, encryptAES, encryptRSA, generateAESKey } from "../lib/utils"
import { useAuth } from "../lib/AuthContext"
import { usePk } from "../lib/PKContext"

export default function ShareModal ({ closeModal, doc }) {
    let { pk, setPk} = usePk()
    let [ aesKey, setAesKey ] = useState(null)
    let [ file, setFile ] = useState(null)

    let [ newAesKey, setNewAesKey ] = useState()
    let [ encrypedFile, setEncryptedFile ] = useState(null)
    let [ doctor, setDoctor ] = useState("")
    let [ doctorPk, setDoctorpk ] = useState(null)
    let [ encryptedKey, setEncryptedKey ] = useState(null)


    let pkUploadRef = useRef(null)

    let { user } = useAuth()

    const handlePkUpload = (e) => {
        if (e.target.files.length == 0) return

        let reader = new FileReader()
        reader.addEventListener("load", () => setPk(reader.result), false)
        reader.readAsText(e.target.files[0])
	}

    useEffect(() => {
        if (!pk) return
        decryptRSA(doc.encrypted_key, pk).then(res => setAesKey(res))
    }, [ pk ])

    useEffect(() => {
        if (!aesKey) return
        decryptAES(doc.file, aesKey, doc.iv).then(res => setFile(res))
    }, [ aesKey ])

    useEffect(() => {
        if (file == null) return
        generateAESKey().then(res => setNewAesKey(res))
    }, [ file ])

    useEffect(() => {
        if (newAesKey == null) return
        encryptAES(file, newAesKey, doc.iv).then(res => setEncryptedFile(res.encrypted))
    }, [ newAesKey ])

    async function handleDoctorSelect (e) {
        e.preventDefault()

        let res = await fetch(`http://localhost:8000/pk/${doctor}`)
        
        if (res.status == 404) {
            alert("Invalid username entered")
            return
        }

        let { pk, role } = await res.json()

        if (role != "doctor") {
            alert("The entered user is not a doctor")
            return
        }
        
        setDoctorpk(pk)
    }

    useEffect(() => {
        if (doctorPk == null) return
        encryptRSA(newAesKey, doctorPk).then(res => setEncryptedKey(res))
    }, [ doctorPk ])


    async function completeShare () {
        let res = await fetch(`http://localhost:8000/share/${doc.id}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': user.token },
            body: JSON.stringify({
                file: encrypedFile, encrypted_key: encryptedKey, doctor
            })
        })

        if (res.ok) {
            alert("File shared successfully!")
            closeModal()
        }
    }

    return (
        <div className="h-full w-full absolute top-0 left-0 bg-black/60 flex justify-center items-center" onClick={closeModal}>
            <div className="w-[650px] bg-white rounded-lg p-10" onClick={e => e.stopPropagation()}>
                <h1 className="text-center text-2xl font-medium mb-7">Share File</h1>
                <div className="space-y-5">
                    <p className="flex gap-2 items-center"><Download /> AES Encrypted File: <Base64Tab data={doc.file} /></p>

                    {
                        pk
                        ?
                        <div className="flex gap-2 items-center">
                            <Check /> RSA Private Key:
                            <Base64Tab data={pk} />
                        </div>
                        :
                        <div className="flex gap-2 items-center">
                            <MoveRight size={20} /> RSA Private Key:
                            <button
                                onClick={() => pkUploadRef.current.click()}
                                className="cursor-pointer flex items-center gap-2 px-4 py-1 border rounded-lg hover:bg-gray-200 duration-200"
                            >
                                <input hidden type="file" name="" id="" ref={pkUploadRef} onChange={handlePkUpload} />
                                <Key size={18} /> Upload Private Key
                            </button>
                        </div>
                    }
                    {
                        !file ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Decrypt File Using AES
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> AES Decrypted File: <Base64Tab data={file} /></p>
                    }
                    {
                        !newAesKey ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Generate new AES Key
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> New AES Key Generated: <Base64Tab data={newAesKey} /></p>
                    }
                    {
                        !encrypedFile ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Encrypt File Using AES
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> AES Encrypted File: <Base64Tab data={encrypedFile} /></p>
                    }
                    {
                        !doctorPk ?
                            <div className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Choose Doctor
                                {
                                    encrypedFile &&
                                    <form onSubmit={handleDoctorSelect}>
                                        <input type="email" required value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Owner Username" className="outline-none py-1 px-2 border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg" />
                                    </form>
                                }
                            </div>
                        :
                            <p className="flex gap-2 items-center"><Check /> Doctor: {doctor}</p>
                    }
                    {
                        !doctorPk ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Get Doctor's RSA Public Key
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> Doctor's RSA Public Key: <Base64Tab data={doctorPk} /></p>
                    }
                    {
                        !encryptedKey ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Encrypt the AES Key Using RSA (Using Owner's Public Key)
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> RSA Encrypted Key: <Base64Tab data={encryptedKey} /></p>
                    }
                    

                    <button onClick={completeShare} disabled={false} className="cursor-pointer py-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 duration-200 rounded-full text-white font-medium mt-5">Complete Share</button>
                </div>
            </div>
        </div>
    )
}