import {
  Button,
  Form,
  Table
} from 'react-bootstrap'
import { readableDateTime } from '../utils';

interface QueuedTableProps {
  guestsQueued: Guest[];
  availableSlots: number[];
  service: ServiceType;
}

export default function QueuedTable({
  guestsQueued,
  availableSlots,
  service
}: QueuedTableProps) {

  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>#</th>
          <th>Time Requested</th>
          <th>Guest Name (ID)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {guestsQueued!.map(
          ({ guest_id, first_name, last_name, created_at }, i) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const timeRequested = readableDateTime(created_at);

            return (
              <tr key={`${guest_id}-${i}`}>
                <td>{i + 1}</td>
                <td>{timeRequested}</td>
                <td>{nameAndID}</td>
                <td>
                  {service.quota ? (
                    <Form.Select
                      aria-label="Select which slot to assign"
                      onChange={(e) =>
                        // TODO: upon API activation
                        // handleMoveToNewStatus(
                        //   guest_id,
                        //   "Slotted",
                        //   parseInt(e.target.value)
                        // )
                        console.log("Assigned to slot:", parseInt(e.target.value))
                      }
                    >
                      <option>Assign Slot</option>
                      {availableSlots.map((slotNums, i) => {
                        return <option key={`${slotNums}-${i}`}>{slotNums}</option>;
                      })}
                    </Form.Select>
                  ) : (
                    ""
                  )}
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      // TODO: upon API activation
                      // handleMoveToNewStatus(guest_id, "Completed", null)
                      console.log("Moved to completed")
                    }
                  >
                    Completed
                  </Button>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </Table>
  )
}
