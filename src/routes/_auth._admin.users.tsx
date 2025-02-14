import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, Modal } from "react-bootstrap";
// import { ArrowUpDown as SortIcon } from 'lucide-react'
import {
  DataTable,
  FeedbackMessage,
  HScroll,
  // TableFilter,
  TablePager,
} from "../lib/components";
import { useDebouncedCallback } from "use-debounce";
import { addUser, getUsers, getUsersWithQuery } from "../lib/api/user";
import { trimStringValues } from "../lib/utils";

const ITEMS_PER_PAGE = 10;

interface LoaderData {
  /** Filtered and sorted */
  users: User[];
  totalUserCount: number;
  page: number;
  totalPages: number;
}

interface SearchParams {
  query?: string;
  page?: number;
}

export const Route = createFileRoute("/_auth/_admin/users")({
  component: UsersView,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const { query, page: _page } = search;
    const page = Number(_page ?? 1);
    if (!query) return { page };
    return {
      query: String(query || ""),
      page,
    };
  },
  loaderDeps: ({ search: { query, page } }) => {
    return { query, page };
  },
  loader: async ({ deps: { query, page } }): Promise<LoaderData> => {
    const usersResponse = query
      ? await getUsersWithQuery(query)
      : await getUsers(page ?? 1, ITEMS_PER_PAGE);

    const { rows: users, total: totalUserCount } = usersResponse;
    const totalPages = Math.ceil(totalUserCount / ITEMS_PER_PAGE);
    return {
      users,
      totalUserCount,
      page: page!,
      totalPages,
    };
  },
});

function UsersView() {
  const { users, totalUserCount, page, totalPages } = Route.useLoaderData();

  const [sortedUsers, setSortedUsers] = useState<Partial<User>[]>(users);
  useEffect(() => setSortedUsers(users), [users]);

  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();
  const executeSearch = useDebouncedCallback(() => {
    if (!filterText) {
      navigate({ to: "/users" });
      return;
    }
    navigate({ to: "/users", search: { query: filterText } });
  }, 500);

  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Staff</h1>
        <Button className="m-2" onClick={() => setShowNewUserModal(true)}>
          New User
        </Button>
      </div>

      <FeedbackMessage message={feedback} className="my-3" />

      <Modal show={showNewUserModal}>
        <NewUserForm
          setShowNewUserModal={setShowNewUserModal}
          onSubmit={onCreateNewUser}
        />
      </Modal>

      {/* TODO: add this back in when api supports querying users like guests
      <TableFilter
        label="Filter Users by ID, Name, Birthday, or Notification Count"
        placeholder="Oops, I don't work yet! Waiting for the API to support queries..."
        filterText={filterText}
        onChange={onChangeFilter}
      />
      */}

      <HScroll>
        <UsersTable rows={sortedUsers} /* setSortedRows={setSortedUsers} */ />
      </HScroll>
      <TablePager
        queryRoute="/users"
        page={page}
        totalPages={totalPages}
        paginatedDataLength={sortedUsers.length}
        rowsCount={totalUserCount}
      />
    </>
  );

  // async function onChangeFilter(newVal) {
  //   setFilterText(newVal);
  //   executeSearch();
  // }

  function onCreateNewUser(newUser: Partial<User>) {
    setShowNewUserModal(false);
    setFeedback({
      text: `User created successfully! ID: ${newUser.user_id}`,
      isError: false,
    });
    navigate({ to: ".", replace: true });
  }
}

function NewUserForm({ setShowNewUserModal, onSubmit }) {
  const [formFeedback, setFormFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });
  return (
    <div className="p-3">
      <h2 className="mb-3">New Staff User</h2>
      <FeedbackMessage message={formFeedback} className="my-3" />
      <Form onSubmit={(e) => submitNewUserForm(e)}>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Name</Form.Label>
          <Form.Control
            id="input-name"
            name="name"
            minLength={2}
            maxLength={64}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Email</Form.Label>
          <Form.Control
            id="input-email"
            name="email"
            type="email"
            minLength={5}
            maxLength={100}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Role</Form.Label>
          <Form.Select id="input-role" name="role">
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Password</Form.Label>
          <Form.Control
            id="input-password"
            name="password"
            type="password"
            minLength={6}
            maxLength={33}
            readOnly // this + onFocus = hack to stop autofilling of password
            onFocus={(e) => e.target.removeAttribute("readonly")}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Confirm Password</Form.Label>
          <Form.Control
            id="input-confirm-password"
            name="confirm_password"
            type="password"
            readOnly // this + onFocus = hack to stop autofilling of password
            onFocus={(e) => e.target.removeAttribute("readonly")}
          />
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              if (!confirm("Discard the new user?")) return;
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

  async function submitNewUserForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEntries = Object.fromEntries(new FormData(e.target));
    trimStringValues(formEntries);
    const { name, email, role, password, confirm_password } = formEntries;
    if (!name || !email || !role || !password) {
      setFormFeedback({ text: "All fields are required.", isError: true });
      return;
    } else {
      setFormFeedback({ text: "", isError: false });
    }
    if (password !== confirm_password) {
      setFormFeedback({ text: "Passwords don't match", isError: true });
      return;
    } else {
      setFormFeedback({ text: "", isError: false });
    }
    const user_id = await addUser({ name, email, role, password });
    if (!user_id) {
      setFormFeedback({
        text: "Failed to create user. Try again in a few.",
        isError: true,
      });
      return;
    } else {
      setFormFeedback({ text: "", isError: false });
    }
    const newUser: Partial<User> = { name, email, role, user_id };
    onSubmit(newUser);
  }
}

// TODO: Once api supports sorting, use navigate() with search key
function UsersTable({ rows /* setSortedRows */ }) {
  const navigate = useNavigate();
  return (
    <DataTable>
      <thead>
        <tr>
          <th /* title="Sort by name" */>
            Name {/* <SortIcon className="ms-2" size={16} /> */}
          </th>
          <th /* title="Sort by email" */>
            Email {/* <SortIcon className="ms-2" size={16} /> */}
          </th>
          <th /* title="Sort by role" */>
            Role {/* <SortIcon className="ms-2" size={16} /> */}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((u: User) => {
          return (
            <tr
              key={u.user_id}
              className="cursor-pointer"
              onClick={() => navigate({ to: `/users/${u.sub}` })}
            >
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
