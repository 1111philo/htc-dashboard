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
    console.error(err)
    return false
  }
}
