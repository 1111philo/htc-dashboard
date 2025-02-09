import { Button, Table } from 'react-bootstrap'
import { readableDateTime } from '../utils';
import { updateGuestServiceStatus } from '../api';
import { useNavigate } from '@tanstack/react-router';

interface CompletedTableProps {
  guestsCompleted: GuestResponse[];
  service: ServiceType;
}

export default function CompletedTable({ guestsCompleted }: CompletedTableProps) {
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
          (guest, i) => {
            const fullName = guest.first_name + " " + guest.last_name;
            const timeRequested = readableDateTime(guest.created_at);

            return (
              <tr key={`${guest.guest_id}-${i}`}>
                <td>{timeRequested}</td>
                <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{guest.guest_id}</td>
                <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{fullName}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      // TODO: upon blocker resolution
                      // updateGuestServiceStatus(
                      //   "Queued",
                      //   guest,
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
