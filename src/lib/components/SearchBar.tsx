import { Search as SearchIcon } from "lucide-react";
import { Form, InputGroup } from "react-bootstrap";

export default function SearchBar({ placeholder, filterText, setFilterText }) {
  return (
    <InputGroup className="mb-4">
      <InputGroup.Text className="border-secondary">
        <SearchIcon size={20} className="text-muted" />
      </InputGroup.Text>
      <Form.Control
        placeholder={placeholder}
        value={filterText}
        onChange={(e) => {
          setFilterText(e.target.value);
          // TODO: HOW DO I SET THE PAGE HERE? (need to know for search filtering)
          // setCurrentPage(1);
        }}
        className="border-secondary rounded-end"
      />
    </InputGroup>
  );
}
