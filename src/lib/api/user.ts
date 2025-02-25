/** User-related API calls */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addUser(
  u: Partial<User> & { password: string },
): Promise<number | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/addUser",
      options: { body: { ...u } },
    }).response;
    const { user_id } =
      (await response.body.json()) as any as AddUserAPIResponse;
    return user_id;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateUser(u: Partial<User>): Promise<boolean> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/updateUser",
      options: { body: { ...u } },
    }).response;
    const { success } = (await response.body.json()) as any as SuccessResponse;
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
    const { success } = (await response.body.json()) as any as SuccessResponse;
    return success;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getUserById(user_id: number): Promise<User | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/getUser",
      options: { body: { user_id } },
    }).response;
    const getUserResp =
      (await response.body.json()) as any as GetUserAPIResponse;
    const { error, ...user } = getUserResp;
    if (error) throw new Error(error);
    return user;
  } catch (err) {
    console.error(`There was a problem getting the user:`, err);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await API.post({
      apiName: "auth",
      path: "/getUser",
      options: { body: { email } },
    }).response;
    const getUserResp =
      (await response.body.json()) as any as GetUserAPIResponse;
    const { error, ...user } = getUserResp;
    if (error) throw new Error(error);
    return user;
  } catch (err) {
    console.error(`There was a problem getting the user:`, err);
    return null;
  }
}

export async function getUsers(
  pageNum: number,
  limit = 10,
): Promise<GetUsersAPIResponse> {
  const offset = pageOffset(pageNum);
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { offset, limit } },
  }).response;
  const usersResponse =
    (await response.body.json()) as any as GetUsersAPIResponse;
  return usersResponse;
}

/** Get users with search query - first, last, dob, id. */
export async function getUsersWithQuery(query): Promise<GetUsersAPIResponse> {
  const response = await API.post({
    apiName: "auth",
    path: "/getUsers",
    options: { body: { query, offset: 0, limit: 50_000 } },
  }).response;
  const usersResponse =
    (await response.body.json()) as any as GetUsersAPIResponse;
  return usersResponse;
}
