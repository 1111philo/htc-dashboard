/** API calls related to Visit */

import * as API from "aws-amplify/api";

export async function addVisit(v: Partial<Visit>) {
  const response = await API.post({
      apiName: "auth",
      path: "/addVisit",
      options: { body: { ...(v as FormData) } },
    }).response;
    const { visit_id }: {visit_id: number} = (await response.body.json())
    return visit_id
}
