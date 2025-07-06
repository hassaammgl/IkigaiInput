import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { PenTool, LogOut, User, BarChart3, AlignJustify,Lock } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";



const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuBar = [
  {
    icon: User,
    name: "Profile",
    _id: crypto.randomUUID(),
    link: `/profile/${user?.id}`,
  },
  {
    icon: PenTool,
    name: "Write",
    _id: crypto.randomUUID(),
    link: "/editor",
  },
  {
    icon: BarChart3,
    name: "Dashboard",
    _id: crypto.randomUUID(),
    link: "/dashboard",
  },
  {
    icon: Lock,
    name: "Secret",
    _id: crypto.randomUUID(),
    link: "/personal",
  },
];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            HanaWrites.
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Popover>
                  <PopoverTrigger>
                    <div className="flex items-center gap-2 rounded-full border-2 p-2 border-amber-50/40">
                      <AlignJustify className="w-4 h-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className={"flex flex-col gap-2"}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <ModeToggle />
                      </span>
                    </div>
                    {menuBar.map((i) => (
                      <Link
                        key={i._id}
                        className="flex justify-start items-center border rounded-sm p-2 hover:bg-accent"
                        to={i.link}
                      >
                        <i.icon className="w-4 h-4 mr-2" />
                        {i.name}
                      </Link>
                    ))}
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
