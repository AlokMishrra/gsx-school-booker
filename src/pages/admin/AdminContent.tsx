import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, HelpCircle, Shield, FileCheck, RefreshCw, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AdminContent = () => {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const contentPages = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: Shield,
      route: '/privacy-policy',
      category: 'Legal',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Data protection and privacy information'
    },
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      icon: FileCheck,
      route: '/terms-of-service',
      category: 'Legal',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Terms and conditions for using the platform'
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      icon: RefreshCw,
      route: '/refund-policy',
      category: 'Legal',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Cancellation and refund policies'
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      icon: Mail,
      route: '/contact-us',
      category: 'Support',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Contact form and information'
    },
    {
      id: 'help-center',
      title: 'Help Center',
      icon: HelpCircle,
      route: '/help-center',
      category: 'Support',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Help articles and documentation'
    },
    {
      id: 'faqs',
      title: 'FAQs',
      icon: FileText,
      route: '/faqs',
      category: 'Support',
      lastUpdated: 'February 16, 2026',
      status: 'published',
      description: 'Frequently asked questions'
    }
  ];

  const stats = {
    totalPages: contentPages.length,
    legalPages: contentPages.filter(p => p.category === 'Legal').length,
    supportPages: contentPages.filter(p => p.category === 'Support').length,
    published: contentPages.filter(p => p.status === 'published').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage legal and support pages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-fade-in hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
                <p className="text-sm text-muted-foreground">Total Pages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: '50ms' }}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.legalPages}</p>
                <p className="text-sm text-muted-foreground">Legal Pages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: '100ms' }}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.supportPages}</p>
                <p className="text-sm text-muted-foreground">Support Pages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: '150ms' }}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <FileCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Pages */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contentPages.filter(p => p.category === 'Legal').map((page, index) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <page.icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{page.title}</h3>
                          <Badge className={getStatusColor(page.status)} variant="outline">
                            {page.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{page.description}</p>
                    <div className="text-xs text-muted-foreground mb-4">
                      Last updated: {page.lastUpdated}
                    </div>
                    <div className="flex gap-2">
                      <Link to={page.route} target="_blank" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Pages */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contentPages.filter(p => p.category === 'Support').map((page, index) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <page.icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{page.title}</h3>
                          <Badge className={getStatusColor(page.status)} variant="outline">
                            {page.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{page.description}</p>
                    <div className="text-xs text-muted-foreground mb-4">
                      Last updated: {page.lastUpdated}
                    </div>
                    <div className="flex gap-2">
                      <Link to={page.route} target="_blank" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Make changes to {contentPages.find(p => p.id === selectedPage)?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <input
                  type="text"
                  defaultValue={contentPages.find(p => p.id === selectedPage)?.title}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <input
                  type="text"
                  defaultValue={contentPages.find(p => p.id === selectedPage)?.description}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <textarea
                  rows={15}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="Edit page content here..."
                  defaultValue="This is a placeholder for the content editor. In a production environment, you would integrate a rich text editor like TinyMCE, Quill, or a markdown editor."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedPage(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert('Content saved successfully!');
                  setSelectedPage(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
