import ReactDOM from "react-dom/client";
import { RouterProvider, } from "@tanstack/react-router";
import { router } from "./router";
import { LoginView } from "./routes/login";
import * as auth from './lib/api/auth'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

auth.configure(); 

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  // Render login view outside of router system.
  // NOTE: couldn't get it to work within the router system. Issue appears to be
  // related to auth. If you want to see what happens, uncomment the next line
  // of code and comment out the rest. The issue might be related to async
  // timing of Amplify vs router init. Or it could be related to the fact that
  // _auth is an invisible route and that's causing confusing between "/" and 
  // children (just login) and every other route, since "/_auth/route" is really
  // "/route".
  // Offending line 👇🏽
  // root.render(<RouterProvider router={router} />)
  const isLoggedIn = await auth.isLoggedIn()
  root.render(
    !isLoggedIn ? <LoginView /> : <RouterProvider router={router} />
  );
}
