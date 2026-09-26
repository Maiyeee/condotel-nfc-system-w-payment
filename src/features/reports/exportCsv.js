function toCsvRow(values) {
  return values
    .map((value) => {
      const str = String(value ?? "");
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    })
    .join(",");
}

export function buildReportCsv({ range, revenue, byDay, byMethod, byRoom, occupancy, reservations }) {
  const lines = [];

  lines.push(toCsvRow(["Condotel Report", `Range: ${range}`, `Generated: ${new Date().toISOString()}`]));
  lines.push("");

  lines.push(toCsvRow(["Summary"]));
  lines.push(toCsvRow(["Total Revenue", revenue.totalRevenue]));
  lines.push(toCsvRow(["Paid Transactions", revenue.paidCount]));
  lines.push(toCsvRow(["Pending Transactions", revenue.pendingCount]));
  lines.push(toCsvRow(["Failed Transactions", revenue.failedCount]));
  lines.push(toCsvRow(["Average Transaction", revenue.avgTransaction]));
  lines.push(toCsvRow(["Occupancy Rate (%)", occupancy.rate]));
  lines.push(toCsvRow(["Total Reservations", reservations.total]));
  lines.push("");

  lines.push(toCsvRow(["Revenue by Day"]));
  lines.push(toCsvRow(["Date", "Total"]));
  byDay.forEach((row) => lines.push(toCsvRow([row.date, row.total])));
  lines.push("");

  lines.push(toCsvRow(["Revenue by Payment Method"]));
  lines.push(toCsvRow(["Method", "Total"]));
  byMethod.forEach((row) => lines.push(toCsvRow([row.name, row.value])));
  lines.push("");

  lines.push(toCsvRow(["Top Rooms by Revenue"]));
  lines.push(toCsvRow(["Room", "Total"]));
  byRoom.forEach((row) => lines.push(toCsvRow([row.room, row.total])));

  return lines.join("\n");
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
