/** User-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addUser(g: Partial<User>): Promise<number | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/addUser",
    options: { body: { ...(g as FormData) } },
  }).response;
  const { user_id } = (await response.body.json()) as AddUserAPIResponse;
  return user_id;
}

/** THIS WORKS DUE TO A HACK that compensates for the API not accepting user_id key in the request body */
export async function getUser(userId: number): Promise<User | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { user_id: userId } },
  }).response;
  const usersResponse = (await response.body.json()) as GetUsersAPIResponse;
  // const [user] = usersResponse;
  // HACK UNTIL API WORKS TO GET A SINGLE USER
  const user = usersResponse.find((u) => u.user_id === userId) ?? null;
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
