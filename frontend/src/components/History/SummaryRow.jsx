import React from "react";

const SummaryRow = ({ data }) => {
  const summary = data.reduce(
    (acc, item) => {
      acc.totalWaterBill += Number(item.water_bill) || 0;
      acc.totalElectricityBill += Number(item.electricity_bill) || 0;

      return acc;
    },
    {
      totalWaterBill: 0,
      totalElectricityBill: 0,
    }
  );

  return (
    <tbody>
      <tr className="bg-green-100 font-semibold">
        <td className="text-right pr-2">รวมทั้งหมด</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>{Number(summary.totalWaterBill).toFixed(2)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>{Number(summary.totalElectricityBill).toFixed(2)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
    </tbody>
  );
};

export default SummaryRow;
