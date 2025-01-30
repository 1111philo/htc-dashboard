import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { ArrowUpDown, Search } from "lucide-react";
import SearchBar from "../lib/components/SearchBar";
import TablePager from "../lib/components/TablePaging";
import { sortTableBy } from "../lib/utils";

import * as API from "aws-amplify/api";

interface LoaderData {
  users: User[];
}

export const Route = createFileRoute("/users")({
  component: UsersView,
  loader: async ({ params }): Promise<LoaderData> => {
    const response = await API.post({
      apiName: "auth",
      path: "/getUsers",
    }).response;
    const users = (await response.body.json()) as Array<User>;
    return { users };
  },
});

function UsersView() {
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const { users } = Route.useLoaderData();

  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string | null;
  }>({ key: null, direction: null });
  const filteredAndSortedData = useMemo(filterAndSort, [
    sortConfig,
    filterText,
  ]);

  const paginatedData = useMemo(paginated, [filteredAndSortedData, page]);
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  const [showUserModal, setShowNewUserModal] = useState(false);

  // TODO: add FeedbackMessage

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-3">Staff</h1>
        <Button className="m-2" onClick={() => setShowNewUserModal(true)}>
          New User
        </Button>
      </div>

      {/* TODO: add FeedbackMessage */}

      <Modal show={showUserModal}>
        <NewUserForm setShowNewUserModal={setShowNewUserModal} />
      </Modal>

      <SearchBar
        placeholder="Search users..."
        filterText={filterText}
        setFilterText={setFilterText}
      />

      <UsersTable
        paginatedData={paginatedData}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
      <TablePager
        page={page}
        totalPages={totalPages}
        paginatedDataLength={paginatedData.length}
        filteredAndSortedDataLength={filteredAndSortedData.length}
      />
    </div>
  );

  function filterAndSort(): User[] {
    let sortedAndFiltered = users;

    if (filterText) {
      sortedAndFiltered = sortedAndFiltered.filter((user) =>
        `${user.name} ${user.email} ${user.role}`
          .toLowerCase()
          .includes(filterText.toLowerCase())
      );
    }

    if (sortConfig.key) {
      sortedAndFiltered = [...sortedAndFiltered].sort((a, b) => {
        let aValue = a[sortConfig.key as keyof User] as string;
        let bValue = b[sortConfig.key as keyof User] as string;

        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();

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

  function paginated(): User[] {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }
}

function NewUserForm({ setShowNewUserModal }) {
  const initialFields: Partial<User> = {
    name: "",
    email: "",
    role: "Manager",
  };
  const [fields, setFields] = useState(initialFields);
  return (
    <div className="p-3">
      <h2 className="mb-3">New Staff User</h2>
      <Form onSubmit={(e) => submitNewUserForm(e, setShowNewUserModal)}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            id="input-name"
            name="name"
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            id="input-email"
            name="email"
            type="email"
            value={fields.email}
            // TODO: WHY NO WORKIE?
            onChange={(e) => setFields({ ...fields, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Role</Form.Label>
          <Form.Select
            id="input-role"
            name="role"
            value={fields.role}
            onChange={(e) => setFields({ ...fields, role: e.target.value })}
          >
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              setShowNewUserModal(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );

  function submitNewUserForm(evt: React.FormEvent<HTMLFormElement>, setShowNewUserModal) {
    evt.preventDefault();
    // TODO: fetch/POST new user
    const { success } = { success: true }; // placeholder
    if (success) {
      setShowNewUserModal(false);
      // TODO: report success with a toast (or anything, for now)
    }
  }
}

function UsersTable({ paginatedData, sortConfig, setSortConfig }) {
  const navigate = useNavigate();
  return (
    <Table className="mb-4 text-center table-sm" style={{ cursor: "pointer" }}>
      <thead>
        <tr>
          <th
            title="Sort by name"
            onClick={() => sortTableBy("name", sortConfig, setSortConfig)}
          >
            Name <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            title="Sort by email"
            onClick={() => sortTableBy("email", sortConfig, setSortConfig)}
          >
            Email <ArrowUpDown className="ms-2" size={16} />
          </th>
          <th
            title="Sort by role"
            onClick={() => sortTableBy("role", sortConfig, setSortConfig)}
          >
            Role <ArrowUpDown className="ms-2" size={16} />
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.map((u) => {
          return (
            <tr
              key={u.user_id}
              className="cursor-pointer"
              onClick={() => navigate({ to: `/users/${u.user_id}` })}
            >
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
