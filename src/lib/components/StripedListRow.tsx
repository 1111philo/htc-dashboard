import { isEven } from "../utility-funcs";
import { Container, ListGroup, Row } from "react-bootstrap";

export default function StripedListRow({ children, i }) {
  return (
    <ListGroup.Item className="p-0">
      <Container>
        <Row
          className={
            "flex-nowrap align-items-center " +
            (isEven(i) ? "bg-secondary bg-opacity-10" : "bg-white")
          }
        >
          {children}
        </Row>
      </Container>
    </ListGroup.Item>
  );
}
