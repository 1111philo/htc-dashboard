import { useMemo, useState } from "react";
import {
  createFileRoute,
  parsePathname,
  useNavigate,
} from "@tanstack/react-router";
import {
  Button,
  Form,
  InputGroup,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import { ArrowUpDown, Search } from "lucide-react";

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

  const { users } = Route.useLoaderData();
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string | null;
  }>({ key: null, direction: null });

  const [showUserModal, setShowNewUserModal] = useState(false);

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
    <div>
      <div
        className="d-flex justify-content-between align-items-center mb-3"
        onClick={() => setShowNewUserModal(true)}
      >
        <h1 className="mb-3">Staff</h1>
        <Button className="m-2">New User</Button>
      </div>
      <Modal show={showUserModal}>
        <NewUserForm />
      </Modal>
      <SearchBar />
      <UsersTable />
      <Paging />
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
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }

  function NewUserForm() {
    const initialFields: Partial<User> = {
      name: "",
      email: "",
      role: "Manager",
    };
    const [fields, setFields] = useState(initialFields);
    return (
      <div className="p-3">
        <h2 className="mb-3">New Staff User</h2>
        <Form onSubmit={submitNewUserForm}>
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

    function submitNewUserForm(evt: SubmitEvent) {
      evt.preventDefault();
      // TODO: fetch/POST new user
      const { success } = { success: true }; // placeholder
      if (success) {
        setShowNewUserModal(false);
        // TODO: report success with a toast (or anything, for now)
      }
    }
  }

  function SearchBar() {
    return (
      <InputGroup className="mb-4">
        <InputGroup.Text className="border-secondary">
          <Search size={20} className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search users..."
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

  function UsersTable() {
    return (
      <Table
        className="mb-4 text-center table-sm"
        style={{ cursor: "pointer" }}
      >
        <thead>
          <tr>
            <th title="Sort by name" onClick={() => sortBy("name")}>
              Name <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th title="Sort by email" onClick={() => sortBy("email")}>
              Email <ArrowUpDown className="ms-2" size={16} />
            </th>
            <th title="Sort by role" onClick={() => sortBy("role")}>
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

    function sortBy(key: keyof User) {
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
          Showing {paginatedData.length} of {filteredAndSortedData.length} users
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
