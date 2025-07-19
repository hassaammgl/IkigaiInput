import LoginPage from "@/pages/Auth";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import NotFound from "@/pages/NotFound";
import BlogPost from "@/pages/BlogPost";
import Dashboard from "@/pages/Dashboard";
import AuthorProfile from "@/pages/AuthorProfile";
import Personal from "@/pages/Personal";

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
		path: "/profile/:id",
		element: (
				<AuthorProfile />
		),
	},
	{
		path: "/personal",
		element: (
				<Personal />
		),
	},
	{
		path: "/editor",
		element: (
				<Editor />
		),
	},
	{
		path: "/dashboard",
		element: (
				<Dashboard />
		),
	},
	{
		path: "/editor/:id",
		element: (
				<Editor />
		),
	},
	{
		path: "/post/:slug",
		element: (
				<BlogPost />
		),
	},
	{
		path: "*",
		element: <NotFound/>,
	},
];

export default routes;
