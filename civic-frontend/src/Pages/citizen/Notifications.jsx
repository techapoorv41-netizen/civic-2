import React from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/helpers";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="min-h-screen bg-govLight py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-govNavy tracking-tight flex items-center gap-2">
              <Bell className="text-govOrange" size={24} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-govOrange text-white font-bold shadow-sm">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs text-govText mt-1">
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
          <div className="p-12 text-center text-xs text-govText bg-white rounded-3xl border border-slate-200">
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
                    ? "bg-white/80 border-slate-200 opacity-90"
                    : "bg-white border-2 border-govOrange/30 shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-govOrange animate-ping" />
                    )}
                    <h3 className="font-bold text-sm text-govNavy">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-xs text-govText">{n.message}</p>
                  <p className="text-[10px] text-govText/60">{formatDate(n.createdAt)}</p>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-govSlate hover:text-govOrange shrink-0 transition-colors"
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
