package com.inventory.services;

import com.inventory.payload.ForecastDTO;
import com.inventory.models.Transaction;
import com.inventory.repositories.TransactionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    public ByteArrayInputStream generateExcelReport() throws IOException {
        List<Transaction> transactions = transactionRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transactions");

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Product", "Type", "Quantity", "Date", "User"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Data Rows
            int rowIdx = 1;
            for (Transaction tx : transactions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(tx.getId());
                row.createCell(1).setCellValue(tx.getProductName());
                row.createCell(2).setCellValue(tx.getType());
                row.createCell(3).setCellValue(tx.getQuantity());
                row.createCell(4).setCellValue(tx.getTimestamp().toString());
                row.createCell(5).setCellValue(tx.getHandledBy());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
    public ByteArrayInputStream generateForecastReport(List<ForecastDTO> forecasts) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Demand Forecast");

            // 1. Style for Header
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 2. Create Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Product Name", "Current Stock", "Predicted Demand (7 Days)", "Status / Action", "Trend Data Points"};
            
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // 3. Fill Data Rows
            int rowIdx = 1;
            for (ForecastDTO dto : forecasts) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(dto.getProductName());
                row.createCell(1).setCellValue(dto.getCurrentStock());
                row.createCell(2).setCellValue(dto.getForecastNext7Days());
                
                // Color code the status in Excel if possible, or just text
                row.createCell(3).setCellValue(dto.getAction());
                
                // Optional: Summary of trend (e.g., number of data points used)
                int dataPoints = (dto.getTrendData() != null) ? dto.getTrendData().size() : 0;
                row.createCell(4).setCellValue(dataPoints + " days of history");
            }

            // 4. Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}