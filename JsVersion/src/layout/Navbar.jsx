import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { PenTool, LogOut, User, BarChart3 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Shibui Notes
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Popover>
                  <PopoverTrigger>
                    <div className="flex items-center gap-2 rounded-full border-2 p-2 border-amber-50/40">
                      <User className="w-4 h-4" />
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
                    <Button asChild className={"border"} variant="ghost">
                      <Link to="/dashboard">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button asChild className={"border"} variant="ghost">
                      <Link to="/editor">
                        <PenTool className="w-4 h-4 mr-2" />
                        Write
                      </Link>
                    </Button>
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
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
