import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createBrowserRouter } from "react-router";
import routes from "@/routes";
import { Toaster } from "sonner";

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <div>App</div>
  )
}

export default App