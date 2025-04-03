import { Check, MoveRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Base64Tab from "./Base64Tab"
import { computeHash, encryptAES, encryptRSA, generateAESKey } from "../lib/utils"
import { useAuth } from "../lib/AuthContext"

export default function UploadModal ({ closeModal }) {
    let [ file, setFile ] = useState(null)
    let [ filename, setFilename ] = useState(null)
    let [ aesKey, setAesKey ] = useState(null)
    let [ encrypedFile, setEncryptedFile ] = useState(null)
    let [ owner, setOwner ] = useState("")
    let [ ownerPk, setOwnerPk ] = useState(null)
    let [ encryptedKey, setEncryptedKey ] = useState(null)
    let [ hash, setHash ] = useState(null)

    let [ iv, setIv ] = useState(null)

    let uploadInputRef = useRef(null)

    let { user } = useAuth()

    function handleFileUpload (e) {
        if (e.target.files.length == 0) return

        setFilename(e.target.files[0].name)
        let reader = new FileReader()
        reader.addEventListener("load", () => setFile(reader.result.split(",")[1]), false)
        reader.readAsDataURL(e.target.files[0])
    }

    useEffect(() => {
        if (file == null) return

        generateAESKey().then(res => setAesKey(res))
    }, [ file ])

    useEffect(() => {
        if (aesKey == null) return

        encryptAES(file, aesKey).then(res => { setEncryptedFile(res.encrypted); setIv(res.iv) })
    }, [ aesKey ])

    async function handleOwnerSelect (e) {
        e.preventDefault()

        let res = await fetch(`http://localhost:8000/pk/${owner}`)
        
        if (res.status == 404) {
            alert("Invalid username entered")
            return
        }

        let { pk, role } = await res.json()

        if (role != "patient") {
            alert("The entered user is not a patient")
            return
        }
        
        setOwnerPk(pk)
    }

    useEffect(() => {
        if (ownerPk == null) return
        encryptRSA(aesKey, ownerPk).then(res => setEncryptedKey(res))
    }, [ ownerPk ])

    useEffect(() => {
        if (encryptedKey == null) return
        computeHash(file).then(res => setHash(res))
    }, [ encryptedKey ])


    async function completeUpload () {
        let res = await fetch("http://localhost:8000/upload", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': user.token },
            body: JSON.stringify({
                file: encrypedFile, filename, encrypted_key: encryptedKey, hash, owner, iv
            })
        })

        if (res.ok) {
            alert("File uploaded successfully!")
            closeModal()
        }
    }

    return (
        <div className="h-full w-full absolute top-0 left-0 bg-black/60 flex justify-center items-center" onClick={closeModal}>
            <div className="w-[650px] bg-white rounded-lg p-10" onClick={e => e.stopPropagation()}>
                <h1 className="text-center text-2xl font-medium mb-7">Upload File</h1>
                <div className="space-y-5">
                    {
                        !file ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Select file to be uploaded: 
                                <input hidden type="file" onChange={handleFileUpload} ref={uploadInputRef} />
                                <span onClick={() => uploadInputRef.current.click()} className="bg-indigo-300 px-2 py-1 rounded cursor-pointer text-sm">Select</span>
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> File uploaded: <Base64Tab data={file} /></p>
                    }
                    {
                        !aesKey ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Generate AES Key
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> AES Key Generated: <Base64Tab data={aesKey} /></p>
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
                        !ownerPk ?
                            <div className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Choose Owner
                                {
                                    encrypedFile &&
                                    <form onSubmit={handleOwnerSelect}>
                                        <input type="email" required value={owner} onChange={e => setOwner(e.target.value)} placeholder="Owner Username" className="outline-none py-1 px-2 border border-indigo-200 focus:border-indigo-400 duration-200 rounded-lg" />
                                    </form>
                                }
                            </div>
                        :
                            <p className="flex gap-2 items-center"><Check /> Owner: {owner}</p>
                    }
                    {
                        !ownerPk ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Get Owner's RSA Public Key
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> Owner's RSA Public Key: <Base64Tab data={ownerPk} /></p>
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
                    {
                        !hash ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Compute Hash of the Uploaded File
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> Uploaded File Hash: <Base64Tab data={hash} /></p>
                    }
                    <button onClick={completeUpload} disabled={hash == null} className="cursor-pointer py-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 duration-200 rounded-full text-white font-medium mt-5">Complete Upload</button>
                </div>
            </div>
        </div>
    )
}