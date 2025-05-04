function History({ history, role }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="hidden sm:block bg-white shadow-lg rounded-lg overflow-x-auto">
      <table className="min-w-[1200px] w-full divide-y divide-gray-2000">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              วันที่เช่า
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              โครงการ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              ผู้ใช้
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              ค่าเช่า
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              มิเตอร์น้ำก่อนหน้า
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              มิเตอร์น้ำปัจจุบัน
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              หน่วยน้ำ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              ค่าน้ำ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              รูปค่าน้ำ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              มิเตอร์ไฟก่อนหน้า
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              มิเตอร์ไฟปัจจุบัน
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              หน่วยไฟ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              ค่าไฟ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              รูปค่าไฟ
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(history) &&
            history.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {new Date(item.rental_date).toLocaleDateString("th-TH")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.project_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.username}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.amount.toLocaleString("th-TH")} บาท
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.previous_water_meter
                    ? item.previous_water_meter.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.current_water_meter
                    ? item.current_water_meter.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.water_unit
                    ? item.water_unit.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.water_bill
                    ? item.water_bill.toLocaleString("th-TH")
                    : "-"}{" "}
                  บาท
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.water_image_path ? (
                    <a
                      href={`${API_BASE_URL}${item.water_image_path}`}
                      target="_blank"
                      rel="noopener noreferer"
                    >
                      <img
                        src={`${API_BASE_URL}${item.water_image_path}`}
                        alt="ค่าน้ำ"
                        className="h-16 w-16 object-cover rounded"
                      />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.previous_electricity_meter
                    ? item.previous_electricity_meter.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.current_electricity_meter
                    ? item.current_electricity_meter.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.electricity_units
                    ? item.electricity_units.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.electricity_bill
                    ? item.electricity_bill.toLocaleString("th-TH")
                    : "-"}{" "}
                  บาท
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.electricity_image_path ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL}${
                        item.electricity_image_path
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          item.electricity_image_path
                        }`}
                        alt="ค่าไฟ"
                        className="h-16 w-16 object-cover rounded"
                      />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.status === "pending"
                    ? "รอดำเนินการ"
                    : item.status === "completed"
                    ? "สำเร็จ"
                    : "ยกเลิก"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
