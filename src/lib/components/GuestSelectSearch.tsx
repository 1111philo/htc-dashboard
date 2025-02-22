import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { getGuestsWithQuery } from "../api";
import { guestSelectOptionFrom, guestSelectOptsFrom } from "../utils";

import { Form } from "react-bootstrap";

const SEARCH_DEBOUNCE_MS = 650;

/** Shows results only if there's a query. Does not auto-populate with all guests. */
export default function GuestSelectSearch({
  newGuest,
  selectedGuestOpt,
  setSelectedGuestOpt,
}) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const { data: guests } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      setDebouncedSearchText("");
      const { rows: guests } = await getGuestsWithQuery(
        debouncedSearchText.trim()
      );
      return guests;
    },
    enabled: !!debouncedSearchText,
  });

  const updateSearch = useDebouncedCallback(
    (searchVal) => setDebouncedSearchText(searchVal),
    SEARCH_DEBOUNCE_MS
  );

  const options = newGuest
    ? guestSelectOptionFrom(newGuest)
    : guestSelectOptsFrom(guests ?? []);

  return (
    <Form className="mt-3 my-5" onSubmit={(e) => e.preventDefault()}>
      <Form.Group className="mb-3">
        <Form.Label>
          <i>Search by UID, Name, or Birthday (YYYY-MM-DD):</i>
        </Form.Label>
        <Select
          id="user-dropdown"
          options={options}
          value={selectedGuestOpt}
          onChange={(newVal) => setSelectedGuestOpt(newVal)}
          onInputChange={onChangeInput}
          menuIsOpen={!!searchText}
          placeholder={"Search for a guest..."}
        />
      </Form.Group>
    </Form>
  );

  function onChangeInput(val: string) {
    setSearchText(val);
    updateSearch(val.trim());
  }
}
