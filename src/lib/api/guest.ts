/** Guest-related API calls */

import * as API from "aws-amplify/api";

export async function addGuest(
  g: Partial<Guest>
): Promise<number | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/addGuest",
    options: { body: { ...(g as FormData) } },
  }).response;
  const { guest_id }: {guest_id: number} = (await response.body.json())
  return guest_id
}

export async function getGuest(id: number): Promise<GuestDataAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getGuestData",
    options: { body: { guest_id: id } },
  }).response;
  const guestResponse = (await response.body.json()) as GuestDataAPIResponse;
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
