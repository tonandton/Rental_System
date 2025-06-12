import { Link } from "react-router-dom";
import { Grid, Plus } from "lucide-react";

function Main({ token, role }) {
  const GuideSection = ({ title, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        {title}
      </h3>
      <div className="text-sm sm:text-base text-gray-600">{children}</div>
    </div>
  );

  return (
    <div className="xl:max-w-screen-xl mx-auto px-4 py-8 lg:max-w-screen-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Grid size={20} className="text-green-600" />
          ยินดีต้อนรับสู่ Mesuk Society
        </h1>
        <div className="flex gap-2">
          <Link
            to="/add-rental-history"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            เพิ่มรายการ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <GuideSection title="Mesuk Society คืออะไร?">
            <p>
              Mesuk Society เป็นระบบจัดการค่าเช่าและค่าน้ำไฟที่ใช้งานง่าย
              ช่วยให้คุณบันทึกรายการ จัดการโครงการ
              และดูแลผู้ใช้งานได้อย่างมีประสิทธิภาพ
              ไม่ว่าคุณจะเป็นเจ้าของอสังหาริมทรัพย์หรือผู้ดูแลระบบ Mesuk Society
              พร้อมช่วยลดความซับซ้อนในการบริหารจัดการ
            </p>
          </GuideSection>

          <GuideSection title="วิธีใช้งาน Mesuk Society">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>เข้าสู่ระบบ</strong>: ใช้ชื่อผู้ใช้และรหัสผ่านที่{" "}
                <Link to="/login" className="text-emerald-600 hover:underline">
                  หน้าล็อกอิน
                </Link>
              </li>
              <li>
                <strong>บันทึกรายการ</strong>: ไปที่{" "}
                <Link
                  to="/add-rental-history"
                  className="text-emerald-600 hover:underline"
                >
                  บันทึกรายการ
                </Link>{" "}
                เพื่อเพิ่มค่าเช่า ค่าน้ำ หรือค่าไฟ
              </li>
              {["superadmin", "admin"].includes(role) && (
                <>
                  <li>
                    <strong>จัดการโครงการ</strong>: เพิ่มหรือแก้ไขโครงการได้ที่{" "}
                    <Link
                      to="/projects"
                      className="text-emerald-600 hover:underline"
                    >
                      จัดการโครงการ
                    </Link>
                  </li>
                  <li>
                    <strong>จัดการผู้ใช้</strong>: ดูแลข้อมูลผู้ใช้ที่{" "}
                    <Link
                      to="/manage-users"
                      className="text-emerald-600 hover:underline"
                    >
                      จัดการผู้ใช้งาน
                    </Link>
                  </li>
                </>
              )}
              <li>
                <strong>ดาวน์โหลดข้อมูล</strong>: Export รายการเป็น Excel หรือ
                CSV และดาวน์โหลดบิลในหน้า{" "}
                <Link
                  to="/add-rental-history"
                  className="text-emerald-600 hover:underline"
                >
                  บันทึกรายการ
                </Link>
              </li>
            </ul>
          </GuideSection>

          <GuideSection title="เริ่มต้นใช้งาน">
            <p>
              เริ่มต้นด้วยการบันทึกรายการค่าเช่าหรือค่าน้ำไฟครั้งแรกของคุณ
              คลิกปุ่ม "เพิ่มรายการ" ด้านบน หรือสำรวจฟีเจอร์อื่นๆ
              ผ่านเมนูด้านข้าง
            </p>
            <Link
              to="/add-rental-history"
              className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              เริ่มต้นทันที
            </Link>
          </GuideSection>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            ฟีเจอร์ในอนาคต
          </h3>
          <ul className="space-y-2 text-sm sm:text-base text-gray-600">
            <li className="flex items-center gap-2">
              📊 <span>Analytics: ดูกราฟสรุปยอดรายเดือน</span>
            </li>
            <li className="flex items-center gap-2">
              🔔 <span>Notifications: รับแจ้งเตือนการชำระเงิน</span>
            </li>
            <li className="flex items-center gap-2">
              📄 <span>Reports: สร้างรายงานสรุปประจำปี</span>
            </li>
            <li className="flex items-center gap-2">
              ❓ <span>FAQ: คำถามที่พบบ่อยและวิดีโอสอนการใช้งาน</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Main;
