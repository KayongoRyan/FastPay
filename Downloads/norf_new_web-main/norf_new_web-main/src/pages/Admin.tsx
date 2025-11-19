import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMembersManager } from '@/components/admin/TeamMembersManager';
import { WorkProjectsManager } from '@/components/admin/WorkProjectsManager';

const Admin = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#eee9e6]">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#090909]">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#090909]">{user?.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="work">Work Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <TeamMembersManager />
          </TabsContent>

          <TabsContent value="work">
            <WorkProjectsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
