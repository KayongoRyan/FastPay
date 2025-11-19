import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  display_order: number;
}

export const TeamMembersManager = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    display_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('team_members')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Success", description: "Team member updated" });
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Team member added" });
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save team member",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url,
      display_order: member.display_order
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Team member deleted" });
      fetchMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      display_order: 0
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-[#090909]/20 rounded-lg bg-white">
        <h3 className="text-xl font-semibold text-[#090909]">
          {editingId ? 'Edit' : 'Add'} Team Member
        </h3>
        
        <div>
          <Label htmlFor="name" className="text-[#090909]">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="role" className="text-[#090909]">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="bio" className="text-[#090909]">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="image_url" className="text-[#090909]">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="display_order" className="text-[#090909]">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#090909]">Team Members</h3>
        {members.map((member) => (
          <div key={member.id} className="p-4 border border-[#090909]/20 rounded-lg flex justify-between items-start bg-white">
            <div>
              <h4 className="font-semibold text-[#090909]">{member.name}</h4>
              <p className="text-sm text-[#090909]/60">{member.role}</p>
              <p className="text-sm mt-2 text-[#090909]">{member.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
