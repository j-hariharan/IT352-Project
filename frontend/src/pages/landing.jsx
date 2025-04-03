import { Link } from "react-router"

export default function LandingPage () {
    return (
        <div className="landing">
            <br /><br />
            <h1>DEPARTMENT OF INFORMATION TECHNOLOGY</h1>
            <h2>NATIONAL INSTITUTE OF TECHNOLOGY KARNATAKA, SURATHKAL - 575025</h2>
            <h3>Information Assurance and Security (IT352) Course Project</h3>
            <h3>Secure File Storage Platform using SSE</h3>
            <br/>
            <h3>Carried Out by</h3>
            <h3>J. Hariharan (221IT031)</h3>
            <h3>Jyotsana Achal (221IT032)</h3>
            <h3>During Academic Session January - April 2025</h3>
            <br /><br />
            <Link to="/dashboard" className="bg-blue-300 rounded py-2 px-10 block mx-auto w-fit text-xl font-medium">
                Go to Application
            </Link>
        </div>
    )
}