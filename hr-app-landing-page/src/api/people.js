// import client from "./client";

// export async function createPerson(payload) {
//   // normalize time_commitment to a number or null
//   const tcRaw = payload.time_commitment;
//   const timeCommitment =
//     tcRaw === "" || tcRaw === undefined || tcRaw === null
//       ? null
//       : Number.parseInt(tcRaw, 10);

//   const body = {
//     full_name: payload.name || "",
//     // position can come from your select as "position" or from older code as "title"
//     position: payload.position || payload.title || "",
//     department: payload.department || "",
//     status:
//       payload.status === "On leave"
//         ? "on_leave"
//         : payload.status === "Employee"
//         ? "active"
//         : (payload.status || "inactive").toLowerCase(),
//     start_date: payload.startDate || null,
//     timezone: payload.location || null,
//     acdc_email: payload.acdc_email || null,
//     personal_email: payload.personal_email || null,
//     phone: payload.phone || null,
//     subteam: payload.subteam || null,

//     // 👇 new fields
//     time_commitment: timeCommitment,
//     reports_to: payload.reports_to || "",
//   };

//   const { data } = await client.post("/employees/", body);
//   return data; // returns the created Person from backend
// }

// export async function updatePerson(id, payload) {
//   const { data } = await client.patch(`/employees/${id}/`, payload);
//   return data;
// }

// export async function deletePerson(id) {
//   await client.delete(`/employees/${id}/`);
// }
import client from "./client";

/**
 * Map frontend form payload -> backend Person model fields
 */
const mapToBackendPerson = (payload) => {
  // payload is coming from EmployeeForm as:
  // { name, title, department, status, startDate, location, acdc_email, personal_email, phone, subteam, reports_to, time_commitment, ... }

  return {
    full_name: payload.name || "",
    position: payload.title || "",
    department: payload.department || "",
    // backend expects one of: active/inactive/on_leave
    status: "active",
    start_date: payload.startDate || "",
    timezone: payload.location || "",
    acdc_email: payload.acdc_email || null,
    personal_email: payload.personal_email || null,
    phone: payload.phone || null,
    subteam: payload.subteam || null,
    reports_to: payload.reports_to || null,
    time_commitment: payload.time_commitment ? Number(payload.time_commitment) : null,

    // keep portal fields untouched here (Register handles these)
    portal_email: payload.portal_email ?? null,
    portal_role: payload.portal_role ?? null,
    portal_password: payload.portal_password ?? null,
  };
};

export const createPerson = async (payload, token) => {
  const data = mapToBackendPerson(payload);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await client.post("/employees/", data, headers ? { headers } : undefined);
  return res.data;
};

export const updatePerson = async (id, payload) => {
  // Accept either frontend-style keys or backend-style keys
  const data =
    payload.full_name || payload.start_date
      ? payload
      : mapToBackendPerson(payload);

  const res = await client.patch(`/employees/${id}/`, data);
  return res.data;
};

export const deletePerson = async (id) => {
  const res = await client.delete(`/employees/${id}/`);
  return res.data;
};

export const fetchHRPeople = async () => {
  const res = await client.get("/employees/filter_employees/", {
    params: { department: "Human Resources" },
  });

  const data = res.data?.results ?? res.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
};

export const setPortalAccount = async (personId, portalData) => {
  const res = await client.patch(`/employees/${personId}/set_portal_account/`, portalData);
  return res.data;
};
