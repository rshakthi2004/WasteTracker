package com.example.servlets;

import com.example.utils.DBUtils;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/deleteData")
public class DeleteDataServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        System.out.println("=== DELETE DATA REQUEST ===");
        
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        
        String idStr = request.getParameter("id");
        System.out.println("Delete request for ID: " + idStr);
        
        if (idStr == null || idStr.trim().isEmpty()) {
            System.out.println("ERROR: Missing ID parameter");
            response.getWriter().write("error: Missing ID parameter");
            return;
        }
        
        try {
            int id = Integer.parseInt(idStr.trim());
            System.out.println("Parsed ID: " + id);
            
            try (Connection conn = DBUtils.getConnection()) {
                System.out.println("Database connection established for delete");
                
                String sql = "DELETE FROM collected_data WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, id);
                
                int rowsAffected = stmt.executeUpdate();
                System.out.println("Rows affected by delete: " + rowsAffected);
                
                if (rowsAffected > 0) {
                    System.out.println("Delete successful");
                    response.getWriter().write("success");
                } else {
                    System.out.println("No entry found with ID: " + id);
                    response.getWriter().write("error: No entry found with the specified ID");
                }
                
            } catch (Exception dbException) {
                dbException.printStackTrace();
                System.out.println("Database error in delete: " + dbException.getMessage());
                response.getWriter().write("error: Database error - " + dbException.getMessage());
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Invalid ID format: " + idStr);
            response.getWriter().write("error: Invalid ID format");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("General error in delete: " + e.getMessage());
            response.getWriter().write("error: Server error - " + e.getMessage());
        }
        
        System.out.println("=== DELETE DATA REQUEST END ===");
    }
}