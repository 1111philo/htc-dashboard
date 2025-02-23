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
    const { success } = (await response.body.json()) as SuccessResponse;
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
      (await response.body.json()) as AddGuestNotificationAPIResponse;
    return notification_id;
  } catch (err) {
    console.error("There was a problem adding the notification:", err);
    return null;
  }
}
