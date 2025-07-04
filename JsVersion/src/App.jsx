import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider, createBrowserRouter } from "react-router";
import routes from "@/routes";
import { Toaster } from "sonner";
import { AuthInitializer } from "@/components/shared/AuthInit";

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthInitializer />
      <RouterProvider router={router} />
      <Toaster position="top-center" closeButton richColors />
    </ThemeProvider>
  );
};

export default App;
