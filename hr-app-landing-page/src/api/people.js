import client from "./client";

/**
 * Create new employee (Person)
 * Sends fields exactly as backend expects
 */
export const createPerson = async (payload, token) => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };

  const res = await client.post("/employees/", payload, { headers });

  return res.data;
};

/**
 * Update employee
 */
export const updatePerson = async (id, payload, token) => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };

  const res = await client.patch(`/employees/${id}/`, payload, { headers });

  return res.data;
};

/**
 * Delete employee
 */
export const deletePerson = async (id, token) => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const res = await client.delete(`/employees/${id}/`, { headers });

  return res.data;
};

/**
 * Fetch HR employees
 */
export const fetchHRPeople = async () => {
  const res = await client.get("/employees/filter_employees/", {
    params: { department: "Human Resources" },
  });

  const data = res.data?.results ?? res.data;

  return Array.isArray(data) ? data : data?.results ?? [];
};

/**
 * Setup portal account
 */
export const setPortalAccount = async (personId, portalData, token) => {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };

  const res = await client.patch(
    `/employees/${personId}/set_portal_account/`,
    portalData,
    { headers }
  );

  return res.data;
};
