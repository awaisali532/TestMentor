// src/api/subjectApi.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api/subjects";

export const addSubject = (data) => axios.post(`${API_BASE}/add`, data);
export const getSubjects = () => axios.get(API_BASE);
export const updateSubject = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteSubject = (id) => axios.delete(`${API_BASE}/${id}`);
