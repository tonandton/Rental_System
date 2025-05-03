import { useState } from "react";

function FilterForm({ projects, onFilterChange }) {
  const [month, setMonth] = useState();
  const [year, seteYear] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ month, year, projectId });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md"
    >
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="">เลือกเดือน</option>
        {[...Array(12).keys()].map((m) => (
          <option key={m + 1} value={m + 1}>
            {new Date(0, m).toLocaleString("th-TH", { month: "long" })}
          </option>
        ))}
      </select>
    </form>
  );
}

export default FilterForm;
