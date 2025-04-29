import { useState, useEffect, use } from "react";
import axios from "axios";

function FilterForm({
  showFilter,
  setShowFilter,
  projects,
  history,
  setHistory,
  token,
  role,
}) {
  const [filterProject, setFilterProject] = useState("");
  const [filterWaterMin, setFilterWaterMin] = useState("");
  const [filterWaterMax, setFilterWaterMax] = useState("");
  const [filterElectricityMin, setFilterElectricityMin] = useState("");
  const [filterElectricityMax, setFilterElecttricityMax] = useState("");
  const [filterRecordMonth, setFilterRocordMonth] = useState("");
  const [usernames, setUsernames] = useState([]);
}

return (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
      <h2 className="text-lg sm:text-xl font-semibold">กรองประวัติ</h2>
      <button className="bg-red-500 text-white hover:bg-red-500">
        ซ่อนตัวกรอง
      </button>
    </div>
  </div>
);
