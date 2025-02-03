import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { ArrowUpDown as SortIcon } from 'lucide-react'
import { FeedbackMessage, TableFilter, TablePager } from '../lib/components'
import { useDebouncedCallback } from 'use-debounce'
import { addUser, getUsers, getUsersWithQuery } from '../lib/api/user'

const ITEMS_PER_PAGE = 10

interface LoaderData {
  /** Filtered and sorted */
  users: User[]
  totalUserCount: number
  page: number
  totalPages: number
}

interface SearchParams {
  query?: string
  page?: number
}

export const Route = createFileRoute('/_auth/_admin/users')({
  component: UsersView,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const { query, page: _page } = search
    const page = Number(_page ?? 1)
    if (!query) return { page }
    return {
      query: String(query || ''),
      page,
    }
  },
  loaderDeps: ({ search: { query, page } }) => {
    return { query, page }
  },
  loader: async ({ context, deps: { query, page } }): Promise<LoaderData> => {
    const usersResponse = query
      ? await getUsersWithQuery(query)
      : await getUsers(page ?? 1, ITEMS_PER_PAGE)

    // NOTE: pagination appears broken because api does not return pagination data
    //    effect: all pages show the same data

    // TODO: remove `userResponse.rows` when API returns pagination data
    const users = usersResponse.rows ?? usersResponse
    // TODO: remove `|| 5` when API returns pagination data
    const totalUserCount = usersResponse.total || 5
    const totalPages = Math.ceil(totalUserCount / ITEMS_PER_PAGE)

    return {
      users,
      totalUserCount,
      page: page!,
      totalPages,
    }
  },
})

function UsersView() {
  const { users, totalUserCount, page, totalPages } = Route.useLoaderData()

  const [sortedUsers, setSortedUsers] = useState<User[]>(users)
  useEffect(() => setSortedUsers(users), [users])

  const [filterText, setFilterText] = useState('')
  const navigate = useNavigate()
  const executeSearch = useDebouncedCallback(() => {
    if (!filterText) {
      navigate({ to: '/users' })
      return
    }
    navigate({ to: '/users', search: { query: filterText } })
  }, 500)

  const [showNewUserModal, setShowNewUserModal] = useState(false)

  const [feedback, setFeedback] = useState<UserMessage>({
    text: '',
    isError: false,
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Staff</h1>
        <Button className="m-2" onClick={() => setShowNewUserModal(true)}>
          New User
        </Button>
      </div>

      <FeedbackMessage
        text={feedback.text}
        isError={feedback.isError}
        className="my-3"
      />

      <Modal show={showNewUserModal}>
        <NewUserForm
          setShowNewUserModal={setShowNewUserModal}
          setViewFeedback={setFeedback}
          sortedUsers={sortedUsers}
          setSortedUsers={setSortedUsers}
        />
      </Modal>

      <TableFilter
        label="Filter Users by ID, Name, Birthday, or Notification Count"
        placeholder="Oops, I don't work yet! Waiting for the API to support queries..."
        filterText={filterText}
        onChange={onChangeFilter}
      />

      <UsersTable rows={sortedUsers} /* setSortedRows={setSortedUsers} */ />
      <TablePager
        queryRoute="/users"
        page={page}
        totalPages={totalPages}
        paginatedDataLength={sortedUsers.length}
        rowsCount={totalUserCount}
      />
    </>
  )

  async function onChangeFilter(newVal) {
    setFilterText(newVal)
    executeSearch()
  }
}

function NewUserForm({
  setShowNewUserModal,
  setViewFeedback,
  sortedUsers,
  setSortedUsers,
}) {
  const [formFeedback, setFormFeedback] = useState<UserMessage>({
    text: '',
    isError: false,
  })

  const initialFields: Partial<User> = {
    name: '',
    email: '',
    role: 'Manager',
  }
  const [fields, setFields] = useState(initialFields)
  return (
    <div className="p-3">
      <h2 className="mb-3">New Staff User</h2>
      <FeedbackMessage
        text={formFeedback.text}
        isError={formFeedback.isError}
        className="my-3"
      />
      <Form
        onSubmit={(e) =>
          submitNewUserForm(e, setShowNewUserModal, sortedUsers, setSortedUsers)
        }
      >
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
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </Form.Select>
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              if (!confirm('Discard the new user?')) return
              setShowNewUserModal(false)
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
  )

  async function submitNewUserForm(
    e: React.FormEvent<HTMLFormElement>,
    setShowNewUserModal,
    sortedUsers,
    setSortedUsers,
  ) {
    e.preventDefault()
    const user: Partial<User> = Object.fromEntries(new FormData(e.target))
    const user_id = await addUser(user)
    if (!user_id) {
      setFormFeedback({
        text: 'Failed to create user. Try again in a few.',
        isError: true,
      })
      return
    }
    setShowNewUserModal(false)
    setViewFeedback &&
      setViewFeedback({
        text: `User created successfully! ID: ${user_id}`,
        isError: false,
      })

    const newUser: Partial<User> = { ...user, user_id }
    setSortedUsers([newUser, ...sortedUsers])
  }
}

// TODO: Once api supports sorting, use navigate() with search key
function UsersTable({ rows /* setSortedRows */ }) {
  const navigate = useNavigate()
  return (
    <Table className="mb-4 text-center table-sm" style={{ cursor: 'pointer' }}>
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
        {rows.map((u) => {
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
          )
        })}
      </tbody>
    </Table>
  )
}
