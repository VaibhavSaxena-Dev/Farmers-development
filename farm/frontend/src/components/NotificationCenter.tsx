import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpeechButton } from "@/components/ui/speech-button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationApi } from "@/Backend/api/todoApi";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Volume2, 
  VolumeX,
  Clock,
  MapPin,
  Calendar,
  User,
  Activity
} from "lucide-react";

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type NotificationKind =
  | 'disease_alert'
  | 'reminder'
  | 'system'
  | 'marketplace'
  | 'payment'
  | 'due_reminder'
  | 'overdue'
  | 'important_created'
  | 'voice_announcement';

interface Notification {
  id: string;
  type: NotificationKind;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  location?: string;
  farmId?: string;
  actionRequired?: boolean;
  metadata?: Record<string, unknown> | null;
}

interface ApiNotification {
  _id: string;
  type?: NotificationKind;
  priority?: NotificationPriority;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  metadata?: Record<string, unknown> | null;
  todoId?: Record<string, unknown> | null;
  farmId?: string;
  location?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const spokenNotificationsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await notificationApi.getAll(selectedTab === "unread"); // Pass unreadOnly parameter
      const list: ApiNotification[] = Array.isArray(data) ? (data as ApiNotification[]) : [];
      const mapped: Notification[] = list.map((item) => {
        const metadata: Record<string, unknown> | null = item.metadata ?? item.todoId ?? null;
        const farmIdFromMetadata =
          metadata && typeof metadata['farmId'] === 'string'
            ? (metadata['farmId'] as string)
            : undefined;
        const locationFromMetadata =
          metadata && typeof metadata['location'] === 'string'
            ? (metadata['location'] as string)
            : undefined;

        return {
          id: item._id,
          type: item.type ?? 'system',
          priority: item.priority ?? 'medium',
          title: item.title ?? 'Notification',
          message: item.message ?? '',
          timestamp: new Date(item.createdAt ?? Date.now()),
          isRead: !!item.isRead,
          isImportant: item.priority === 'high' || item.priority === 'urgent',
          farmId: farmIdFromMetadata ?? item.farmId,
          location: locationFromMetadata ?? item.location,
          metadata,
          actionRequired: item.priority === 'high' || item.priority === 'urgent'
        };
      });
      setNotifications(mapped);
    } catch (error: unknown) {
      console.error("Failed to load notifications", error);
      if (error instanceof Error) {
        setLoadError(error.message);
      } else {
        setLoadError('Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, selectedTab]);

  useEffect(() => {
    if (!isOpen) {
      spokenNotificationsRef.current.clear();
    }
  }, [isOpen]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (selectedTab === "all") return true;
      if (selectedTab === "unread") return !notification.isRead;
      if (selectedTab === "important") return notification.isImportant;
      return notification.type === selectedTab;
    });
  }, [notifications, selectedTab]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disease_alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'reminder': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'system': return <Activity className="w-5 h-5 text-purple-500" />;
      case 'marketplace': return <Bell className="w-5 h-5 text-green-500" />;
      case 'payment': return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    spokenNotificationsRef.current.delete(notificationId);
    notificationApi.markAsRead(notificationId).catch((error) => {
      console.error("Failed to mark notification as read", error);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    spokenNotificationsRef.current.clear();
    notificationApi.markAllAsRead().catch((error) => {
      console.error("Failed to mark notifications as read", error);
    });
    toast({
      title: t('notificationsToastAllReadTitle'),
      description: t('notificationsToastAllReadDescription'),
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    notificationApi.delete(notificationId).catch((error) => {
      console.error("Failed to delete notification", error);
    });
    toast({
      title: t('notificationsToastDeletedTitle'),
      description: t('notificationsToastDeletedDescription'),
    });
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    handleVoiceAnnouncement(notification.message);
  };

  const handleVoiceAnnouncement = useCallback((text: string) => {
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, [isVoiceEnabled]);

  useEffect(() => {
    if (!isVoiceEnabled && typeof window !== "undefined" && 'speechSynthesis' in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    }
  }, [isVoiceEnabled]);

  useEffect(() => {
    if (!isVoiceEnabled) return;
    notifications.forEach((notification) => {
      const shouldAnnounce = !notification.isRead && (notification.priority === 'high' || notification.priority === 'urgent');
      if (shouldAnnounce && !spokenNotificationsRef.current.has(notification.id)) {
        spokenNotificationsRef.current.add(notification.id);
        handleVoiceAnnouncement(notification.message);
      }
    });
  }, [notifications, isVoiceEnabled, handleVoiceAnnouncement]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('timeJustNow');
    if (diffInMinutes < 60) return t('timeMinutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('timeHoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('timeDaysAgo', { count: diffInDays });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bell className="w-6 h-6" />
                {t('notificationsTitle')}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {t('notificationsSubtitle')}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                title={isVoiceEnabled ? t('notificationsVoiceDisable') : t('notificationsVoiceEnable')}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                {t('notificationsMarkAll')}
              </Button>
            </div>
          </div>
          {loadError && (
            <div className="mt-2 text-sm text-destructive">
              {loadError}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                {t('notificationsTabAll')}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                {t('notificationsTabUnread')}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="important" className="flex items-center gap-2">
                {t('notificationsTabImportant')}
                {importantCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {importantCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="disease_alert">{t('notificationsTabDisease')}</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="h-[calc(100%-60px)] overflow-y-auto">
              <div className="space-y-4">
                {isLoading ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <p className="text-muted-foreground">Loading notifications...</p>
                    </CardContent>
                  </Card>
                ) : filteredNotifications.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('notificationsEmptyTitle')}</h3>
                      <p className="text-muted-foreground">
                        {t('notificationsEmptyDescription')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.isRead ? 'border-l-4 border-l-primary bg-muted/50' : ''
                      }`}
                      onClick={() => handleViewDetails(notification)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getTypeIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">
                                    {notification.title}
                                  </h4>
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                                  {notification.isImportant && (
                                    <Badge variant="destructive" className="text-xs">
                                      {t('notificationsBadgeImportant')}
                                    </Badge>
                                  )}
                                  {!notification.isRead && (
                                    <Badge variant="secondary" className="text-xs">
                                      {t('notificationsBadgeNew')}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(notification.timestamp)}
                                  </div>
                                  {notification.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {notification.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <SpeechButton
                                  onTextCapture={(transcript) => {
                                    toast({
                                      title: t('notificationsTitle'),
                                      description: transcript,
                                    });
                                  }}
                                  enableVoiceOutput={false}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification.id);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification Details Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNotification && getTypeIcon(selectedNotification.type)}
                {selectedNotification?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedNotification?.message}
              </DialogDescription>
            </DialogHeader>

            {selectedNotification && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{t('notificationsPriorityLabel')}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getPriorityColor(selectedNotification.priority)} text-white`}
                    >
                      {selectedNotification.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">{t('notificationsTypeLabel')}</span>
                    <span className="ml-2 capitalize">{selectedNotification.type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t('notificationsTimeLabel')}</span>
                    <span className="ml-2">{formatTimeAgo(selectedNotification.timestamp)}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t('notificationsStatusLabel')}</span>
                    <Badge variant={selectedNotification.isRead ? "secondary" : "default"} className="ml-2">
                      {selectedNotification.isRead ? t('notificationsRead') : t('notificationsUnread')}
                    </Badge>
                  </div>
                </div>

                {selectedNotification.location && (
                  <div>
                    <span className="font-medium">{t('notificationsLocationLabel')}</span>
                    <span className="ml-2">{selectedNotification.location}</span>
                  </div>
                )}

                {selectedNotification.metadata && (
                  <div>
                    <span className="font-medium">{t('notificationsAdditionalInfo')}</span>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1"
                  >
                    {t('notificationsClose')}
                  </Button>
                  {selectedNotification.actionRequired && (
                    <Button className="flex-1">
                      {t('notificationsTakeAction')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
