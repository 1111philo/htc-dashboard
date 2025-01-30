import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Table, Button, Modal } from "react-bootstrap";
import { ArrowUpDown, Search as SearchIcon } from "lucide-react";
import NewGuestForm from "../lib/components/NewGuestForm";
import FeedbackMessage from "../lib/components/FeedbackMessage";
import TableFilter from "../lib/components/TableFilter";
import TablePager from "../lib/components/TablePaging";
import {
  getGuestData,
  getGuests,
  getGuestsWithQuery,
} from "../lib/api/guest";
import { sortTableBy } from "../lib/utils";
import { useDebouncedCallback } from "use-debounce";

const ITEMS_PER_PAGE = 10;

interface LoaderData {
  // TODO: request a route for this page -- when i query guests, i need active_notification_count!!! -- maybe stick this into getGuests - otherwise, I'm making a request for each guest in the table just to get notification counts
  guests: Guest[];
  page: number;
  totalPages: number;
}

interface SearchParams {
  query?: string;
  page?: number;
}

export const Route = createFileRoute("/guests")({
  component: GuestsView,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const { query, page: _page } = search
    const page = Number(_page ?? 1)
    if (!query) return { page }
    return {
      query: String(query || ""),
      page
    };
  },
  loaderDeps: ({ search: { query, page } }) => {
    return { query, page };
  },
  loader: async ({ deps: { query, page } }): Promise<LoaderData> => {
    const guestsResponse = query?.length ? await getGuestsWithQuery(query) : await getGuests(page ?? 1, ITEMS_PER_PAGE)
    /** Filtered and sorted. */
    const guests = await Promise.all(
      guestsResponse.rows.map((g) =>
        getGuestData(g.guest_id).then((guestResp) => {
          const { total, ...guest } = guestResp;
          return guest;
        })
      )
    );
    // TODO: fix api -- need total user count (key 'total' = 0, always)
    // BUG? NO! the page count remaining the same when a query returns 1 page of results is because we can't yet get total guest count from the api
    /** TODO: WHEN API WORKS -- remove `|| 48` below */
    const totalPages = Math.ceil( (guestsResponse.total || 48) / ITEMS_PER_PAGE)
    return { guests, page: page!, totalPages };
  },
});

function GuestsView() {
  let { guests, page, totalPages } = Route.useLoaderData();

  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();
  const executeSearch = useDebouncedCallback(() => {
    if (!filterText) {
      navigate({ to: "/guests" })
      return
    }
    navigate({ to: "/guests", search: { query: filterText } });
  }, 500);


  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string | null;
  }>({ key: null, direction: null });
  const filteredAndSortedData = useMemo(filterAndSort, [
    sortConfig,
    filterText,
  ]);

  const [showNewGuestModal, setShowNewGuestModal] = useState(false);

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

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

      <TableFilter
        label="Search guests by ID, Name, Birthday, or Notification Count"
        placeholder="I don't work yet. I'm not using the network"
        filterText={filterText}
        onChange={onChangeSearch}
      />

      <GuestsTable
        rows={guests}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
      <TablePager
        page={page}
        totalPages={totalPages}
        paginatedDataLength={guests.length}
        rowsCount={filteredAndSortedData.length}
      />
    </>
  );

  async function onChangeSearch(newVal) {
    setFilterText(newVal);
    executeSearch()
  }

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
}

// !!! TODO: add guest to in-memory guests if successfully created
function GuestsTable({ rows, sortConfig, setSortConfig }) {
  const navigate = useNavigate();
  return (
    <Table className="mb-4 text-center table-sm" style={{ cursor: "pointer" }}>
      <thead>
        <tr>
          <th
            title="Sort by guest ID"
            onClick={() => sortTableBy("guest_id", sortConfig, setSortConfig)}
          >
            ID <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            title="Sort by first name"
            onClick={() => sortTableBy("first_name", sortConfig, setSortConfig)}
          >
            First <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            title="Sort by last name"
            onClick={() => sortTableBy("last_name", sortConfig, setSortConfig)}
          >
            Last <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            title="Sort by birthday"
            onClick={() => sortTableBy("dob", sortConfig, setSortConfig)}
          >
            DOB <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            onClick={() =>
              sortTableBy("guest_notifications", sortConfig, setSortConfig)
            }
            className="overflow-hidden text-truncate"
            title="Sort by notification count"
          >
            Alerts <ArrowUpDown className="ms-2" size={16} />
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((g) => {
          const notificationCount = g.guest_notifications?.length ?? 0;
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
                <div className="fs-4" style={{ marginBlock: "-5px" }}>
                  {notificationCount > 0 ? "❗️" : ""}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
