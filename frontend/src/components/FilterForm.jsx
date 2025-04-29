import { useState, useEffect } from "react";
import axios from "axios";

function FilterForm({
  showFilter,
  setShowFilter,
  projects,
  history,
  setHistoty,
  token,
  role,
}) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">กรองข้อมูล</h2>
        <button className="bg-yellow-400 text-white hover:bg-yellow-500 font-bold">
          ซ่อนตัวกรอง
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm-gap-4">
        <select></select>
      </div>
    </div>
  );
}

export default FilterForm;
