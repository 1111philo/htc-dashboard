import { Search as SearchIcon } from "lucide-react";
import { Form, InputGroup } from "react-bootstrap";

export default function TableFilter({ label, placeholder, filterText, onChange }) {
  return (
    <Form>
      <Form.Label className="fst-italic">{label}</Form.Label>
      <InputGroup className="mb-4">
        <InputGroup.Text className="border-secondary">
          <SearchIcon size={20} className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          placeholder={placeholder}
          className="border-secondary rounded-end"
          value={filterText}
          onChange={async (e) => await onChange(e.target.value)}
        />
      </InputGroup>
    </Form>
  );
}
