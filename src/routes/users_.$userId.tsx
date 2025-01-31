import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { getUser } from "../lib/api/user";

interface LoaderData {
  user: User;
}
export const Route = createFileRoute("/users_/$userId")({
  component: UserProfileView,
  parseParams: (params): { userId: number } => ({
    userId: parseInt(params.userId),
  }),
  loader: async ({ params }): Promise<LoaderData> => {
    const { userId } = params
    // TODO: fix the hack in 👇🏽 this request func when API accepts a user_id key in req body
    const user = await getUser(userId)
    return { user: user! }
  }
});

function UserProfileView() {
  const { user } = Route.useLoaderData()

  return (
    <>
      <h1>Staff Profile</h1>
      <UserForm />
    </>
  );

  function UserForm() {
    const initialFields: Partial<User> = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const [fields, setFields] = useState(initialFields);

    const [password, setPassword] = useState({ password: "", confirm: "" });
    const [errorMsg, setErrorMsg] = useState("");

    const isPasswordChanged = password.password !== "";
    const isFormChanged =
      user.email !== fields.email ||
      user.role !== fields.role ||
      isPasswordChanged;

    return (
      <Form onSubmit={saveEditedUser}>
        <p className="text-danger">{errorMsg}</p>
        <h4>ID: {user.user_id.toString().padStart(5, "0")}</h4> 
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Name (First Last)</Form.Label>
          <Form.Control
            id="input-name"
            name="name"
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            size="lg"
            className={
              fields.name?.trim() !== user.name
                ? "border-2 border-warning"
                : ""
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
              fields.email?.trim() !== user.email
                ? "border-2 border-warning"
                : ""
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
              fields.role?.trim() !== user.role ? "border-2 border-warning" : ""
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
            minLength={8}
            maxLength={33}
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
            name="confirm-password"
            type="password"
            value={password.confirm}
            onChange={(e) =>
              setPassword({ ...password, confirm: e.target.value })
            }
          />
        </Form.Group>
        <div className="d-flex gap-2 justify-content-between">
          <Button
            variant="danger"
            type="button"
            onClick={async () => await deleteUser()}
          >
            Delete Guest
          </Button>
          {isFormChanged && (
            <div className="d-flex gap-2">
              <Button variant="warning" type="button" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Form>
    );

    function cancelEdit() {
      setFields(initialFields);
      setPassword({ password: "", confirm: "" });
    }

    async function deleteUser() {
      if (
        !confirm(
          `Are you sure you want to delete ${user.role}:
          ${user.email}`
        )
      ) {
        return;
      }
      // delete the user
    }

    async function saveEditedUser(evt: SubmitEvent) {
      evt.preventDefault();
      // first, check if passwords match
      if (password.password.trim() !== password.confirm.trim()) {
        setErrorMsg("❗ Passwords don't match.");
        return;
      } else {
        setErrorMsg("");
      }
      if (
        !confirm(`Save changes?
          ${user.email} -> ${fields.email}
          ${user.role} -> ${fields.role}`)
      ) {
        return;
      }
      // TODO: fetch/POST new guest
      const { success } = { success: true }; // placeholder
      if (success) {
        // TODO: report success with a toast (or anything, for now)
      }
    }
  }
}
