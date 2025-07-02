import LoginPage from "@/pages/Auth";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

const routes = [
	{
		path: "/auth",
		element: <LoginPage />,
	},
	{
		path: "/",
		element: (
				<Home />
		),
	},
	{
		path: "*",
		element: <NotFound/>,
	},
];

export default routes;
