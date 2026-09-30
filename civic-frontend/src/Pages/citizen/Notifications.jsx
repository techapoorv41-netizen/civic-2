import React from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/helpers";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Bell className="text-teal-600" size={24} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time updates regarding your submitted tickets and assigned actions.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCheck size={16} />
              Mark All Read
            </Button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            You have no notifications at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  n.isRead
                    ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80"
                    : "bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/60 shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    )}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{n.message}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</p>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline shrink-0"
                  >
                    <span>View Detail</span>
                    <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
