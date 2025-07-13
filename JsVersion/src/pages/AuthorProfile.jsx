import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase";
import { useAuth } from "@/store/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router";

const AuthorProfile = () => {
  const { user } = useAuth();
  const { success, error: err } = useToast();

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      console.log(user);
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, bio")
      .eq("id", user.id)
      .single();
    console.log("data: ", data);

    if (error) {
      console.error("Error fetching profile:", error.message);
    } else {
      setFormData({
        username: data.username || "",
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...formData,
      created_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error.message);
      err("Update failed");
    } else {
      success("Profile updated successfully!");
      navigate("/")
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>{user.email} Profile</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>
                    {formData.username || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Username</Label>
                <Input
                  name="username"
                  id="display_name"
                  placeholder="e.g., Rat Dev"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  name="avatar_url"
                  id="avatar_url"
                  placeholder="https://your-image-link.com"
                  value={formData.avatar_url}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 mb-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  name="bio"
                  id="bio"
                  placeholder="Tell us something about you..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthorProfile;
