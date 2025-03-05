import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readableDateTime } from '../utils';
import { updateGuestServiceStatus } from '../api';
import { Button, Table } from 'react-bootstrap'

interface CompletedTableProps {
  guestsCompleted: GuestResponse[];
  service: ServiceType;
}

export default function CompletedTable({ guestsCompleted }: CompletedTableProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: moveToQueuedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Queued", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

  return (
    <>
      <h2>Completed</h2>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>Time Completed</th>
            <th>Guest Name</th>
            <th>Last Slot #</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guestsCompleted?.map(
            (guest, i) => {
              const fullName = guest.first_name + " " + guest.last_name;
              const timeCompleted = readableDateTime(guest.completed_at);

            return (
              <tr
                data-testid="completed-table-row"
                key={`${guest.guest_id}-${i}`}
              >
                <td>{timeCompleted}</td>
                <td>
                  <Link
                    to="/guests/$guestId"
                    params={{ guestId: guest.guest_id }}
                  >
                    {fullName}
                  </Link>
                </td>
                <td>{guest.slot_id}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() => moveToQueuedMutation(guest)}
                  >
                    Move to Queue
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
