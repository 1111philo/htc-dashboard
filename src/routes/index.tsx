import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import { initForgotPassword, login } from "../lib/api";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

export const Route = createFileRoute('/')({
  component: LoginView,
  beforeLoad: async ({}) => {
    const { authUser } = useGlobalStore.getState();
    if (authUser) throw redirect({ to: '/new-visit', replace: true });
  },
});

function LoginView() {
  const [errorMsg, setErrorMsg] = useState('');
  const setAuthUser = useGlobalStore((state) => state.setAuthUser);
  const navigate = useNavigate();
  const forgotPassword = async () => {
    const email = prompt(`What is your email address?`);
    if (email) {
      await Auth.resetPassword({ username: email.toString() });
      alert(
        `Success! Please check your email address for a link to reset your password.`
      );
      return;
    } else {
      alert(`Please provide a valid email address to reset your password.`);
    }
  };

  const setNewPassword = async ({ email, code }) => {
    const newPassword = prompt(`What is your new password?`);
    if (newPassword) {
      await Auth.confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword.toString(),
      });
      await sleep(1000);
      const authUser = await login(email, newPassword);
      setAuthUser(authUser);
      location.replace('/');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('reset') === '1') {
      setNewPassword({
        email: searchParams.get('email'),
        code: searchParams.get('code'),
      });
    }
  }, [location]);

  return (
    <Container className='vh-100 d-flex align-items-center justify-content-center'>
      <Row>
        <Col>
          <Card style={{ width: '400px' }}>
            <Card.Body>
              <h2 className='text-center mb-4'>Harry Tompson Center</h2>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    id="email-input"
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Control
                    type='password'
                    placeholder='Password'
                    name='password'
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mb-4">
                  <Button
                    variant="link"
                    className="text-decoration-none"
                    onClick={async () => await resetPassword()}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button variant='primary' type='submit' className='w-100'>
                  Log In
                </Button>
              </Form>
              <p className='mt-3 text-danger'>{errorMsg}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  async function onSubmit(e) {
    e.preventDefault();
    const authUser = await login(
      e.target.email.value.trim(),
      e.target.password.value.trim()
    );
    if (!authUser) {
      setErrorMsg('Incorrect username or password.');
      return;
    }
    setAuthUser(authUser);
    navigate({ to: '/new-visit', replace: true });
  }

  async function resetPassword() {
    const emailInput = document.getElementById(
      "email-input"
    ) as HTMLInputElement;
    const email = emailInput.value;
    if (!email)
      setErrorMsg("Please enter your email address to reset your password.");
    const success = await initForgotPassword(email);
    success
      ? setErrorMsg(
          `Check your email for a password reset link from "no-reply@verificationemail.com."`
        )
      : setErrorMsg(
          "There was an issue resetting the password. Try again in a few."
        );
  }
}
