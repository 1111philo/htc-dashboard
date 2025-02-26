import * as Auth from "aws-amplify/auth";
import { Amplify } from "aws-amplify";

/* NOTE: 25.01.27: the login view renders outside of the routing
system altogether (see `root.render` in main.tsx) to avoid showing
the nav or flashing any views before rendering login.

There's definitely a better way to do this. */

export async function login(
  email: string,
  password: string
): Promise<Partial<User> | null> {
  try {
    const signInOutput = await Auth.signIn({ username: email, password });
    const { name, profile: role, sub } = await Auth.fetchUserAttributes();
    return { email: email!, name: name!, role: role! as UserRole, sub: sub! };
  } catch (err) {
    if (err.name === "NotAuthorizedException") {
      return null;
    }
    throw err; // throw if unexpected error
  }
}

export async function logout() {
  await Auth.signOut();
}

export async function isLoggedIn() {
  try {
    await Auth.getCurrentUser();
    return true;
  } catch (err) {
    return false;
  }
}

export async function initForgotPassword(email): Promise<boolean> {
  try {
    const { nextStep } = await Auth.resetPassword({
      username: email,
    });
    switch (nextStep.resetPasswordStep) {
      case "CONFIRM_RESET_PASSWORD_WITH_CODE":
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case "DONE":
        console.log("Successfully reset password.");
        break;
    }
    return true
  } catch (err) {
    console.error("There was an issue starting the password reset process:", err);
    return false;
  }
}

export async function resetPassword(email, confirmationCode, newPassword) {
  try {
    await Auth.confirmResetPassword({
      username: email,
      confirmationCode,
      newPassword,
    });
    return true
  } catch (err) {
    if (err.name === "UserLambdaValidationException") return true // really a warning about email validation // TODO: what other problems could have this name / throw this error?
    console.error("There was an issue resetting the password:", err) 
  }
}

export function configure() {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: import.meta.env.VITE_USERPOOLID,
          userPoolClientId: import.meta.env.VITE_USERPOOLWEBCLIENTID,
        },
      },
      API: {
        REST: {
          public: {
            endpoint: `${import.meta.env.VITE_API_URL}/public`,
          },
          auth: {
            endpoint: `${import.meta.env.VITE_API_URL}/auth`,
          },
        },
      },
    },
    {
      API: {
        REST: {
          headers: async ({ apiName }) =>
            apiName === "auth"
              ? {
                  Authorization: `Bearer ${(
                    await Auth.fetchAuthSession()
                  ).tokens?.idToken?.toString()}`,
                }
              : { "X-Api-Key": "1" },
        },
      },
    }
  );
}
