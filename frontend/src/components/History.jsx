function History({ history, role }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              วันที่เช่า
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              โครงการ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              ผู้ใช้
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              ค่าเช่า
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              มิเตอร์น้ำก่อนหน้า
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              มิเตอร์น้ำปัจจุบัน
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              หน่วยน้ำ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              ค่าน้ำ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              รูปค่าน้ำ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              มิเตอร์ไฟก่อนหน้า
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              มิเตอร์ไฟปัจจุบัน
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              หน่วยไฟ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              ค่าไฟ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              รูปค่าไฟ
            </th>
            <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(history) &&
            history.map((item) => (
              <tr key={item.id}>
                <td className="px-2 py-4 whitespace nowrap">
                  {new Date(item.rental_date).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.amount.toLocaleString("th-TH")} บาท
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.previous_water_meter
                    ? item.previous_water_meter.toLocaleString("th-TH")
                    : "-"}{" "}
                  หน่วย
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.project_name}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
