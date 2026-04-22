import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmployeeForm from "./EmployeeForm";
import { createPerson } from "../api/people";
import { useAuthStore } from "../store/authStore";

// Mock dependencies
jest.mock("../api/people");
jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock localStorage
const mockGetItem = jest.fn();
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: mockGetItem,
  },
});

describe("EmployeeForm Component", () => {
  const mockOnAddEmployee = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.mockImplementation(() => "fake-access-token");
    window.alert = jest.fn();
  });

  test("renders EmployeeForm properly", () => {
    render(<EmployeeForm onAddEmployee={mockOnAddEmployee} />);
    expect(screen.getByRole("heading", { name: /Add New Employee/i })).toBeInTheDocument();
    expect(screen.getByText(/First Name \*/i)).toBeInTheDocument();
  });

  test("submits form and calls onAddEmployee on success", async () => {
    createPerson.mockResolvedValueOnce({
      id: 1,
      full_name: "John Doe",
      department: "Engineering",
      position: "Manager",
      status: "active",
      start_date: "2023-10-01",
      timezone: "EST",
      acdc_email: "john@acdc.com",
      personal_email: "john@test.com",
      phone: "1234567890",
      reports_to: "Director",
      time_commitment: 40,
    });

    render(<EmployeeForm onAddEmployee={mockOnAddEmployee} />);

    // Since the label is simple matching, we can use matchers properly or use ByLabelText
    fireEvent.change(screen.getByText(/First Name \*/i).nextElementSibling, { target: { value: "John" } });
    fireEvent.change(screen.getByText(/Last Name \*/i).nextElementSibling, { target: { value: "Doe" } });
    fireEvent.change(screen.getByText(/^Email \*/i).nextElementSibling, { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByText(/Employee ID/i).nextElementSibling, { target: { value: "EMP-001" } });
    fireEvent.change(screen.getByText(/Start Date \*/i).nextElementSibling, { target: { value: "2023-10-01" } });
    fireEvent.change(screen.getByText(/Department \*/i).nextElementSibling, { target: { value: "Engineering" } });
    fireEvent.change(screen.getByText(/Member Type \*/i).nextElementSibling, { target: { value: "Employee" } });
    fireEvent.change(screen.getByText(/Position \*/i).nextElementSibling, { target: { value: "Manager" } });
    fireEvent.change(screen.getByText(/Hours \/ Week \*/i).nextElementSibling, { target: { value: "40" } });
    fireEvent.change(screen.getByText(/Location \*/i).nextElementSibling, { target: { value: "EST" } });

    fireEvent.click(screen.getByRole("button", { name: /Add Employee/i }));

    await waitFor(() => {
      expect(createPerson).toHaveBeenCalledTimes(1);
      expect(mockOnAddEmployee).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Employee added successfully/i)).toBeInTheDocument();
    });
  });

  test("disables Employee ID when Member Type is Volunteer", () => {
    render(<EmployeeForm onAddEmployee={mockOnAddEmployee} />);

    const memberTypeSelect = screen.getByText(/Member Type \*/i).nextElementSibling;
    const employeeIdInput = screen.getByText(/Employee ID/i).nextElementSibling;

    // Initial state
    expect(employeeIdInput).not.toBeDisabled();
    expect(employeeIdInput).toBeRequired();

    // Change to Volunteer
    fireEvent.change(memberTypeSelect, { target: { value: "Volunteer" } });

    expect(employeeIdInput).toBeDisabled();
    expect(employeeIdInput).not.toBeRequired();
  });
});
