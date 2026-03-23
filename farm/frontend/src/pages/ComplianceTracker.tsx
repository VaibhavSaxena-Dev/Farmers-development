import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SpeechButton } from "@/components/ui/speech-button";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Shield, 
  Award,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download
} from "lucide-react";

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: 'hygiene' | 'vaccination' | 'biosecurity' | 'documentation' | 'equipment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  notes?: string;
  attachments?: string[];
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface ComplianceTrackerProps {}

const ComplianceTracker = ({}: ComplianceTrackerProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ComplianceItem>>({
    title: "",
    description: "",
    category: "hygiene",
    priority: "medium",
    assignedTo: "",
    recurring: false,
    frequency: "monthly"
  });

  const mapLocale = (lang: string) => {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'kn':
        return 'kn-IN';
      default:
        return 'en-IN';
    }
  };

  // Sample compliance items
  useEffect(() => {
    const sampleItems: ComplianceItem[] = [
      {
        id: "1",
        title: t('complianceSample1Title'),
        description: t('complianceSample1Description'),
        category: "hygiene",
        priority: "high",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        status: "pending",
        assignedTo: "Farm Worker 1",
        recurring: true,
        frequency: "daily"
      },
      {
        id: "2",
        title: t('complianceSample2Title'),
        description: t('complianceSample2Description'),
        category: "vaccination",
        priority: "critical",
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        status: "overdue",
        assignedTo: "Veterinarian",
        notes: t('complianceSample2Description'),
        recurring: true,
        frequency: "monthly"
      },
      {
        id: "3",
        title: t('complianceSample3Title'),
        description: t('complianceSample3Description'),
        category: "biosecurity",
        priority: "medium",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        status: "in_progress",
        assignedTo: "Farm Manager",
        notes: "60%",
        recurring: true,
        frequency: "quarterly"
      },
      {
        id: "4",
        title: t('complianceSample4Title'),
        description: t('complianceSample4Description'),
        category: "equipment",
        priority: "medium",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        status: "pending",
        assignedTo: "Maintenance Team",
        recurring: true,
        frequency: "monthly"
      },
      {
        id: "5",
        title: t('complianceSample5Title'),
        description: t('complianceSample5Description'),
        category: "documentation",
        priority: "high",
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        status: "completed",
        assignedTo: "Farm Administrator",
        notes: t('complianceSample5Description'),
        recurring: true,
        frequency: "weekly"
      }
    ];
    setComplianceItems(sampleItems);
  }, [language, t]);

  const filteredItems = complianceItems.filter(item => {
    if (selectedTab === "all") return true;
    if (selectedTab === "overdue") return item.status === "overdue";
    if (selectedTab === "pending") return item.status === "pending";
    if (selectedTab === "completed") return item.status === "completed";
    return item.category === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hygiene': return <Shield className="w-4 h-4" />;
      case 'vaccination': return <Award className="w-4 h-4" />;
      case 'biosecurity': return <FileText className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'equipment': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateComplianceScore = () => {
    const totalItems = complianceItems.length;
    const completedItems = complianceItems.filter(item => item.status === 'completed').length;
    const overdueItems = complianceItems.filter(item => item.status === 'overdue').length;
    
    if (totalItems === 0) return 0;
    
    const score = ((completedItems - overdueItems) / totalItems) * 100;
    return Math.max(0, Math.min(100, score));
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.description) {
      toast({
        title: t('complianceToastValidationTitle'),
        description: t('complianceToastValidationDescription'),
        variant: "destructive"
      });
      return;
    }

    const item: ComplianceItem = {
      id: Date.now().toString(),
      title: newItem.title!,
      description: newItem.description!,
      category: newItem.category!,
      priority: newItem.priority!,
      dueDate: newItem.dueDate || new Date(),
      status: 'pending',
      assignedTo: newItem.assignedTo!,
      notes: newItem.notes,
      recurring: newItem.recurring || false,
      frequency: newItem.frequency
    };

    setComplianceItems(prev => [...prev, item]);
    setIsAddDialogOpen(false);
    setNewItem({
      title: "",
      description: "",
      category: "hygiene",
      priority: "medium",
      assignedTo: "",
      recurring: false,
      frequency: "monthly"
    });

    toast({
      title: t('complianceToastAddedTitle'),
      description: t('complianceToastAddedDescription'),
    });
  };

  const handleUpdateStatus = (itemId: string, newStatus: ComplianceItem['status']) => {
    setComplianceItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date() : undefined
            }
          : item
      )
    );

    toast({
      title: t('complianceToastStatusTitle'),
      description: t('complianceToastStatusDescription'),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setComplianceItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: t('complianceToastDeletedTitle'),
      description: t('complianceToastDeletedDescription'),
    });
  };

  const handleVoiceInput = (text: string) => {
    setNewItem(prev => ({ ...prev, description: text }));
    toast({
      title: t('voiceInputUpdatedTitle'),
      description: t('voiceInputUpdatedDescription', { text }),
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(mapLocale(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: ComplianceItem['status']) => {
    if (status === 'completed') return t('complianceScoreCompleted');
    if (status === 'pending') return t('complianceScorePending');
    if (status === 'overdue') return t('complianceScoreOverdue');
    if (status === 'in_progress') return t('complianceStatusInProgress');
    return status;
  };

  const complianceScore = calculateComplianceScore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('complianceTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('complianceSubtitle')}
          </p>
        </div>

        {/* Compliance Score Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t('complianceScoreTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{complianceScore.toFixed(0)}%</span>
                <Badge variant={complianceScore >= 80 ? "default" : complianceScore >= 60 ? "secondary" : "destructive"}>
                  {complianceScore >= 80 ? t('complianceScoreExcellent') : complianceScore >= 60 ? t('complianceScoreGood') : t('complianceScoreNeedsImprovement')}
                </Badge>
              </div>
              <Progress value={complianceScore} className="w-full" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    {complianceItems.filter(item => item.status === 'completed').length}
                  </div>
                  <div>{t('complianceScoreCompleted')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">
                    {complianceItems.filter(item => item.status === 'pending').length}
                  </div>
                  <div>{t('complianceScorePending')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">
                    {complianceItems.filter(item => item.status === 'overdue').length}
                  </div>
                  <div>{t('complianceScoreOverdue')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">{t('complianceTabAll')}</TabsTrigger>
              <TabsTrigger value="overdue">{t('complianceTabOverdue')}</TabsTrigger>
              <TabsTrigger value="pending">{t('complianceTabPending')}</TabsTrigger>
              <TabsTrigger value="completed">{t('complianceTabCompleted')}</TabsTrigger>
              <TabsTrigger value="hygiene">{t('complianceTabHygiene')}</TabsTrigger>
              <TabsTrigger value="vaccination">{t('complianceTabVaccination')}</TabsTrigger>
              <TabsTrigger value="biosecurity">{t('complianceTabBiosecurity')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t('complianceExport')}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('complianceAddItemButton')}
            </Button>
          </div>
        </div>

        {/* Compliance Items */}
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(item.category)}
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('complianceLabelDue')} {formatDate(item.dueDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('complianceLabelAssignedTo')} {item.assignedTo}
                      </div>
                      {item.recurring && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {t('complianceLabelFrequency')}: {item.frequency}
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>{t('complianceLabelNotes')}</strong> {item.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {item.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                    >
                      {t('complianceStatusStart')}
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, 'completed')}
                    >
                      {t('complianceStatusComplete')}
                    </Button>
                  )}
                  {item.status === 'overdue' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                    >
                      {t('complianceStatusResume')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('complianceEmptyTitle')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('complianceEmptyDescription')}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('complianceEmptyAction')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('complianceDialogAddTitle')}</DialogTitle>
            <DialogDescription>
              {t('complianceDialogAddDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('complianceFieldTitle')}</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('complianceFieldTitlePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('complianceFieldDescription')}</Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('complianceFieldDescriptionPlaceholder')}
                  className="flex-1"
                />
                <SpeechButton
                  onTextCapture={handleVoiceInput}
                  className="flex-shrink-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t('complianceFieldCategory')}</Label>
                <select
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="hygiene">{t('complianceTabHygiene')}</option>
                  <option value="vaccination">{t('complianceTabVaccination')}</option>
                  <option value="biosecurity">{t('complianceTabBiosecurity')}</option>
                  <option value="documentation">{t('complianceTabDocumentation')}</option>
                  <option value="equipment">{t('complianceTabEquipment')}</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">{t('complianceFieldPriority')}</Label>
                <select
                  id="priority"
                  value={newItem.priority}
                  onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="assignedTo">{t('complianceFieldAssignedTo')}</Label>
              <Input
                id="assignedTo"
                value={newItem.assignedTo}
                onChange={(e) => setNewItem(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder={t('complianceFieldAssignedToPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">{t('complianceFieldDueDate')}</Label>
              <Input
                id="dueDate"
                type="date"
                value={newItem.dueDate ? newItem.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={newItem.recurring}
                onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, recurring: !!checked }))}
              />
              <Label htmlFor="recurring">{t('complianceFieldRecurring')}</Label>
            </div>

            {newItem.recurring && (
              <div>
                <Label htmlFor="frequency">{t('complianceFieldFrequency')}</Label>
                <select
                  id="frequency"
                  value={newItem.frequency}
                  onChange={(e) => setNewItem(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="daily">{t('complianceFrequencyDaily')}</option>
                  <option value="weekly">{t('complianceFrequencyWeekly')}</option>
                  <option value="monthly">{t('complianceFrequencyMonthly')}</option>
                  <option value="quarterly">{t('complianceFrequencyQuarterly')}</option>
                  <option value="yearly">{t('complianceFrequencyYearly')}</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                {t('complianceDialogCancel')}
              </Button>
              <Button onClick={handleAddItem} className="flex-1">
                {t('complianceDialogSave')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceTracker;
