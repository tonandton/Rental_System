import { useState } from "react";

function History({ history, role, setBill }) {
  const [modalImage, setModalImage] = useState(null);

  const groupedHistory = history.reduce((acc, entry) => {
    if (!entry.project_name) return acc;
    acc[entry.project_name] = acc[entry.project_name] || [];
    acc[entry.project_name].push(entry);
    return acc;
  }, {});

  const formatMonth = (month) => {
    if (!month) return "-";
    const [year, monthNum] = month.split("-");
    return new Date(year, monthNum - 1).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
    });
  };

  const handleViewImage = (image) => {
    if (image) {
      setModalImage(`http://localhost:3001/uploads/${image}`);
    }
  };

  // console.log(history);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl sm:mb-6 lg:text-2xl font-semibold gray-800 mb-4">
        ประวัติการบันทึกค่าใช้จ่าย
      </h2>
      {history.length === 0 ? (
        <p className="gray-500 text-sm sm:text-base">
          ไม่มีประวัติที่ตรงกับตัวกรอง
        </p>
      ) : (
        Object.keys(groupedHistory).map((proj) => (
          <div key={proj} className="mb-4 sm:mb-8">
            <h3
              key={proj}
              className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-3 sm:mb-4"
            >
              โครงการ: {proj} (ค่าน้ำ {groupedHistory[proj][0].water_rate}{" "}
              บาท/หน่วย, ค่าไฟ {groupedHistory[proj][0].electricity_rate}{" "}
              บาท/หน่วย)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="">
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      เดือนที่บันทึก
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      บันทึกโดย
                    </th>
                    {/* <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      ค่าเช่า
                    </th> */}
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      มิเตอร์น้ำ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      หน่วยน้ำ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      ค่าน้ำ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      รูปมิเตอร์น้ำ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      มิเตอร์ไฟ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      หน่วยไฟ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      ค่าไฟ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      รูปมิเตอร์ไฟ
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      ยอดรวม
                    </th>
                    <th className="border p-1 sm:p-2 word-break break-word text-xs sm:text-sm lg:text:base">
                      บิล
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedHistory[proj].map((entry) => (
                    <tr key={entry.id}>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base  word-break break-word">
                        {formatMonth(entry.record_month)}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base word-break break-word">
                        {entry.name || entry.username}
                      </td>
                      {/* <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.rent.toLocaleString("th-TH")} บาท
                      </td> */}
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.water_meter.toLocaleString()}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.water_units.toLocaleString("th-TH")}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.water_cost.toLocaleString("th-TH")} บาท
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base">
                        {entry.water_image ? (
                          <button
                            onClick={() => handleViewImage(entry.water_image)}
                            className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-blue-700 text-sx sm:text-sm flex items-center gap-1"
                            aria-label="ดูรูปมิเตอร์น้ำ"
                          >
                            <i className="fas fa-image"></i> ดูรูป
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.electricity_meter.toLocaleString()}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.electricity_units.toLocaleString("th-TH")}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.electricity_cost.toLocaleString("th-TH")} บาท
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base">
                        {entry.electricity_image ? (
                          <button
                            onClick={() =>
                              handleViewImage(entry.electricity_image)
                            }
                            className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-blue-700 text-sx sm:text-sm flex items-center gap-1"
                            aria-label="ดูรูปมิเตอร์ไฟ"
                          >
                            <i className="fas fa-image"></i> ดูรูป
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        {entry.total.toLocaleString("th-TH")} บาท
                      </td>
                      <td className="border p-1 sm:p-2 text-xs sm:text-sm lg:text-base text-right word-break break-word">
                        <button
                          onClick={() => setBill(entry)}
                          className="border p-1 sm:p-2 lg:text-base bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-green-700 text-xs sm:text-sm flex items-center gap-1"
                          aria-label="ดูบิล"
                        >
                          <i className="fas fa-file-invoice"></i> ดูบิล
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {modalImage && (
        <div className="modal" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalImage(null)}
              className="close-button"
              aria-label="ปิดหน้าต่างรูปภาพ"
            >
              {/* <i className="fas fa times"></i> */}
            </button>
            <img src={modalImage} alt="Meter Image" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
