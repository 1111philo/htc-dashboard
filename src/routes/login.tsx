import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginView,
});

/* NOTE: THIS PAGE CANNOT YET BE ACCESSED BY ANY ROUTE */

function LoginView() {
  return (
    <>
      {/*
      Title: Harry Tompson Center
      Form
        User Name field
        Password field
      Link: Forgot password
      Button: Log In
    */}
      <h1>Login</h1>
    </>
  );
}
