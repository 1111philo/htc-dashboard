import { Table } from "react-bootstrap";

/** A striped table with no text wrapping that expects rows to be clickable.
 * Use just like react-bootstrap's Table. */
export default function DataTable({ children }) {
  return (
    <Table
      striped={true}
      className="mb-4 text-center table-sm text-nowrap"
      style={{ cursor: "pointer" }}
    >
      {children}
    </Table>
  );
}
