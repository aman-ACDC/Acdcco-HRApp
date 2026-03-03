// hr-app-landing-page/src/api/baseClient.js
import axios from "axios";

const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const baseClient = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

export default baseClient;
