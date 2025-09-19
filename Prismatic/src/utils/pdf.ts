// Utility: PDF generation using jsPDF
// Purpose: Provide simple helpers to export tables/reports as real PDFs.

import { jsPDF } from 'jspdf'

export function exportLogsPdf(rows: Array<[string, string, string, string, string]>) {
  const doc = new jsPDF({ unit: 'pt' })
  const margin = 36
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Prismatic - Audit Logs', margin, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  rows.forEach(([date, action, system, user, result]) => {
    if (y > 760) { doc.addPage(); y = margin }
    doc.text(`${date} | ${action} | ${system} | ${user} | ${result}`, margin, y)
    y += 14
  })

  doc.save('logs.pdf')
}

export function exportDsarReportPdf(data: { id: string; type: string; date: string; items?: number; status: string; processedBy?: string }) {
  const doc = new jsPDF({ unit: 'pt' })
  const margin = 36
  let y = margin
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Prismatic - DSAR Report', margin, y)
  y += 24

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  const lines = [
    `Request ID: ${data.id}`,
    `Type: ${data.type}`,
    `Date: ${data.date}`,
    `Status: ${data.status}`,
    `Processed By: ${data.processedBy || '—'}`,
    `Items Affected: ${data.items ?? 0}`,
  ]
  lines.forEach(line => { doc.text(line, margin, y); y += 18 })

  doc.save(`dsar_${data.id}.pdf`)
}


