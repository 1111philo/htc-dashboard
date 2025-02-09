import { createFileRoute } from '@tanstack/react-router'
import { Chart } from '../lib/components'

import * as API from 'aws-amplify/api'

export const Route = createFileRoute('/_auth/visits')({
  component: VisitsView,
  loader: async () => {
    // fetch all visits
    const visits = await (
      await API.post({
        apiName: 'auth',
        path: '/getVisits',
      }).response
    ).body.json()
    console.log('visits: ', visits)
    const sortedVisits = visits!.rows.sort(
      (a, b) => a.created_at - b.created_at,
    )

    return { sortedVisits }
  },
})

function VisitsView() {
  return (
    <>
      <h1>Visits</h1>
      <Chart />
    </>
  )
}
