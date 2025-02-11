

export function QueuedTableRow() {
  const fullName = guest.first_name + " " + guest.last_name;
  const timeRequested = readableDateTime(guest.queued_at);

  return (
    <tr key={`${guest.guest_id}-${i}`}>
      <td>{i + 1}</td>
      <td>{timeRequested}</td>
      <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{guest.guest_id}</td>
      <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{fullName}</td>
      <td>
        <div className="d-flex flex-column justify-content-end">
          {service.quota ? (
            <>
              <FeedbackMessage
                message={feedback}
              />
              <div className="d-flex flex-row">
                <Form.Select
                  aria-label="Select which slot to assign"
                  onChange={(e) => setSlotNumAssigned(+e.target.value)}
                >
                  <option>Slot #</option>
                  {availableSlots?.map((slotNum, i) => {
                    return (
                      <option key={`${slotNum}-${i}`}>{slotNum}</option>
                    );
                  })}
                </Form.Select>
                <Button
                  className="flex-grow-1 me-2"
                  onClick={() =>
                    moveToSlottedMutation(guest)
                  }
                >
                  Assign
                </Button>
                <Dropdown drop='down' autoClose={true}>
                  <Dropdown.Toggle  variant='outline-primary' />
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() =>
                        moveToCompletedMutation(guest)
                      }
                    >
                      Move to Completed
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={() =>
                moveToCompletedMutation(guest)
              }
            >
              Move to Completed
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}