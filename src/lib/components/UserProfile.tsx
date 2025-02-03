import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Form } from "react-bootstrap"
import FeedbackMessage from "./FeedbackMessage2"
import { deleteUser, updateUser } from "../api"

interface Props {
  user: User;
  /** Different for User Profile View and My Account View */
  isOwnAccount: boolean;
}
export default function UserProfile({ user, isOwnAccount }: Props) {
  const navigate = useNavigate()

  const blankFeedback: UserMessage = { text: '', isError: false }
  const [feedback, setFeedback] = useState(blankFeedback)

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>{isOwnAccount ? "My Account" : "Staff Profile"}</h1>
        <Button
          variant="danger"
          type="button"
          onClick={async () => await deleteUsr()}
        >
          Delete User
        </Button>
      </div>
      <FeedbackMessage message={feedback} />
      <UserForm user={user} setFeedback={setFeedback} />
    </>
  )

  async function deleteUsr() {
    if (
      !confirm(
        `Are you sure you want to delete ${user.role}:
          ${user.email}`,
      )
    ) {
      return
    }
    const success = await deleteUser(user.user_id)
    if (!success) {
      setFeedback({
        text: `Oops! The user couldn't be deleted. Try again in a few.`,
        isError: true,
      })
      return
    }
    navigate({ to: '/users', replace: true })
  }
}

function UserForm({ user, setFeedback }) {
  const initialFields: Partial<User> = {
    name: user.name ?? '',
    email: user.email ?? '',
    role: user.role ?? '',
  }
  const [fields, setFields] = useState(initialFields)

  const [password, setPassword] = useState({ password: '', confirm: '' })

  const isPasswordChanged = password.password !== ''
  const isFormChanged =
    user.name !== fields.name ||
    user.email !== fields.email ||
    user.role !== fields.role ||
    isPasswordChanged

  return (
    <Form onSubmit={saveEditedUser}>
      <h4>ID: {user.user_id.toString().padStart(5, '0')}</h4>
      <Form.Group className="mb-3">
        <Form.Label className="fst-italic">Full Name</Form.Label>
        <Form.Control
          id="input-name"
          name="name"
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
          size="lg"
          className={
            fields.name?.trim() !== user.name ? 'border-2 border-warning' : ''
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fst-italic">Email</Form.Label>
        <Form.Control
          id="input-email"
          name="email"
          type="email"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          className={
            fields.email?.trim() !== user.email ? 'border-2 border-warning' : ''
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fst-italic">Role</Form.Label>
        <Form.Select
          id="input-role"
          name="role"
          value={fields.role}
          onChange={(e) => setFields({ ...fields, role: e.target.value })}
          className={
            fields.role?.trim() !== user.role ? 'border-2 border-warning' : ''
          }
        >
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fst-italic">New Password</Form.Label>
        <Form.Control
          id="input-password"
          name="password"
          type="password"
          minLength={6}
          maxLength={33}
          readOnly // this + onFocus = hack to stop autofilling of password
          onFocus={(e) => e.target.removeAttribute('readonly')}
          value={password.password}
          onChange={(e) =>
            setPassword({ ...password, password: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fst-italic">Confirm Password</Form.Label>
        <Form.Control
          id="input-confirm-password"
          name="confirm_password"
          type="password"
          readOnly // this + onFocus = hack to stop autofilling of password
          onFocus={(e) => e.target.removeAttribute('readonly')}
          value={password.confirm}
          onChange={(e) =>
            setPassword({ ...password, confirm: e.target.value })
          }
        />
      </Form.Group>
      {isFormChanged && (
        <div className="d-flex gap-2 justify-content-between">
          <Button variant="warning" type="button" onClick={cancelEdit}>
            Discard Changes
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      )}
    </Form>
  )

  function cancelEdit() {
    setFields(initialFields)
    setPassword({ password: '', confirm: '' })
  }

  async function saveEditedUser(e: SubmitEvent, onSave) {
    e.preventDefault()
    // first, check if passwords match
    if (password.password.trim() !== password.confirm.trim()) {
      setFeedback({ text: "Passwords don't match.", isError: true })

      return
    } else {
      setFeedback({ text: '', isError: false })
    }
    if (
      !confirm(`Save changes?
        ${user.email} -> ${fields.email}
        ${user.role} -> ${fields.role}`)
    ) {
      return
    }

    const userWithPassword = Object.fromEntries(
      new FormData(e.target),
    ) as Partial<User> & { password: string; confirm_password: string }
    const { confirm_password, ...rest } = userWithPassword
    const updatedUser = { ...rest, user_id: user.user_id }
    const success = await updateUser(updatedUser) // placeholder
    if (!success) {
      setFeedback({
        text: "Oops! The edits couldn't be saved. Try again in a few.",
        isError: true,
      })
      setFields(initialFields)
      setPassword({ password: '', confirm: '' })
      return
    }
    setFeedback({ text: 'Successfully updated.', isError: false })
    setPassword({ password: '', confirm: '' })
  }
}
