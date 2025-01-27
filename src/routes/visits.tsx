import { createFileRoute } from "@tanstack/react-router";

import * as API from 'aws-amplify/api';
import { readableDateTime } from "../../src/lib/utils";

import { Table } from "react-bootstrap";

export const Route = createFileRoute("/visits")({
  component: VisitsView,
  loader: async () => {
    // fetch all visits
    const visits = await (
      await API.post({
        apiName: "auth",
        path: "/getVisits"
      }).response
    ).body.json()
    const sortedVisits = visits!.rows.sort((a, b) => a.created_at - b.created_at)

    return { sortedVisits }
  }
});

function VisitsView() {

  const { sortedVisits } = Route.useLoaderData();

  return (
    <>
      <h1>Visits</h1>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>Time Of Visit</th>
            <th>Guest ID</th>
            <th>Services</th>
          </tr>
        </thead>
        <tbody>
          {
            sortedVisits.map((visit, i) => {
              return (
                <tr key={i}>
                  <td>{ readableDateTime(visit.created_at) }</td>
                  <td>{ visit.guest_id }</td>
                  <td>services...</td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </>
  );
}
