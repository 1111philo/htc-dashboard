import { isEven } from "../utils";
import { Container, ListGroup, Row } from "react-bootstrap";


interface Props {
  /** The index of the row in the table / from the source array. */
  i: number;
  className?: string;
  children?
}
export default function StripedListRow(props: Props) {
  const { i, className, children } = props
  return (
    <ListGroup.Item className={"p-0 m-0" + " " + className}>
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
