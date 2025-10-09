import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  creatorId: string;
}

interface Post {
  id: string;
  title: string;
  content?: string;
  type?: "discussion" | "offer" | "request" | "project";
  authorId: string;
  communityId: string;
  createdAt?: string;
}

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Community | null>(null);
  const [tab, setTab] = useState<"discussion" | "offer" | "request" | "project">("discussion");
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newCategory, setNewCategory] = useState("Composting & Organics");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/communities");
        const data = await res.json();
        setCommunities(data);
        setActive(data[0] || null);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!active) return;
      const res = await fetch(`/api/communities/${active.id}/posts?type=${tab}`);
      const data = await res.json();
      setPosts(data);
    })();
  }, [active?.id, tab]);

  const join = async (id: string) => {
    await fetch(`/api/communities/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "demo-user" }),
    });
  };

  const createPost = async () => {
    if (!active || !title.trim()) return;
    const res = await fetch(`/api/communities/${active.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type: tab, authorId: "demo-user" }),
    });
    if (res.ok) {
      setTitle("");
      setContent("");
      const updated = await fetch(`/api/communities/${active.id}/posts?type=${tab}`).then(r => r.json());
      setPosts(updated);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Communities</h1>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2"><Plus className="w-4 h-4" /> Create Community</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Community Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Textarea placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                <Input placeholder="Image URL (optional)" value={newImage} onChange={(e) => setNewImage(e.target.value)} />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Composting & Organics">♻️ Composting & Organics</SelectItem>
                    <SelectItem value="Glass & Plastic Reuse">🧱 Glass & Plastic Reuse</SelectItem>
                    <SelectItem value="Hospitality Waste Management">🍽 Hospitality Waste Management</SelectItem>
                    <SelectItem value="Textile & Fabric Recycling">🧵 Textile & Fabric Recycling</SelectItem>
                    <SelectItem value="Repair & Refurbishment Hub">⚙️ Repair & Refurbishment Hub</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    if (!newName.trim() || !newDesc.trim()) return;
                    const res = await fetch('/api/communities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName, description: newDesc, imageUrl: newImage || undefined, category: newCategory, creatorId: 'demo-user' })
                    });
                    if (res.ok) {
                      toast({ title: 'Community created successfully' });
                      setOpenCreate(false);
                      setNewName(''); setNewDesc(''); setNewImage('');
                      const data = await fetch('/api/communities').then(r => r.json());
                      setCommunities(data);
                      setActive(data[0] || null);
                    }
                  }}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {!active ? (
          <div>No communities yet.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {communities.map((c) => (
                <Card key={c.id} className={`p-4 cursor-pointer ${active?.id === c.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setActive(c)}>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="pt-2">
                    <Button size="sm" className="rounded-full" onClick={(e) => { e.stopPropagation(); join(c.id); }}>Join</Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList>
                    <TabsTrigger value="discussion">Discussions</TabsTrigger>
                    <TabsTrigger value="offer">Offers</TabsTrigger>
                    <TabsTrigger value="request">Requests</TabsTrigger>
                    <TabsTrigger value="project">Projects</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input placeholder="Type" value={tab} readOnly className="md:col-span-1" />
                  <Button className="rounded-full md:col-span-1" onClick={createPost}>Post</Button>
                  <Textarea placeholder="Write details…" value={content} onChange={(e) => setContent(e.target.value)} className="md:col-span-3" />
                </div>
              </Card>

              <div className="space-y-3">
                {posts.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{p.title}</h4>
                      <span className="text-xs rounded-full px-2 py-0.5 border">{p.type || 'discussion'}</span>
                    </div>
                    {p.content && <p className="text-sm text-muted-foreground mt-1">{p.content}</p>}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
