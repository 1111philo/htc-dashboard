/** Notification-related API calls  */

import * as API from "aws-amplify/api";

export async function toggleGuestNotificationStatus(
  notificationId: number
): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/toggleGuestNotificationStatus",
      options: { body: { notification_id: notificationId } },
    }).response;
    const { success } = (await response.body.json()) as any as SuccessResponse;
    return success;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function addGuestNotification(
  n: GuestNotification
): Promise<number | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/addGuestNotification",
      options: { body: { ...n, status: "Active" } },
    }).response;
    const { notification_id } =
      (await response.body.json()) as any as AddGuestNotificationAPIResponse;
    return notification_id;
  } catch (err) {
    console.error("There was a problem adding the notification:", err);
    return null;
  }
}

export async function getGuestNotifications(
  guest_id: number
): Promise<GuestNotificationsAPIResponse | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/getGuestNotifications",
      options: { body: { guest_id } },
    }).response;
    return (await response.body.json()) as any as GuestNotificationsAPIResponse;
  } catch (err) {
    console.error(
      "There was a problem getting the guests's notifications:",
      err
    );
    return null;
  }
}
