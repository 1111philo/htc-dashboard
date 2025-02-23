/** Guest-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addGuest(g: Partial<Guest>): Promise<number | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/addGuest",
      options: { body: { ...(g as FormData) } },
    }).response;
    const { guest_id } =
      (await response.body.json()) as any as AddGuestAPIResponse;
    return guest_id;
  } catch (err) {
    console.error("There was a problem adding the guest:", err);
    return null;
  }
}

export async function updateGuest(g: Partial<Guest>): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/updateGuest",
      options: { body: { ...(g as FormData) } },
    }).response;
    const { success } = (await response.body.json()) as any as SuccessResponse;
    return success;
  } catch (err) {
    console.error("There was a problem updating the guest:", err);
    return false;
  }
}

export async function deleteGuest(id): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/deleteGuest",
      options: { body: { guest_id: id } },
    }).response;
    const { success } = (await response.body.json()) as any as SuccessResponse;
    return success;
  } catch (err) {
    console.error("There was a problem deleting the guest:", err);
    return false;
  }
}

export async function getGuestData(
  id: number
): Promise<GuestDataAPIResponse | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/getGuestData",
      options: { body: { guest_id: id } },
    }).response;
    return (await response.body.json()) as any as GuestDataAPIResponse;
  } catch (err) {
    console.error("There was a problem getting the guests's data:", err);
    return null;
  }
}

export async function getGuests(
  pageNum: number,
  limit = 10
): Promise<GuestsAPIResponse | null> {
  try {
    const offset = pageOffset(pageNum);
    const response = await API.post({
      apiName: "auth",
      path: "/getGuests",
      options: { body: { offset, limit } },
    }).response;
    return (await response.body.json()) as any as GuestsAPIResponse;
  } catch (err) {
    console.error("There was a problem getting guests:", err);
    return null;
  }
}

export async function getGuestsData(
  pageNum: number,
  limit = 10
): Promise<GuestsAPIResponse | null> {
  try {
    const offset = pageOffset(pageNum);
    const response = await API.post({
      apiName: "auth",
      path: "/getGuestsData",
      options: { body: { offset, limit } },
    }).response;
    return (await response.body.json()) as any as GuestsAPIResponse;
  } catch (err) {
    console.log("There was a problem getting guests data:", err);
    return null;
  }
}

/** Get guests with search query - first, last, dob, id. */
export async function getGuestsWithQuery(
  query
): Promise<GuestsAPIResponse | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/getGuests",
      options: { body: { query, offset: 0, limit: 50_000 } },
    }).response;
    return (await response.body.json()) as any as GuestsAPIResponse;
  } catch (err) {
    console.error("There was a problem querying guests:", err);
    return null;
  }
}
