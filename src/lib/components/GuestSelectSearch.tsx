import { useState } from 'react';
import Select from 'react-select';
import { useDebouncedCallback } from "use-debounce";
import { getGuestsWithQuery } from '../api';
import { guestOptLabel, guestLookupOpts } from '../utils';

import { Form } from 'react-bootstrap';

export function GuestSelectSearch({ newGuest, selectedGuestOpt, setSelectedGuestOpt }) {
  const [guestSelectOpts, setGuestSelectOpts] = useState<
    { value: string; label: string }[]
  >([]);

  const [searchText, setSearchText] = useState("");

  const executeSearch = useDebouncedCallback((searchText) => {
    getGuestsWithQuery(searchText.trim()).then((guestsResponse) => {
      setGuestSelectOpts(guestLookupOpts(guestsResponse.rows));
    });
  }, 500);

  return (
    <Form className="mt-3 my-5">
      <Form.Group className="mb-3" controlId="formUID">
        <Form.Label>
          <i>Search by UID, Name, or Birthday (YYYY/MM/DD):</i>
        </Form.Label>
        <Select
          id="user-dropdown"
          options={
            newGuest
              ? [{ value: newGuest.guest_id, label: guestOptLabel(newGuest) }]
              : guestSelectOpts
          }
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
    val && executeSearch(val.trim());
  }
}
