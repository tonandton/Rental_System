import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Main({ token, role, setToken, setRole }) {
  const [project, setProject] = useState("");
  const [projectWaterRate, setProjectWaterRate] = useState("");
  const [projectElectricityRate, setProjectElectricityRate] = useState("");
  const [projects, setProjects] = useState([]);
  const [rent, setRent] = useState("");
  const [waterMeter, setWtaterMeter] = useState("");
  const [electricityMeter, setElectricityMeter] = useState("");
  const [history, setHistory] = useState("");
  const [bill, setBill] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <div className="text-3xl font-bold">ระบบจัดการค่าเช่าห้อง</div>
      </div>
    </div>
  );
}

export default Main;
