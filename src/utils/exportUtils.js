import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

/**
 * Downloads data as a CSV file
 */
export const downloadCSV = (filename, headers, rows) => {
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads data as a JSON file
 */
export const downloadJSON = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a DOM element as a PDF
 */
export const downloadPDF = async (filename, elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
};

/**
 * Specific exports for Daily Record
 */
export const exportDailyRecord = {
  pdf: async (date, elementId) => {
    await downloadPDF(`Daily_Record_${date}`, elementId);
  },
  csv: (date, data) => {
    const headers = ["Category", "Content", "Status/Details"];
    const rows = [];
    
    // Todos
    data.todos.forEach(t => rows.push(["Todo", t.text, t.done ? "Completed" : "Pending"]));
    
    // Habits
    data.habits.forEach(h => rows.push(["Habit", h.name, h.done ? "Checked" : "Unchecked"]));
    
    // Timelog
    Object.keys(data.timelogs).forEach(hour => {
      Object.keys(data.timelogs[hour]).forEach(slot => {
        const val = data.timelogs[hour][slot];
        if (val) rows.push(["Timelog", `${hour}:${slot}`, val]);
      });
    });
    
    // Diary
    if (data.diary) rows.push(["Diary", "Content", data.diary]);

    downloadCSV(`Daily_Record_${date}`, headers, rows);
  },
  json: (date, data) => {
    downloadJSON(`Daily_Record_${date}`, data);
  }
};

/**
 * Specific exports for Monthly Ledger
 */
export const exportMonthlyLedger = {
  pdf: async (month, elementId) => {
    await downloadPDF(`Account_Book_${month}`, elementId);
  },
  csv: (month, ledgerData) => {
    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = ledgerData.map(l => [
      l.date,
      l.type === "income" ? "Income" : "Expense",
      l.cat,
      l.amount,
      l.note || ""
    ]);
    downloadCSV(`Account_Book_${month}`, headers, rows);
  },
  json: (month, ledgerData) => {
    downloadJSON(`Account_Book_${month}`, ledgerData);
  }
};
