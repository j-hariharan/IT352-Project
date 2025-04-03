import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import "./index.css"
import App from "./App.jsx"
import { AuthProvider } from "./lib/AuthContext.jsx"
import { PKProvider } from "./lib/PKContext.jsx"

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<PKProvider>
					<App />
				</PKProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
)
