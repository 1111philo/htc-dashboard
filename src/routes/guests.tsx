import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Table,
  Form,
  InputGroup,
  Pagination,
  Button,
  Modal,
} from "react-bootstrap";
import { ArrowUpDown, Search as SearchIcon } from "lucide-react";
import NewGuestForm from "../lib/components/NewGuestForm";
import FeedbackMessage from "../lib/components/FeedbackMessage";
import { getGuestData, getGuests } from "../lib/api/guest";

interface LoaderData {
  // guestsResponse: GuestsAPIResponse;
  // TODO: request a route for this page -- when i query guests, i need active_notification_count!!! -- maybe stick this into getGuests - otherwise, I'm making a request for each guest in the table just to get notification counts
  guestsDatas: Guest[]; // so these requests execute in parallel
}

export const Route = createFileRoute("/guests")({
  component: GuestsView,
  validateSearch: (search: Record<string, unknown>): { page } => {
    // validate and parse the search params into a typed state
    return { page: Number(search?.page ?? 1) };
  },
  loader: async (): Promise<LoaderData> => {
    const guestsResponse = await getGuests(1); // page 1

    const guestsDatas = await Promise.all(
      guestsResponse.rows.map((g) =>
        getGuestData(g.guest_id).then((guestResp) => {
          const { total, ...guest } = guestResp;
          return guest;
        })
      )
    );

    return { /* guestsResponse, */ guestsDatas };
  },
});

function GuestsView() {
  const ITEMS_PER_PAGE = 3;

  const { page } = Route.useSearch();

  const { guestsDatas } = Route.useLoaderData();
  const guests = guestsDatas;
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string | null;
  }>({ key: null, direction: null });

  const [showNewGuestModal, setShowNewGuestModal] = useState(false);

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  const filteredAndSortedData = useMemo(filterAndSort, [
    sortConfig,
    filterText,
  ]);

  const paginatedData = useMemo(paginated, [filteredAndSortedData, page]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Guests</h1>
        <Button onClick={() => setShowNewGuestModal(true)}>New Guest</Button>
      </div>

      <FeedbackMessage
        text={feedback.text}
        isError={feedback.isError}
        className="my-3"
      />

      <Modal show={showNewGuestModal}>
        <NewGuestForm
          setShowNewGuestModal={setShowNewGuestModal}
          setViewFeedback={setFeedback}
        />
      </Modal>

      <SearchBar />
      <GuestsTable />
      <Paging />
    </>
  );

  function filterAndSort(): Guest[] {
    let sortedAndFiltered = guests;

    if (filterText) {
      sortedAndFiltered = sortedAndFiltered.filter((guest) =>
        `${guest.first_name} ${guest.last_name}`
          .toLowerCase()
          .includes(filterText.toLowerCase())
      );
    }

    if (sortConfig.key) {
      sortedAndFiltered = [...sortedAndFiltered].sort((a, b) => {
        let aValue = a[sortConfig.key as keyof Guest];
        let bValue = b[sortConfig.key as keyof Guest];

        if (sortConfig.key === "notifications") {
          aValue = a.guest_notifications.length;
          bValue = b.guest_notifications.length;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedAndFiltered;
  }

  function paginated(): Guest[] {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }

  function SearchBar() {
    return (
      <InputGroup className="mb-4">
        <InputGroup.Text className="border-secondary">
          <SearchIcon size={20} className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          // placeholder="Search guests..."
          placeholder="I don't work yet. I'm not using the network"
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            // TODO: HOW DO I SET THE PAGE HERE? (need to know for search filtering)
            // setPage(1);
          }}
          className="border-secondary rounded-end"
        />
      </InputGroup>
    );
  }

  // !!! TODO: add guest to in-memory guests if successfully created
  function GuestsTable() {
    return (
      <Table
        className="mb-4 text-center table-sm"
        style={{ cursor: "pointer" }}
      >
        <thead>
          <tr>
            <th title="Sort by guest ID" onClick={() => sortBy("guest_id")}>
              ID <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th title="Sort by first name" onClick={() => sortBy("first_name")}>
              First <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th title="Sort by last name" onClick={() => sortBy("last_name")}>
              Last <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th title="Sort by birthday" onClick={() => sortBy("dob")}>
              DOB <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th
              onClick={() => sortBy("guest_notifications")}
              className="overflow-hidden text-truncate"
              title="Sort by notification count"
            >
              Alerts <ArrowUpDown className="ms-2" size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((g) => {
            const notificationCount = g.guest_notifications.length;
            return (
              <tr
                key={g.guest_id}
                className="cursor-pointer"
                onClick={() => navigate({ to: `/guests/${g.guest_id}` })}
              >
                <td>
                  <span className="badge bg-primary rounded-pill">
                    {g.guest_id.toString().padStart(5, "0")}
                  </span>
                </td>
                <td>{g.first_name}</td>
                <td>{g.last_name}</td>
                <td>{g.dob}</td>
                <td>
                  <div className="fs-4" style={{ marginBlock: "-5px" }}>{notificationCount > 0 ? "❗️" : ""}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );

    function sortBy(key: keyof Guest) {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    }
  }

  function Paging() {
    return (
      <div className="d-flex justify-content-between align-items-center text-muted">
        <small>
          Showing {paginatedData.length} of {filteredAndSortedData.length}{" "}
          guests
        </small>

        <Pagination className="mb-0">
          <Pagination.Prev
            as={Link}
            to="/guests"
            search={{ page: page === 1 ? page : page - 1 }}
            disabled={page === 1}
          />

          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              as={Link}
              key={index}
              to="/guests"
              search={{ page: index + 1 }}
              active={page === index + 1}
            >
              {index + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            as={Link}
            disabled={page === totalPages}
            to="/guests"
            search={{ page: page + 1 }}
          ></Pagination.Next>
        </Pagination>
      </div>
    );
  }
}
