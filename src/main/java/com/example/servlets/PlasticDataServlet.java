package com.example.servlets;

import com.example.utils.DBUtils;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet("/submitData")
@MultipartConfig(
    maxFileSize = 1024 * 1024 * 5, // 5 MB
    maxRequestSize = 1024 * 1024 * 10, // 10 MB
    fileSizeThreshold = 1024 * 1024 // 1 MB
)
public class PlasticDataServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Set response content type
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        
        // Add CORS headers if needed
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        try {
            // Get form parameters and TRIM them
            String studentName = request.getParameter("studentName");
            String item = request.getParameter("item");
            String plasticItem = request.getParameter("plasticItem");
            String quantityStr = request.getParameter("quantity");
            String date = request.getParameter("date");

            // Trim all string values to remove whitespace
            if (studentName != null) studentName = studentName.trim();
            if (item != null) item = item.trim();
            if (plasticItem != null) plasticItem = plasticItem.trim();
            if (quantityStr != null) quantityStr = quantityStr.trim();
            if (date != null) date = date.trim();

            // Validate required fields
            if (studentName == null || studentName.isEmpty() ||
                item == null || item.isEmpty() ||
                plasticItem == null || plasticItem.isEmpty() ||
                quantityStr == null || quantityStr.isEmpty() ||
                date == null || date.isEmpty()) {
                
                response.getWriter().write("error: Missing required fields");
                return;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    response.getWriter().write("error: Quantity must be positive");
                    return;
                }
            } catch (NumberFormatException e) {
                response.getWriter().write("error: Invalid quantity format");
                return;
            }

            // Get the photo part
            Part photoPart = request.getPart("photo");
            
            try (Connection conn = DBUtils.getConnection()) {
                String sql = "INSERT INTO collected_data(studentName, item, plasticItem, quantity, date, photo) VALUES (?,?,?,?,?,?)";
                PreparedStatement stmt = conn.prepareStatement(sql);

                // Insert trimmed values
                stmt.setString(1, studentName);
                stmt.setString(2, item);
                stmt.setString(3, plasticItem);
                stmt.setInt(4, quantity);
                stmt.setString(5, date);

                // Handle photo upload
                if (photoPart != null && photoPart.getSize() > 0) {
                    // Check if it's a valid image
                    String contentType = photoPart.getContentType();
                    if (contentType != null && contentType.startsWith("image/")) {
                        InputStream photoInputStream = photoPart.getInputStream();
                        stmt.setBlob(6, photoInputStream);
                    } else {
                        stmt.setNull(6, java.sql.Types.BLOB);
                    }
                } else {
                    stmt.setNull(6, java.sql.Types.BLOB);
                }

                int rows = stmt.executeUpdate();
                
                if (rows > 0) {
                    response.getWriter().write("success");
                } else {
                    response.getWriter().write("error: No rows affected");
                }
                
            } catch (Exception dbException) {
                dbException.printStackTrace();
                response.getWriter().write("error: Database error - " + dbException.getMessage());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("error: Server error - " + e.getMessage());
        }
    }
}