/** API calls related to Visit */

import * as API from "aws-amplify/api";
import { pageOffset } from "../utils";

export async function addVisit(v: Partial<Visit>) {
  const response = await API.post({
    apiName: "auth",
    path: "/addVisit",
    options: { body: { ...(v as FormData) } },
  }).response;
  const { visit_id }: { visit_id: number } = await response.body.json();
  return visit_id;
}

export async function getVisits(pageNum, limit = 10) {
  const offset = pageOffset(pageNum)
  const response = await API.post({
    apiName: "auth",
    path: "/getVisits",
    options: { body: { offset, limit } },
  }).response;
  const visitsResponse = (await response.body.json()) as GetVisitsAPIResponse
  return visitsResponse
}