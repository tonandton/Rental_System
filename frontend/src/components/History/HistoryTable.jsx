import { Edit, FileText, Image as ImageIcon, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

function HistoryTable({
  history,
  loading,
  error,
  retryFetch,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  tableRef,
  API_BASE_URL,
  onEdit,
  token,
  queryParams = {},
}) {
  const [popupImage, setPopupImage] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(`โหลดข้อมูลล้มเหลว: ${error}`, { autoClose: 3000 });
    }
  }, [error]);

  const handleRetry = async () => {
    try {
      await retryFetch();
      toast.success("โหลดข้อมูลใหม่สำเร็จ", { autoClose: 3000 });
    } catch (err) {
      toast.error("ลองใหม่ไม่สำเร็จ", { autoClose: 3000 });
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        params: queryParams, // ส่ง queryParams ที่ต้องการ
      });

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rental_history.xlsx";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ 📊", { autoClose: 3000 });
    } catch (error) {
      const msg =
        error.response?.status === 403
          ? "คุณไม่มีสิทธิ์ดาวโหลด"
          : "ดาวน์โหลดไฟล์ Excel ล้มเหลว";
      toast.error(msg, { autoClose: 3000 });
    } finally {
      setExporting(false);
    }
  };

  const downloadInvoicePDF = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/history/${id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("PDF download error:", err);
      alert("ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้");
    }
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("scrollable-table");
    if (!scrollContainer) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener("mousedown", (e) => {
      isDown = true;
      scrollContainer.classList.add("cursor-grabbing");
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener("mouseleave", () => {
      isDown = false;
      scrollContainer.classList.remove("cursor-grabbing");
    });

    scrollContainer.addEventListener("mouseup", () => {
      isDown = false;
      scrollContainer.classList.remove("cursor-grabbing");
    });

    scrollContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // scroll speed
      scrollContainer.scrollLeft = scrollLeft - walk;
    });
  }, []);

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="bg-white shadow-lg rounded-xl p-6 border ml-0 sm:ml-56 sm:max-w-[calc(100%-14rem)]"
      ref={tableRef}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={20} className="text-green-600" /> ข้อมูลรายการ
        </h2>
        <button
          onClick={handleExportExcel}
          disabled={loading || exporting}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          <Download size={16} />{" "}
          {exporting ? "กำลังดาวน์โหลด..." : "ดาวน์โหลด Excel 📊"}
        </button>
      </div>
      <div className="mt-4 animate-slide-in">
        {loading ? (
          <p className="text-gray-600">กำลังโหลด...</p>
        ) : error ? (
          <div className="text-red-600">
            <p>{error}</p>
            <button onClick={handleRetry} className="">
              ลองใหม่
            </button>
          </div>
        ) : (
          <div className="relative group">
            {/* ตารางสำหรับเดสก์ท็อป */}
            <div
              className="hidden sm:block overflow-x-auto"
              id="scrollable-table"
            >
              {/* ปุ่มเลื่อนซ้าย */}
              <button
                onClick={() =>
                  document
                    .getElementById("scrollable-table")
                    .scrollBy({ left: -200, behavior: "smooth" })
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-2 z-10
               opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0
               transition-all duration-300 ease-in-out"
              >
                ◀
              </button>
              <table className="min-w-[1200px] w-full divide-y divide-gray-200">
                <thead className="bg-green 50 sticky top-0">
                  <tr>
                    <th>รอบวันที่</th>
                    <th>เลขที่</th>
                    <th>โครงการ</th>
                    <th>เจ้าของโครงการ</th>
                    <th>มิเตอร์น้ำรอบที่ผ่านมา</th>
                    <th>มิเตอร์น้ำรอบปัจจุบัน</th>
                    <th>รูปมิเตอร์น้ำรอบปัจจุบัน</th>
                    <th>หน่วย</th>
                    <th>รวมค่าน้ำ</th>
                    <th>หมายเหตุเพิ่มเติมสำหรับมิเตอร์น้ำ</th>
                    <th>มิเตอร์ไฟรอบที่ผ่านมา</th>
                    <th>มิเตอร์ไฟรอบปัจจุบัน</th>
                    <th>รูปมิเตอร์ไฟรอบปัจจุบัน</th>
                    <th>หน่วย</th>
                    <th>รวมค่าไฟ</th>
                    <th>หมายเหตุเพิ่มเติมสำหรับมิเตอร์ไฟ</th>
                    <th>ผู้บันทึก</th>
                    <th>วันที่ลงข้อมูล</th>
                    <th>Action</th>
                    {/* <th>วันที่อัพเดทข้อมูล</th> */}
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length === 0 ? (
                    <tr>
                      <td>ไม่พบรายการ</td>
                    </tr>
                  ) : (
                    paginatedHistory.map((item, index) => (
                      <tr key={`${item.id}-${index}`}>
                        <td>
                          {new Date(item.rental_date).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td>{item.id}</td>
                        <td>{item.project_name}</td>
                        <td>{item.owner_first_name}</td>
                        <td>{Math.floor(item.previous_water_meter)}</td>
                        <td>{Math.floor(item.current_water_meter)}</td>
                        <td>
                          {item.water_image_path ? (
                            <img
                              src={`${API_BASE_URL}${item.water_image_path}`}
                              alt="รูปค่าน้ำ"
                              style={{
                                width: "60px",
                                height: "auto",
                                borderRadius: "6px",
                                cursor: "Pointer",
                              }}
                              onClick={() =>
                                setPopupImage(
                                  `${API_BASE_URL}${item.water_image_path}`
                                )
                              }
                            />
                          ) : (
                            "-"
                          )}
                          {popupImage && (
                            <div
                              className="fixed inset-0 flex items-center justify-center z-50"
                              onClick={() => setPopupImage(null)}
                            >
                              <img
                                src={popupImage}
                                alt="ภาพใหญ่"
                                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                              />
                            </div>
                          )}
                        </td>
                        <td>{Math.floor(item.water_units)}</td>
                        <td>{item.water_bill}</td>
                        <td>{item.water_description || "-"}</td>

                        <td>{Math.floor(item.previous_electricity_meter)}</td>
                        <td>{Math.floor(item.current_electricity_meter)}</td>
                        <td>
                          {item.electricity_image_path ? (
                            <img
                              src={`${API_BASE_URL}${item.electricity_image_path}`}
                              alt="รูปค่าไฟ"
                              style={{
                                width: "60px",
                                height: "auto",
                                borderRadius: "6px",
                                cursor: "Pointer",
                              }}
                              onClick={() =>
                                setPopupImage(
                                  `${API_BASE_URL}${item.electricity_image_path}`
                                )
                              }
                            />
                          ) : (
                            "-"
                          )}
                          {popupImage && (
                            <div
                              className="fixed inset-0 flex items-center justify-center z-50"
                              onClick={() => setPopupImage(null)}
                            >
                              <img
                                src={popupImage}
                                alt="ภาพใหญ่"
                                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                              />
                            </div>
                          )}
                        </td>
                        <td>{Math.floor(item.electricity_units)}</td>
                        <td>{item.electricity_bill}</td>
                        <td>{item.electricity_description || "-"}</td>
                        <td>{item.username}</td>
                        <td>
                          {" "}
                          {new Date(item.created_at).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        {/* <td>
                          {new Date(item.updated_at).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td> */}
                        <td>
                          <button
                            onClick={() => onEdit(item)}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            aria-label="แก้ไขรายการ"
                          >
                            <Edit size={16} className="mr-1" />
                            แก้ไขรายการบันทึก
                          </button>
                          <button
                            onClick={() => downloadInvoicePDF(item.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-2"
                          >
                            <FileText size={14} className="mr-1" />
                            PDF ใบแจ้งหนี้
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* ปุ่มเลื่อนขวา */}
              <button
                onClick={() =>
                  document
                    .getElementById("scrollable-table")
                    .scrollBy({ left: 200, behavior: "smooth" })
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-2 z-10
               opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0
               transition-all duration-300 ease-in-out"
              >
                ▶
              </button>
            </div>

            {/* ตารางสำหรับมือถือ */}
            <div className="sm:hidden space-y-4">
              {loading ? (
                <div className="text-center text-sm text-gray-500">
                  กำลังโหลด...
                </div>
              ) : paginatedHistory.length === 0 ? (
                <div className="text-center text-sm text-gray-500">
                  ไม่พบรายการ
                </div>
              ) : (
                paginatedHistory.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-white p-4 rounded-lg shadow border border-green-100"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {item.project_name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      รอบวันที่:{" "}
                      {new Date(item.rental_date).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      เจ้าของ: {item.owner_first_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      มิเตอร์น้ำก่อนหน้า:{" "}
                      {Math.floor(item.previous_water_meter)}
                    </div>
                    <div className="text-sm text-gray-600">
                      มิเตอร์น้ำปัจจุบัน: {Math.floor(item.current_water_meter)}
                    </div>
                    <div className="text-sm text-gray-600">
                      หน่วยน้ำ: {Math.floor(item.water_units)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ค่าน้ำ: {item.water_bill}
                    </div>
                    <div className="text-sm text-gray-600">
                      หมายเหตุเพิ่มเติมสำหรับมิเตอร์น้ำ:{" "}
                      {item.water_description || (
                        <span className="text-rose-600">{"ไม่มีข้อมูล"}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      มิเตอร์ไฟก่อนหน้า:{" "}
                      {Math.floor(item.previous_electricity_meter)}
                    </div>
                    <div className="text-sm text-gray-600">
                      มิเตอร์ไฟปัจจุบัน:{" "}
                      {Math.floor(item.current_electricity_meter)}
                    </div>
                    <div className="text-sm text-gray-600">
                      หน่วยไฟ: {Math.floor(item.electricity_units)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ค่าไฟ: {item.electricity_bill}
                    </div>
                    <div className="text-sm text-gray-600">
                      หมายเหตุเพิ่มเติมสำหรับมิเตอร์ไฟ:{" "}
                      {item.electricity_description || (
                        <span className="text-rose-600">{"ไม่มีข้อมูล"}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      ผู้บันทึก: {item.username}
                    </div>
                    <div className="text-sm text-gray-600">
                      วันที่ลง:{" "}
                      {new Date(item.created_at).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-3 flex space-x-2 flex-wrap gap-2">
                      {item.water_image_path && (
                        <button
                          onClick={() =>
                            setPopupImage(
                              `${API_BASE_URL}${item.water_image_path}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          aria-label="ดูรูปมิเตอร์น้ำ"
                        >
                          <ImageIcon size={16} className="mr-1" />{" "}
                          ดูรูปมิเตอร์น้ำ
                        </button>
                      )}
                      {popupImage && (
                        <div
                          className="fixed inset-0 flex items-center justify-center z-50"
                          onClick={() => setPopupImage(null)}
                        >
                          <img
                            src={popupImage}
                            alt="ภาพใหญ่"
                            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                      {item.electricity_image_path && (
                        <button
                          onClick={() =>
                            setPopupImage(
                              `${API_BASE_URL}${item.electricity_image_path}`
                            )
                          }
                          className="text-amber-600 hover:text-amber-800 flex items-center text-sm"
                          aria-label="ดูรูปมิเตอร์ไฟ"
                        >
                          <ImageIcon size={16} className="mr-1" />{" "}
                          ดูรูปมิเตอร์ไฟ
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(item)}
                        className="text-green-600 hover:text-green-800 flex items-center text-sm"
                        aria-label="แก้ไขรายการ"
                      >
                        <Edit size={16} className="mr-1" /> แก้ไขรายการบันทึก
                      </button>
                      <button
                        onClick={() => downloadInvoicePDF(item.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-2"
                      >
                        <FileText size={14} className="mr-1" />
                        PDF ใบแจ้งหนี้
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                >
                  ก่อนหน้า
                </button>
                <span className="px-4 py-2">
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryTable;
