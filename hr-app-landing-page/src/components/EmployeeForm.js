import React, { useState } from "react";
import { createPerson } from "../api/people";
import { useAuthStore } from "../store/authStore";
import "./EmployeeForm.css";

const INITIAL_DEPARTMENTS = [
  "Engineering",
  "Product Management",
  "Design",
  "Sales",
  "Marketing",
  "Executive",
  "Human Resources",
  "Finance",
];

const POSITION_CHOICES = ["Volunteer", "Manager", "Asst. Director", "Director"];
const REPORTS_TO_CHOICES = ["Asst. Director", "Director", "Jenny"];
const ADD_NEW_DEPT_VALUE = "__ADD_NEW_DEPARTMENT__";

function EmployeeForm({ onAddEmployee }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  // Token from Zustand
  const accessToken = useAuthStore((state) => state.accessToken);

  const getToken = () =>
    accessToken ||
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    "";

  /* ---------------- Departments ---------------- */

  const handleDepartmentChange = (e) => {
    const value = e.target.value;

    if (value === ADD_NEW_DEPT_VALUE) {
      setShowNewDeptInput(true);
      setNewDeptName("");
      return;
    }

    setSelectedDepartment(value);
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const handleAddNewDept = () => {
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    setDepartments((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );

    setSelectedDepartment(trimmed);
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const handleCancelNewDept = () => {
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      alert("Please login again.");
      return;
    }

    const form = e.currentTarget;

    setLoading(true);
    setMessage("");

    try {
      const fd = new FormData(form);

      /* ---------- Build full name ---------- */

      const first = (fd.get("first_name") || "").trim();
      const last = (fd.get("last_name") || "").trim();
      const fullName = `${first} ${last}`.trim();

      if (!fullName) {
        setMessage("❌ Name cannot be empty");
        setLoading(false);
        return;
      }

      /* ---------- Date ---------- */

      const startDate = fd.get("start_date");

      /* ---------- Position ---------- */

      const position = (fd.get("position") || "").trim();

      const memberType =
        position.toLowerCase() === "volunteer"
          ? "volunteer"
          : "employee";

      /* ---------- Payload (Backend Format) ---------- */

      const payload = {
        full_name: fullName,

        personal_email: fd.get("personal_email") || "",
        phone: fd.get("phone") || "",

        subteam: fd.get("subteam") || "",

        start_date: startDate,

        department: fd.get("department") || "",
        position: position,

        timezone: fd.get("timezone") || "",

        reports_to: fd.get("reports_to") || "",
        acdc_email: fd.get("acdc_email") || "",

        skills: fd.get("skills") || "",
        bio: fd.get("bio") || "",

        time_commitment: Number(fd.get("time_commitment") || 0),

        status: "active",
        member_type: memberType,
      };

      /* ---------- API ---------- */

      const created = await createPerson(payload, token);

      /* ---------- Map for UI ---------- */

      const mapped = {
        id: created.id,
        name: created.full_name || "",
        title: created.position || "",
        department: created.department || "",
        status:
          created.status === "on_leave"
            ? "On leave"
            : created.status === "active"
            ? "Employee"
            : "Inactive",

        startDate: created.start_date || "",
        location: created.timezone || "",

        acdc_email: created.acdc_email || "",
        personal_email: created.personal_email || "",

        phone: created.phone || "",
        reports_to: created.reports_to || "",

        time_commitment: created.time_commitment || "",
      };

      onAddEmployee(mapped);

      /* ---------- Reset ---------- */

      form.reset();
      setSelectedDepartment("");
      setShowNewDeptInput(false);
      setNewDeptName("");

      setMessage("✅ Employee added successfully");
    } catch (err) {
      console.error("Create employee error:", err);

      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 401 || status === 403) {
        setMessage("❌ Session expired. Please login again.");
      } else if (status === 400 && data) {
        const pretty = Object.entries(data)
          .map(
            ([k, v]) =>
              `${k}: ${Array.isArray(v) ? v.join(" ") : v}`
          )
          .join("\n");

        setMessage(`❌ Failed to add employee:\n${pretty}`);
      } else {
        setMessage("❌ Failed to add employee");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <section
      className="add-employee-wrap"
      id="add-employee"
      style={{ paddingTop: "120px" }}
    >
      <h1
        className="add-employee-title"
        style={{ color: "#111", marginBottom: "18px" }}
      >
        Add New Employee
      </h1>

      <form className="ae-form" onSubmit={handleSubmit}>

        {/* Name */}

        <div className="ae-field">
          <label>First Name *</label>
          <input name="first_name" required />
        </div>

        <div className="ae-field">
          <label>Last Name *</label>
          <input name="last_name" required />
        </div>

        {/* Email */}

        <div className="ae-field">
          <label>Email *</label>
          <input name="personal_email" type="email" required />
        </div>

        {/* Phone */}

        <div className="ae-field">
          <label>Phone</label>
          <input name="phone" />
        </div>

        {/* ID */}

        <div className="ae-field">
          <label>Employee ID *</label>
          <input name="subteam" required />
        </div>

        {/* Date */}

        <div className="ae-field">
          <label>Start Date *</label>
          <input type="date" name="start_date" required />
        </div>

        {/* Department */}

        <div className="ae-field">
          <label>Department *</label>

          <select
            name="department"
            required
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="" disabled>
              Select
            </option>

            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}

            <option value={ADD_NEW_DEPT_VALUE}>
              + Add new
            </option>
          </select>

          {showNewDeptInput && (
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Department name"
              />

              <button type="button" onClick={handleAddNewDept}>
                Add
              </button>

              <button type="button" onClick={handleCancelNewDept}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Position */}

        <div className="ae-field">
          <label>Position *</label>

          <select name="position" required defaultValue="">
            <option value="" disabled>
              Select
            </option>

            {POSITION_CHOICES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Hours */}

        <div className="ae-field">
          <label>Hours / Week *</label>

          <input
            name="time_commitment"
            type="number"
            min="1"
            max="80"
            required
          />
        </div>

        {/* Location */}

        <div className="ae-field">
          <label>Location *</label>

          <select name="timezone" required defaultValue="">
            <option value="" disabled>
              Select
            </option>

            <option value="EST">EST</option>
            <option value="CST">CST</option>
            <option value="MST">MST</option>
            <option value="PST">PST</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        {/* Reports */}

        <div className="ae-field">
          <label>Reports To</label>

          <select name="reports_to" defaultValue="">
            <option value="">None</option>

            {REPORTS_TO_CHOICES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ACDC */}

        <div className="ae-field ae-span-2">
          <label>ACDC Email</label>
          <input name="acdc_email" />
        </div>

        {/* Skills */}

        <div className="ae-field ae-span-2">
          <label>Skills</label>
          <input name="skills" />
        </div>

        {/* Bio */}

        <div className="ae-field ae-span-2">
          <label>Bio</label>
          <textarea name="bio" rows="4" />
        </div>

        {/* Submit */}

        <div className="ae-actions ae-span-2">
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>

      {message && (
        <p style={{ whiteSpace: "pre-line" }} className="ae-msg">
          {message}
        </p>
      )}
    </section>
  );
}

export default EmployeeForm;
