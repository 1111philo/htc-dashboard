/** Guest-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addGuest(g: Partial<Guest>): Promise<number | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/addGuest",
    options: { body: { ...(g as FormData) } },
  }).response;
  const { guest_id }: { guest_id: number } = await response.body.json();
  return guest_id;
}

export async function deleteGuest(id): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/deleteGuest",
      options: { body: { guest_id: id }},
    }).response;
    const { success } = (await response.body.json()) as SuccessResponse
    return success;
  } catch (err) {
    console.error(err)
    return false
  }
}

export async function getGuestData(id: number): Promise<GuestDataAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getGuestData",
    options: { body: { guest_id: id } },
  }).response;
  const guestResponse = (await response.body.json()) as GuestDataAPIResponse;
  return guestResponse;
}

export async function getGuests(
  pageNum: number,
  limit = 10
): Promise<GuestsAPIResponse> {
  const offset = pageOffset(pageNum);
  const response = await API.post({
    apiName: "auth",
    path: "/getGuests",
    options: { body: { offset, limit } },
  }).response;
  const guestsResponse = (await response.body.json()) as GuestsAPIResponse;
  return guestsResponse;
}

/** Get guests with search query - first, last, dob, id. */
export async function getGuestsWithQuery(query): Promise<GuestsAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getGuests",
    options: { body: { query, offset: 0, limit: 50_000 } },
  }).response;
  const guestsResponse = (await response.body.json()) as GuestsAPIResponse;
  return guestsResponse;
}
