import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Table,
  Form,
  InputGroup,
  Pagination,
  Button,
  Modal,
} from "react-bootstrap";
import { ArrowUpDown, Search } from "lucide-react";
import NewGuestForm from "../lib/components/NewGuestForm";

interface LoaderData {
  guests: Guest[];
}

export const Route = createFileRoute("/guests")({
  component: GuestsView,
  loader: async (): Promise<LoaderData> => {
    let response = await fetch("../../sample-data/get_guests.json");
    const guests: Guest[] = await response.json();
    return { guests };
  },
});

function GuestsView() {
  const ITEMS_PER_PAGE = 5;

  const { guests } = Route.useLoaderData();
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string | null;
  }>({ key: null, direction: null });

  const [showNewGuestModal, setShowNewGuestModal] = useState(true);

  const filteredAndSortedData = useMemo(filterAndSort, [
    sortConfig,
    filterText,
  ]);

  const paginatedData = useMemo(paginated, [
    filteredAndSortedData,
    currentPage,
  ]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-3">Guests</h1>
        <Button onClick={() => setShowNewGuestModal(true)}>New Guest</Button>
      </div>

      <Modal show={showNewGuestModal}>
        <NewGuestForm setShowNewGuestModal={setShowNewGuestModal} />
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
          aValue = a.notifications.length;
          bValue = b.notifications.length;
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
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }

  function SearchBar() {
    return (
      <InputGroup className="mb-4">
        <InputGroup.Text className="border-secondary">
          <Search size={20} className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search guests..."
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
          className="text-light border-secondary rounded-end"
        />
      </InputGroup>
    );
  }

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
              onClick={() => sortBy("notifications")}
              className="overflow-hidden text-truncate"
              title="Sort by notification count"
            >
              Alerts <ArrowUpDown className="ms-2" size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((g) => {
            const notificationCount = JSON.parse(g.notifications).length;
            const pillColor =
              notificationCount >= 3
                ? "danger"
                : notificationCount > 0
                  ? "warning"
                  : "sencondary";
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
                <td className="overflow-hidden">
                  <span className={`badge bg-${pillColor} rounded-pill`}>
                    {notificationCount}
                  </span>
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
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={currentPage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  }
}
