import { createFileRoute, useNavigate } from "@tanstack/react-router";

import * as API from 'aws-amplify/api';
import { readableDateTime } from "../../src/lib/utils";

import { Badge, Table } from "react-bootstrap";

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
  const navigate = useNavigate();

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
                <tr
                  key={i}
                  onClick={() => navigate({ to: `/guests/${visit.guest_id}` })}
                >
                  <td>{ readableDateTime(visit.created_at) }</td>
                  <td>{ visit.guest_id }</td>
                  <td>
                    {
                      visit.service_ids.map((id, i) => {
                        // TODO: change to service name when api updates
                        return <Badge bg='secondary' key={i}>{id}</Badge>
                      })
                    }
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </>
  );
}
