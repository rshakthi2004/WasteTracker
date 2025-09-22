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

@WebServlet("/updateData")
@MultipartConfig(
    maxFileSize = 1024 * 1024 * 5, // 5 MB
    maxRequestSize = 1024 * 1024 * 10, // 10 MB
    fileSizeThreshold = 1024 * 1024 // 1 MB
)
public class UpdateDataServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        System.out.println("=== UPDATE DATA REQUEST ===");
        
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        
        try {
            // Get form parameters and trim them
            String idStr = request.getParameter("id");
            String studentName = request.getParameter("studentName");
            String item = request.getParameter("item");
            String plasticItem = request.getParameter("plasticItem");
            String quantityStr = request.getParameter("quantity");
            String date = request.getParameter("date");

            // Trim all string values
            if (idStr != null) idStr = idStr.trim();
            if (studentName != null) studentName = studentName.trim();
            if (item != null) item = item.trim();
            if (plasticItem != null) plasticItem = plasticItem.trim();
            if (quantityStr != null) quantityStr = quantityStr.trim();
            if (date != null) date = date.trim();

            System.out.println("Update request - ID: " + idStr + ", Student: " + studentName + 
                             ", Item: " + item + ", Quantity: " + quantityStr);

            // Validate required fields
            if (idStr == null || idStr.isEmpty() ||
                studentName == null || studentName.isEmpty() ||
                item == null || item.isEmpty() ||
                plasticItem == null || plasticItem.isEmpty() ||
                quantityStr == null || quantityStr.isEmpty() ||
                date == null || date.isEmpty()) {
                
                System.out.println("ERROR: Missing required fields");
                response.getWriter().write("error: Missing required fields");
                return;
            }

            int id, quantity;
            try {
                id = Integer.parseInt(idStr);
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    System.out.println("ERROR: Invalid quantity");
                    response.getWriter().write("error: Quantity must be positive");
                    return;
                }
            } catch (NumberFormatException e) {
                System.out.println("ERROR: Invalid number format");
                response.getWriter().write("error: Invalid number format");
                return;
            }

            // Get the photo part (optional)
            Part photoPart = request.getPart("photo");
            
            try (Connection conn = DBUtils.getConnection()) {
                System.out.println("Database connection established for update");
                
                String sql;
                PreparedStatement stmt;
                
                // Check if photo is being updated
                if (photoPart != null && photoPart.getSize() > 0) {
                    System.out.println("Updating with new photo");
                    sql = "UPDATE collected_data SET studentName=?, item=?, plasticItem=?, quantity=?, date=?, photo=? WHERE id=?";
                    stmt = conn.prepareStatement(sql);
                    stmt.setString(1, studentName);
                    stmt.setString(2, item);
                    stmt.setString(3, plasticItem);
                    stmt.setInt(4, quantity);
                    stmt.setString(5, date);
                    
                    // Handle photo upload
                    String contentType = photoPart.getContentType();
                    if (contentType != null && contentType.startsWith("image/")) {
                        InputStream photoInputStream = photoPart.getInputStream();
                        stmt.setBlob(6, photoInputStream);
                    } else {
                        stmt.setNull(6, java.sql.Types.BLOB);
                    }
                    
                    stmt.setInt(7, id);
                } else {
                    System.out.println("Updating without changing photo");
                    sql = "UPDATE collected_data SET studentName=?, item=?, plasticItem=?, quantity=?, date=? WHERE id=?";
                    stmt = conn.prepareStatement(sql);
                    stmt.setString(1, studentName);
                    stmt.setString(2, item);
                    stmt.setString(3, plasticItem);
                    stmt.setInt(4, quantity);
                    stmt.setString(5, date);
                    stmt.setInt(6, id);
                }

                int rowsAffected = stmt.executeUpdate();
                System.out.println("Rows affected by update: " + rowsAffected);
                
                if (rowsAffected > 0) {
                    System.out.println("Update successful");
                    response.getWriter().write("success");
                } else {
                    System.out.println("No entry found with ID: " + id);
                    response.getWriter().write("error: No entry found with the specified ID");
                }
                
            } catch (Exception dbException) {
                dbException.printStackTrace();
                System.out.println("Database error in update: " + dbException.getMessage());
                response.getWriter().write("error: Database error - " + dbException.getMessage());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("General error in update: " + e.getMessage());
            response.getWriter().write("error: Server error - " + e.getMessage());
        }
        
        System.out.println("=== UPDATE DATA REQUEST END ===");
    }
}