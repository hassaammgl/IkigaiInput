import LoginPage from "@/pages/Auth";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
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
		path: "/editor",
		element: (
				<Editor />
		),
	},
	{
		path: "*",
		element: <NotFound/>,
	},
];

export default routes;
