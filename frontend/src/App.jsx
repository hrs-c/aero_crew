import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Crew from "./pages/Crew";
import Flights from "./pages/Flights";
import FlightDetail from "./pages/FlightDetail";
import Assignments from "./pages/Assignments";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="crew" element={<Crew />} />
            <Route path="flights" element={<Flights />} />
            <Route path="flights/:id" element={<FlightDetail />} />
            <Route path="assignments" element={<Assignments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
