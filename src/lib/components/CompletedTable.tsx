import { useNavigate } from '@tanstack/react-router';
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
  const navigate = useNavigate()

  const { mutateAsync: moveToQueuedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Queued", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

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
        {guestsCompleted?.map(
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
                      moveToQueuedMutation(guest)
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
