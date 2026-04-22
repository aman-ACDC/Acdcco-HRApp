// import React, { useState, useEffect } from "react";
// import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
// import client from "./api/client";
// import Navigation from "./components/Navigation";
// import Hero from "./components/Hero";
// import EmployeeDirectory from "./components/EmployeeDirectory";
// import EmployeeForm from "./components/EmployeeForm";
// import Contact from "./components/Contact";
// import Footer from "./components/Footer";
// import Dashboard from "./components/Dashboard";
// import LoginPage from "./pages/LoginPage";
// import Register from "./pages/Register";
// import { useAuthStore } from "./store/authStore";
// import "./App.css";

// function App() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const logout = useAuthStore((state) => state.logout);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!isAuthenticated) return;
//     let isMounted = true;

//     const fetchEmployees = async () => {
//       try {
//         const res = await client.get("/employees/");
//         const data = res.data?.results ?? res.data;

//         if (isMounted) {
//           const normalized = (Array.isArray(data) ? data : data?.results || []).map(
//             (p) => ({
//               id: p.id,
//               name: p.full_name || "",
//               title: p.position || "",
//               department: p.department || "",
//               status:
//                 p.status === "on_leave"
//                   ? "On leave"
//                   : p.status === "active"
//                   ? "Employee"
//                   : p.status || "Inactive",
//               startDate: p.start_date || "",
//               location: p.timezone || "",
//               reportsTo: p.reports_to || "",
//               acdc_email: p.acdc_email || "",
//               personal_email: p.personal_email || "",
//               phone: p.phone || "",
//             })
//           );
//           setEmployees(normalized);
//         }
//       } catch (e) {
//         console.error("Error loading employees:", e);
//         if (isMounted) setError("Failed to load employees");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchEmployees();
//     return () => {
//       isMounted = false;
//     };
//   }, [isAuthenticated]);

//   const addEmployee = (newEmployee) => setEmployees((prev) => [...prev, newEmployee]);
//   const updateEmployee = (oldName, updated) =>
//     setEmployees((prev) => prev.map((emp) => (emp.name === oldName ? updated : emp)));
//   const deleteEmployee = (name) =>
//     setEmployees((prev) => prev.filter((emp) => emp.name !== name));

//   const renderHome = () => {
//     if (loading) return <p>Loading employees...</p>;
//     if (error) return <p style={{ color: "red" }}>{error}</p>;

//     return (
//       <>
//         <Navigation isAuthenticated={isAuthenticated} logout={logout} />
//         <Hero
//           onAddEmployeeClick={() => navigate("/add-employee")}
//           onViewEmployeesClick={() => navigate("/employees")}
//         />
//         <Contact />
//         <Footer />
//       </>
//     );
//   };

//   // ✅ NOW shows the editable Dashboard (table) instead of EmployeeDirectory cards
//   const renderEmployeesPage = () => {
//     if (loading) return <p>Loading employees...</p>;
//     if (error) return <p style={{ color: "red" }}>{error}</p>;

//     return (
//       <>
//         <Navigation isAuthenticated={isAuthenticated} logout={logout} />
//         <Dashboard
//           employees={employees}
//           onUpdateEmployee={updateEmployee}
//           onDeleteEmployee={deleteEmployee}
//         />
//         <Footer />
//       </>
//     );
//   };

//   const renderAddEmployeePage = () => {
//     if (loading) return <p>Loading...</p>;
//     if (error) return <p style={{ color: "red" }}>{error}</p>;

//     return (
//       <>
//         <Navigation isAuthenticated={isAuthenticated} logout={logout} />
//         <EmployeeForm onAddEmployee={addEmployee} />
//         <Footer />
//       </>
//     );
//   };

//   return (
//     <div className="App">
//       <Routes>
//         <Route path="/" element={<LoginPage />} />

//         <Route
//           path="/dashboard"
//           element={isAuthenticated ? renderHome() : <Navigate to="/" replace />}
//         />

//         <Route
//           path="/employees"
//           element={isAuthenticated ? renderEmployeesPage() : <Navigate to="/" replace />}
//         />

//         <Route
//           path="/add-employee"
//           element={isAuthenticated ? renderAddEmployeePage() : <Navigate to="/" replace />}
//         />

