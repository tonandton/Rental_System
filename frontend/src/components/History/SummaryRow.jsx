import React from "react";

const SummaryRow = ({ data }) => {
  const summary = data.reduce(
    (acc, item) => {
      acc.totalWaterUnits += Number(item.water_units) || 0;
      acc.totalWaterBill += Number(item.water_bill) || 0;
      acc.totalElectricityUnits += Number(item.electricity_units) || 0;
      acc.totalElectricityBill += Number(item.electricity_bill) || 0;

      return acc;
    },
    {
      totalWaterUnits: 0,
      totalWaterBill: 0,
      totalElectricityUnits: 0,
      totalElectricityBill: 0,
    }
  );

  return (
    <tbody>
      <tr className="bg-green-200 hover:bg-green-300 font-semibold">
        <td className="text-right pr-2">ยอดรวมทั้งหมด</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td className="underline">{Number(summary.totalWaterUnits)} / หน่วย</td>
        <td className="underline">
          {Number(summary.totalWaterBill).toFixed(2)} / บาท
        </td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td className="underline">
          {Number(summary.totalElectricityUnits)} / หน่วย
        </td>
        <td className="underline">
          {Number(summary.totalElectricityBill).toFixed(2)} / บาท
        </td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
    </tbody>
  );
};

export default SummaryRow;
