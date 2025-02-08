import { Button, Table } from 'react-bootstrap'
import { readableDateTime } from '../utils';
import { useNavigate } from '@tanstack/react-router';

interface CompletedTableProps {
  guestsCompleted: Guest[];
  service: ServiceType;
}

export default function CompletedTable({ guestsCompleted, service}: CompletedTableProps) {
  const navigate = useNavigate()
  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>Time Requested</th>
          <th>Guest ID</th>
          <th>Guest Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {guestsCompleted!.map(
          ({ guest_id, first_name, last_name, created_at }, i) => {
            const fullName = first_name + " " + last_name;
            const timeRequested = readableDateTime(created_at);

            return (
              <tr key={`${guest_id}-${i}`}>
                <td>{timeRequested}</td>
                <td onClick={() => navigate({ to: `/guests/${guest_id}` })}>{guest_id}</td>
                <td onClick={() => navigate({ to: `/guests/${guest_id}` })}>{fullName}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      // TODO: upon blocker resolution
                      // updateGuestServiceStatus(
                      //   service,
                      //   "Queued",
                      //   guest_id,
                      //   null
                      // )
                      console.log("Moved to Queue")
                    }
                  >
                    Move to Queue
                  </Button>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </Table>
  );
}
