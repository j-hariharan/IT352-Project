import { useEffect, useRef, useState } from "react"
import { Upload, LogOut, Download, Share2, Key, CircleOff } from "lucide-react"
import { usePk } from "../lib/PKContext"
import { useAuth } from "../lib/AuthContext"
import UploadModal from "../components/UploadModal"
import DownloadModal from "../components/DownloadModal"
import ShareModal from "../components/ShareModal"

export default function Dashboard() {
	const [docs, setDocs] = useState([])
    let [ uploadOpen, setUploadOpen ] = useState(false)
	let [ downloadOpen, setDownloadOpen ] = useState(false)
	let [ shareOpen, setShareOpen ] = useState(false)

    let pkUploadRef = useRef(null)

	let { pk, setPk } = usePk()
	let { user, logout } = useAuth()

	const handleUpload = () => {
		setUploadOpen(true)
	}

	const handlePkUpload = (e) => {
        if (e.target.files.length == 0) return

        let reader = new FileReader()
        reader.addEventListener("load", () => setPk(reader.result), false)
        reader.readAsText(e.target.files[0])
	}

	async function getData () {        
		let res = await fetch("http://localhost:8000/documents", {
			headers: { 'Content-Type': 'application/json', 'Authorization': user.token },
		})

		let data = await res.json()
		setDocs(data || [])
	}

	useEffect(() => {
		getData()
	}, [ uploadOpen, shareOpen ])

	function handleDownload (index) {
		setDownloadOpen(docs[index])
	}

	async function handleCancel (index) {
		let res = await fetch(`http://localhost:8000/cancel/${docs[index].id}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': user.token }
        })

		alert("Share successfully cancelled")
		getData()
	}

	function handleShare (index) {
		setShareOpen(docs[index])
	}

	let heading = "Dashboard"
	if (user.role == "doctor") heading = "Documents Shared with You (Doctor)"
	if (user.role == "patient") heading = "Your Documents (Patient)"
	if (user.role == "lab") heading = "Documents Uploaded (Lab)"

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="flex justify-between items-center mb-10">
				<h1 className="text-2xl font-bold">{heading}</h1>
				<div className="flex items-center gap-2">
					{user.role != "lab" ? (
                            pk
                            ?
                            <div className="bg-slate-300 text-slate-800 rounded-full px-3 py-1 flex gap-2 items-center max-w-[200px]">
                                <Key size={18} className="shrink-0"/>
                                <p className="whitespace-nowrap  text-ellipsis overflow-hidden">{pk}</p>
                            </div>
                            :
                            <button
                                onClick={() => pkUploadRef.current.click()}
                                className="cursor-pointer flex items-center gap-2 px-4 py-1 border rounded-lg hover:bg-gray-200 duration-200"
                            >
                                <input hidden type="file" name="" id="" ref={pkUploadRef} onChange={handlePkUpload} />
                                <Key size={18} /> Upload Private Key
                            </button>
					) : null}
					<button onClick={logout} className="cursor-pointer flex items-center gap-2 px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 duration-200">
						<LogOut size={18} /> Logout
					</button>
				</div>
			</div>
			{user.role == "lab" ? (
				<div className="mt-6 mb-6 text-center">
					<button
						onClick={handleUpload}
						className="flex gap-2 items-center px-4 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 duration-200 cursor-pointer"
					>
						<Upload size={18} /> Upload File
					</button>
				</div>
			) : null}
			<div className="bg-white p-4 rounded-xl shadow-md">
				<table className="w-full border-collapse">
					<thead>
						<tr className="border-b">
							<th className="text-left p-2">File Name</th>
							<th className="text-left p-2">Owner</th>
							<th className="text-left p-2">Uploaded By</th>
							<th className="text-left p-2">Shared To</th>
							<th className="text-right p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{docs.map((doc, index) => (
							<tr key={index} className="border-b">
								<td className="p-2">{doc.filename}</td>
								<td className="p-2">{doc.owner}</td>
								<td className="p-2">{doc.uploaded_by}</td>
								<td className="p-2 flex gap-2 items-center">{doc.shared_to} {doc.shared_to && user.role == "patient" && <CircleOff size={20} onClick={() => handleCancel(index)} className="cursor-pointer"/>}</td>
								<td className="p-2 text-right">
									{
										(user.role == "patient" || user.role == "doctor") &&
										<button onClick={() => handleDownload(index)} className="p-2 cursor-pointer hover:bg-gray-200 rounded">
											<Download className="h-5 w-5" />
										</button>
									}
									{!doc.shared_to && user.role == "patient" &&
										<button className="p-2 cursor-pointer hover:bg-gray-200 rounded ml-2">
											<Share2 onClick={() => handleShare(index)} className="h-5 w-5" />
										</button>
									}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
            {
                uploadOpen && <UploadModal closeModal={() => setUploadOpen(false)} />
            }
            {
                downloadOpen && <DownloadModal doc={downloadOpen} shared={user.role == "doctor"} closeModal={() => setDownloadOpen(false)} />
            }
            {
                shareOpen && <ShareModal doc={shareOpen} closeModal={() => setShareOpen(false)} />
            }
		</div>
	)
}
