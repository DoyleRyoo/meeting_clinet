import { RouterProvider } from "react-router";
import { AppProvider } from "./components/context/appProvider";
import { router } from "./routes/router";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
