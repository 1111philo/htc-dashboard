/** User-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addUser(g: Partial<User>): Promise<number | null> {
  const response = await API.post({
    apiName: "auth",
    path: "/addUser",
    options: { body: { ...(g as FormData) } },
  }).response;
  const { user_id } = (await response.body.json()) as AddUserAPIResponse
  return user_id;
}

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


