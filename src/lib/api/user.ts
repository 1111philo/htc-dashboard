/** User-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset, trimStringValues } from "../utils";

export async function addUser(
  u: Partial<User> & { password: string }
): Promise<number | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/addUser",
      options: { body: { ...(u as FormData) } },
    }).response;
    const { user_id } = (await response.body.json()) as AddUserAPIResponse;
    return user_id;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateUser(u: Partial<User>): Promise<boolean> {
  trimStringValues(u);
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/updateUser",
      options: { body: { ...u } },
    }).response;
    const { success } = (await response.body.json()) as SuccessResponse;
    return success;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function deleteUser(id): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/deleteUser",
      options: { body: { user_id: id } },
    }).response;
    const { success } = (await response.body.json()) as SuccessResponse;
    return success;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/** THIS WORKS DUE TO A HACK that compensates for the API not accepting user_id key in the request body */
export async function getUser(sub: string): Promise<User | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { sub } },
  }).response;
  const usersResponse = (await response.body.json()) as GetUsersAPIResponse;
  // const [user] = usersResponse;
  // HACK UNTIL API WORKS TO GET A SINGLE USER
  const user = usersResponse.find((u) => u.sub === sub) ?? null;
  return user;
}

/** NOTE: 25.01.30 - page number and limit do nothing as the api is not expecting them yet */
export async function getUsers(
  pageNum: number,
  limit = 10
): Promise<GetUsersAPIResponse> {
  const offset = pageOffset(pageNum);
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { offset, limit } },
  }).response;
  const usersResponse = (await response.body.json()) as GetUsersAPIResponse;
  return usersResponse;
}

/** Get users with search query - first, last, dob, id. */
export async function getUsersWithQuery(query): Promise<GetUsersAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { query, offset: 0, limit: 50_000 } },
  }).response;
  const usersResponse = (await response.body.json()) as GetUsersAPIResponse;
  return usersResponse;
}
