import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createBrowserRouter } from "react-router";
import routes from "@/routes";
import { Toaster } from "sonner";

const router = createBrowserRouter(routes);

const App = () => {
  return (
   <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
			<Toaster position="top-center" closeButton richColors />
		</ThemeProvider>
  )
}

export default App