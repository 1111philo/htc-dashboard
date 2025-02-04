import { Button, Table } from 'react-bootstrap'
import { readableDateTime } from '../utils';

interface CompletedTableProps {
  guestsCompleted: Guest[];
  service: ServiceType;
}

export default function CompletedTable({ guestsCompleted, service}: CompletedTableProps) {
  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>Time Requested</th>
          <th>Guest Name (ID)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {guestsCompleted!.map(
          ({ guest_id, first_name, last_name, created_at }, i) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const timeRequested = readableDateTime(created_at);

            return (
              <tr key={`${guest_id}-${i}`}>
                <td>{timeRequested}</td>
                <td>{nameAndID}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      // TODO: upon API activation
                      // handleMoveToNewStatus(guest_id, "Queued", null)
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
