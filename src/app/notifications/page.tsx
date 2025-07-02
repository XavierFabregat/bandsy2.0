import { getUserNotifications } from "@/server/notifications/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "../../server/queries";
import NotificationComponent from "./_components/notification";

export default async function NotificationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const notifications = await getUserNotifications(user.id, {
    limit: 100,
    offset: 0,
  });

  return (
    <div>
      {notifications.map((notification) => {
        return (
          <NotificationComponent
            key={notification.id}
            notification={notification}
          />
        );
      })}
    </div>
  );
}
