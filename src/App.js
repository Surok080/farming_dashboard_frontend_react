import "./App.css";
import "./index.css";
import Dashboard from "./components/dashboard/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import SignIn from "./components/SingIn";


const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/test",
    element: <SignIn />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "*",
    element: <Dashboard />,
  },
], {basename: '/dashboard'});



function App() {

  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </div>
  );
}

export default App;