//         {/* kept for now (same content as /employees) */}
//         <Route
//           path="/employee-dashboard"
//           element={
//             isAuthenticated ? (
//               <>
//                 <Navigation isAuthenticated={isAuthenticated} logout={logout} />
//                 <Dashboard
//                   employees={employees}
//                   onUpdateEmployee={updateEmployee}
//                   onDeleteEmployee={deleteEmployee}
//                 />
//                 <Footer />
//               </>
//             ) : (
//               <Navigate to="/" replace />
//             )
//           }
//         />

//         <Route
//           path="/register"
//           element={
//             isAuthenticated ? (
//               <>
//                 <Navigation isAuthenticated={isAuthenticated} logout={logout} />
//                 <Register />
//               </>
//             ) : (
//               <Navigate to="/" replace />
//             )
//           }
//         />

//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import client from "./api/client";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import EmployeeForm from "./components/EmployeeForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import RecentActivity from "./components/RecentActivity";
import { useAuthStore } from "./store/authStore";
import "./App.css";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const [employees, setEmployees] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for store to hydrate and check if authenticated
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchEmployees = async () => {
      try {
        const res = await client.get("/employees/");
        const data = res.data?.results ?? res.data;

        if (isMounted) {
          const normalized = (Array.isArray(data) ? data : data?.results || []).map(
            (p) => ({
              id: p.id,
              name: p.full_name || "",
              title: p.position || "",
              department: p.department || "",
              status:
                p.status === "on_leave"
                  ? "On leave"
                  : p.status === "active"
                  ? "Employee"
                  : p.status || "Inactive",
              startDate: p.start_date || "",
              location: p.timezone || "",
              reportsTo: p.reports_to || "",
              member_type: p.member_type || "employee",
              subteam: p.subteam || "",
              skills: p.skills || "",
              bio: p.bio || "",
              time_commitment: p.time_commitment || 0,
              acdc_email: p.acdc_email || "",
              personal_email: p.personal_email || "",
              phone: p.phone || "",
            })
          );

          setEmployees(normalized);
          setLastSynced(new Date()); // ✅ Idea #3
        }
      } catch (e) {
        console.error("Error loading employees:", e);
        if (isMounted) setError("Failed to load employees");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployees();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const addEmployee = (newEmployee) => setEmployees((prev) => [...prev, newEmployee]);
  const updateEmployee = (oldName, updated) =>
    setEmployees((prev) => prev.map((emp) => (emp.name === oldName ? updated : emp)));
  const deleteEmployee = (name) =>
    setEmployees((prev) => prev.filter((emp) => emp.name !== name));

  const renderHome = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
      <>
        <Navigation isAuthenticated={isAuthenticated} logout={logout} />

        <Hero
          onAddEmployeeClick={() => navigate("/add-employee")}
          onViewEmployeesClick={() => navigate("/employees")}
        />

        {/* ✅ NEW: Recent Activity section between Hero and Contact */}
        <RecentActivity
          employees={employees}
          lastSynced={lastSynced}
          onAdd={() => navigate("/add-employee")}
          onViewAll={() => navigate("/employees")}
        />

        <Contact />
        <Footer />
      </>
    );
  };

  const renderEmployeesPage = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
      <>
        <Navigation isAuthenticated={isAuthenticated} logout={logout} />
        <Dashboard
          employees={employees}
          onUpdateEmployee={updateEmployee}
          onDeleteEmployee={deleteEmployee}
        />
        <Footer />
      </>
    );
  };

  const renderAddEmployeePage = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
      <>
        <Navigation isAuthenticated={isAuthenticated} logout={logout} />
        <EmployeeForm onAddEmployee={addEmployee} />
        <Footer />
      </>
    );
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={isAuthenticated ? renderHome() : <Navigate to="/" replace />}
        />

        <Route
          path="/employees"
          element={isAuthenticated ? renderEmployeesPage() : <Navigate to="/" replace />}
        />

        <Route
          path="/add-employee"
          element={isAuthenticated ? renderAddEmployeePage() : <Navigate to="/" replace />}
        />

        <Route
          path="/employee-dashboard"
          element={
            isAuthenticated ? (
              <>
                <Navigation isAuthenticated={isAuthenticated} logout={logout} />
                <Dashboard
                  employees={employees}
                  onUpdateEmployee={updateEmployee}
                  onDeleteEmployee={deleteEmployee}
                />
                <Footer />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <>
                <Navigation isAuthenticated={isAuthenticated} logout={logout} />
                <Register />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;

