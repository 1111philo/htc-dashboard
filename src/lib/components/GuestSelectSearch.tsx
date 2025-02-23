import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select, { SingleValue } from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { getGuestsWithQuery } from "../api";
import { guestSelectOptionFrom, guestSelectOptsFrom } from "../utils";

import { Form } from "react-bootstrap";

const SEARCH_DEBOUNCE_MS = 650;

interface Props {
  selectedGuest: Guest | Partial<Guest> | null;
  onSelect: (g: Partial<Guest> | null) => void;
}

/** Shows results only if there's a query. Does not auto-populate with all guests. */
export default function GuestSelectSearch({ selectedGuest, onSelect }: Props) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const { data: guests } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      setDebouncedSearchText(""); // clear for next search
      const { rows: guests } = (await getGuestsWithQuery(
        debouncedSearchText.trim()
      )) as GuestsAPIResponse;
      return guests;
    },
    enabled: !!debouncedSearchText,
  });

  const updateSearch = useDebouncedCallback(
    (searchVal) => setDebouncedSearchText(searchVal),
    SEARCH_DEBOUNCE_MS
  );

  const [selection, setSelection] = useState<GuestSelectOption | null>(null);

  const options = searchText
    ? guestSelectOptsFrom(guests ?? [])
    : selectedGuest
      ? [guestSelectOptionFrom(selectedGuest)]
      : [];

  // update the selection when selected guest changes
  useEffect(
    () =>
      setSelection(selectedGuest ? guestSelectOptionFrom(selectedGuest) : null),
    [selectedGuest]
  );

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fst-italic">
        Search by UID, Name, or Birthday (YYYY-MM-DD):
      </Form.Label>
      <Select
        id="user-dropdown"
        options={options}
        value={selection}
        onChange={onChange}
        onInputChange={onChangeInput}
        menuIsOpen={!!searchText}
        placeholder={"Search for a guest..."}
      />
    </Form.Group>
  );

  function onChangeInput(val: string) {
    setSearchText(val);
    updateSearch(val.trim());
  }

  function onChange(selection: SingleValue<GuestSelectOption>) {
    setSelection(selection);
    onSelect(selection?.guest ?? null);
  }
}
