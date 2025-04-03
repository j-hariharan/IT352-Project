import { Check, Download, Key, MoveRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Base64Tab from "./Base64Tab"
import { computeHash, decryptAES, decryptRSA, encryptAES, encryptRSA, generateAESKey } from "../lib/utils"
import { useAuth } from "../lib/AuthContext"
import { usePk } from "../lib/PKContext"

export default function DownloadModal ({ closeModal, doc, shared = false }) {
    if (shared) {
        doc.encrypted_key = doc.shared_encrypted_key
    }

    let { pk, setPk} = usePk()
    let [ aesKey, setAesKey ] = useState(null)
    let [ file, setFile ] = useState(null)
    let [ computedHash, setComputedHash ] = useState(null)

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
        computeHash(file).then(res => setComputedHash(res))
    }, [ file ])

    let match = 0
    if (computedHash) {
        for (let i=0 ; i<computedHash.length ; i++) {
            if (i<doc.hash.length)
                if (computedHash[i] == doc.hash[i]) match++
        }
        match /= computedHash.length
        match *= 100
        match = parseInt(match)
    }

    async function completeDownload () {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:;base64,' + encodeURIComponent(file));
        element.setAttribute('download', doc.filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }

    return (
        <div className="h-full w-full absolute top-0 left-0 bg-black/60 flex justify-center items-center" onClick={closeModal}>
            <div className="w-[650px] bg-white rounded-lg p-10" onClick={e => e.stopPropagation()}>
                <h1 className="text-center text-2xl font-medium mb-7">Download File</h1>
                <div className="space-y-5">
                    <p className="flex gap-2 items-center"><Download /> AES Encrypted File: <Base64Tab data={doc.file} /></p>
                    <p className="flex gap-2 items-center"><Download /> RSA Encrypted Key: <Base64Tab data={doc.encrypted_key} /></p>
                    <p className="flex gap-2 items-center"><Download /> File Hash: <Base64Tab data={doc.hash} /></p>

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
                        !aesKey ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Decrypt AES Key
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> Decrypted AES Key: <Base64Tab data={aesKey} /></p>
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
                        !computedHash ?
                            <p className="flex gap-2 items-center">
                                <MoveRight size={20} /> 
                                Compute Hash of the Decrypted File
                            </p>
                        :
                            <p className="flex gap-2 items-center"><Check /> Decrypted Hash ({match}% match): <Base64Tab data={computedHash} /></p>
                    }
                    <button onClick={completeDownload} disabled={computedHash == null} className="cursor-pointer py-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 duration-200 rounded-full text-white font-medium mt-5">Complete Download</button>
                </div>
            </div>
        </div>
    )
}