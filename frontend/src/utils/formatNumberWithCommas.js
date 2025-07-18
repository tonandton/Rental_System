/**

แปลงตัวเลขให้มี , คั่นหลักพัน
@param {number\string} number
@returns {string}

*/

export default function formatNumberWithCommas(number) {
  if (!number && number !== 0) return "-";
  const num = Number(number);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-US");
}
