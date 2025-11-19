import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkProject {
  id: string;
  title: string;
  description: string;
  categories: string[];
  year: string | null;
  thumbnail: string | null;
  media_type: 'image' | 'video' | null;
  credits: any;
  images: any;
  video_url: string | null;
  slug: string | null;
  display_order: number;
}

export const WorkProjectsManager = () => {
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [] as string[],
    year: '',
    thumbnail: '',
    media_type: 'image' as 'image' | 'video' | null,
    credits: '',
    images: '',
    video_url: '',
    slug: '',
    display_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('work_projects')
        .select('*')
        .order('display_order')
        .returns<any[]>();

      if (error) throw error;
      
      // Ensure all fields are present, with defaults for new fields
      const projectsWithDefaults = (data || []).map(project => ({
        ...project,
        year: project.year || null,
        thumbnail: project.thumbnail || '',
        media_type: project.media_type || 'image',
        credits: project.credits || [],
        images: project.images || [],
        video_url: project.video_url || null,
        slug: project.slug || null,
        categories: project.categories || [],
      }));
      
      setProjects(projectsWithDefaults as WorkProject[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch work projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse JSON fields
      let creditsData = [];
      let imagesData = [];
      
      try {
        creditsData = formData.credits ? JSON.parse(formData.credits) : [];
      } catch {
        creditsData = formData.credits ? [{ label: 'Error', value: 'Invalid JSON' }] : [];
      }
      
      try {
        imagesData = formData.images ? JSON.parse(formData.images) : [];
      } catch {
        imagesData = formData.images ? [] : [];
      }

      const dataToSubmit = {
        ...formData,
        credits: creditsData,
        images: imagesData,
        // Ensure null values are handled
        year: formData.year || null,
        thumbnail: formData.thumbnail || null,
        video_url: formData.video_url || null,
        slug: formData.slug || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('work_projects')
          .update(dataToSubmit)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Success", description: "Project updated" });
      } else {
        const { error } = await supabase
          .from('work_projects')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({ title: "Success", description: "Project added" });
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (project: WorkProject) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      categories: project.categories || [],
      year: project.year || '',
      thumbnail: project.thumbnail || '',
      media_type: project.media_type || 'image',
      credits: typeof project.credits === 'string' ? project.credits : JSON.stringify(project.credits || []),
      images: typeof project.images === 'string' ? project.images : JSON.stringify(project.images || []),
      video_url: project.video_url || '',
      slug: project.slug || '',
      display_order: project.display_order
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('work_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Project deleted" });
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      categories: [],
      year: '',
      thumbnail: '',
      media_type: 'image' as 'image' | 'video' | null,
      credits: '',
      images: '',
      video_url: '',
      slug: '',
      display_order: 0
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-[#090909]/20 rounded-lg bg-white">
        <h3 className="text-xl font-semibold text-[#090909]">
          {editingId ? 'Edit' : 'Add'} Work Project
        </h3>
        
        <div>
          <Label htmlFor="title" className="text-[#090909]">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label className="text-[#090909]">Categories</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              'Branding',
              'Photography',
              'Film Production',
              'Commercial',
              'Music Video',
              'Web Design',
              'Other',
            ].map((cat) => {
              const active = formData.categories.includes(cat);
              return (
                <Button
                  key={cat}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      categories: active
                        ? formData.categories.filter((c) => c !== cat)
                        : [...formData.categories, cat],
                    });
                  }}
                  className="h-8 px-3"
                >
                  {cat}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-[#090909]">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        {/* Image URL removed; use Thumbnail only */}

        <div>
          <Label htmlFor="year" className="text-[#090909]">Year</Label>
          <Input
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="e.g., 2024"
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="thumbnail" className="text-[#090909]">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="Optional: different thumbnail"
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="media_type" className="text-[#090909]">Media Type</Label>
          <Select
            value={formData.media_type || 'image'}
            onValueChange={(value) => setFormData({ ...formData, media_type: value as 'image' | 'video' | null })}
          >
            <SelectTrigger className="bg-white text-[#090909] border-[#090909]/20">
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="credits" className="text-[#090909]">Credits (JSON Array)</Label>
          <Textarea
            id="credits"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            placeholder='[{"label":"Director","value":"John Doe"},{"label":"Producer","value":"Jane Smith"}]'
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="images" className="text-[#090909]">Images Array (JSON)</Label>
          <Textarea
            id="images"
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            placeholder='["https://example.com/image1.jpg","https://example.com/image2.jpg"]'
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="video_url" className="text-[#090909]">Video URL</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/123456789"
            className="bg-white text-[#090909] border-[#090909]/20"
          />
        </div>

        <div>
          <Label htmlFor="slug" className="text-[#090909]">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="url-friendly-slug"
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
        <h3 className="text-xl font-semibold text-[#090909]">Work Projects</h3>
        {projects.map((project) => (
          <div key={project.id} className="p-4 border border-[#090909]/20 rounded-lg flex justify-between items-start bg-white">
            <div>
              <h4 className="font-semibold text-[#090909]">{project.title}</h4>
              <p className="text-sm text-[#090909]/60">{(project.categories || []).join(', ')}</p>
              <p className="text-sm mt-2 text-[#090909]">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
