import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import { getGuestsWithQuery } from "../api";
import {
  guestOptLabel,
  guestSelectOptionFrom,
  guestSelectOptsFrom,
} from "../utils";

import { Form } from "react-bootstrap";

const SEARCH_DEBOUNCE_MS = 650;

/** Shows results only if there's a query. Does not auto-populate with all guests. */
export default function GuestSelectSearch({
  newGuest,
  selectedGuestOpt,
  setSelectedGuestOpt,
}) {
  const [guestSelectOpts, setGuestSelectOpts] = useState<
    { value: string; label: string }[]
  >([]);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["guests"],
    queryFn: () => {
      setDebouncedSearchText("");
      getGuestsWithQuery(searchText.trim()).then((guestsResponse) => {
        setGuestSelectOpts(guestSelectOptsFrom(guestsResponse.rows));
      });
    },
    enabled: !!debouncedSearchText,
  });

  const updateSearch = useDebouncedCallback(
    (searchText) => setDebouncedSearchText(searchText),
    SEARCH_DEBOUNCE_MS
  );

  return (
    <Form className="mt-3 my-5">
      <Form.Group className="mb-3" controlId="formUID">
        <Form.Label>
          <i>Search by UID, Name, or Birthday (YYYY-MM-DD):</i>
        </Form.Label>
        <Select
          id="user-dropdown"
          options={newGuest ? guestSelectOptionFrom(newGuest) : guestSelectOpts}
          defaultValue={selectedGuestOpt}
          defaultInputValue={searchText}
          value={selectedGuestOpt}
          onChange={(newVal) => setSelectedGuestOpt(newVal)}
          onInputChange={onChangeInput}
          menuIsOpen={!!searchText}
          placeholder={"Search for a guest..."}
        />
      </Form.Group>
    </Form>
  );

  function onChangeInput(val) {
    setSearchText(val);
    val && updateSearch(val.trim());
  }
}
