import { Mail, MailOpen } from "lucide-react";
import { Card, Button } from "react-bootstrap";
import { toggleGuestNotificationStatus } from "../api";
import { readableDateTime } from "../utils";
import { Cards } from '../components'


type OnToggleNotificationStatus = (
  success: boolean,
  notificationId: number,
  initialStatus: GuestNotificationStatus,
) => void

interface NotificationsProps {
  notifications: GuestNotification[];
  onToggleStatus: OnToggleNotificationStatus;
}
export default function Notifications({ notifications, onToggleStatus }: NotificationsProps) {
  return (
    <Cards>
      {notifications.length
        ? notifications.map((n, i) => (
            <NotificationCard
              key={n.notification_id}
              n={n}
              onToggleStatus={onToggleStatus}
            />
          ))
        : "None"}
    </Cards>
  );
}

interface NCProps {
  n: GuestNotification;
  onToggleStatus: OnToggleNotificationStatus;
}
function NotificationCard({ n, onToggleStatus }: NCProps) {
  const border = n.status === "Active" ? "border-danger border-2" : "";
  const Icon = () => (n.status === "Active" ? <Mail /> : <MailOpen />);
  const dateTime = readableDateTime(n.created_at);
  return (
    <Card className={"mb-3 shadow " + border}>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div className="fst-italic">
            <span className="me-2">
              <Icon />
            </span>
            Created: {dateTime}
          </div>
          <Button
            size="sm"
            variant={
              n.status === "Active" ? "outline-primary" : "outline-primary"
            }
            onClick={async () => await toggleNotificationStatus(onToggleStatus)}
          >
            {n.status === "Active" ? "Mark Read" : "Unarchive"}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Card.Text>{n.message}</Card.Text>
      </Card.Body>
    </Card>
  );
  async function toggleNotificationStatus(
    onToggleStatus: OnToggleNotificationStatus
  ) {
    const success = await toggleGuestNotificationStatus(n.notification_id);
    onToggleStatus(success, n.notification_id, n.status);
  }
}
