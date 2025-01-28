/** Guest-related API calls */

import * as API from "aws-amplify/api";

export async function getGuest(guestId: number): Promise<GuestDataAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getGuestData",
    options: { body: { guest_id: guestId } },
  }).response;
  const guestResponse =
    (await response.body.json()) as GuestDataAPIResponse;
  return guestResponse;
}
export async function getGuests() {
  const response = await API.post({
    apiName: "auth",
    path: "/getGuests",
  }).response;
  const guestsResponse = (await response.body.json()) as GuestsAPIResponse;
  return guestsResponse;
}
