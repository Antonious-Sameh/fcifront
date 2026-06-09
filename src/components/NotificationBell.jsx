import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext.jsx';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t('topbar.notifications')}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t('notifications.title')}</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-muted-foreground">
              {t('notifications.clear_all')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            notifications.map(notif => (
              <DropdownMenuItem key={notif.id} className={cn("flex flex-col items-start p-3 cursor-default", !notif.read && "bg-muted/50")}>
                <div className="flex justify-between w-full mb-1">
                  <span className={cn("text-sm", !notif.read && "font-medium")}>{notif.text}</span>
                </div>
                <div className="flex justify-between w-full items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notif.date).toLocaleDateString()}
                  </span>
                  {!notif.read && (
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }}>
                      {t('notifications.mark_read')}
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;