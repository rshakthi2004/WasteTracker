package com.example.servlets;

import com.example.utils.DBUtils;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Blob;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/getData")
public class GetDataServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        System.out.println("=== GET DATA REQUEST ===");
        
        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Add CORS headers if needed
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET");
        
        try (Connection conn = DBUtils.getConnection()) {
            // Use TRIM to remove whitespace from data
            String sql = "SELECT id, TRIM(studentName) as studentName, TRIM(item) as item, TRIM(plasticItem) as plasticItem, quantity, date, photo FROM collected_data ORDER BY id DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                
                // Check if photo exists
                Blob photoBlob = rs.getBlob("photo");
                boolean hasPhoto = (photoBlob != null && photoBlob.length() > 0);
                
                // Get values and trim them again just in case
                String studentName = rs.getString("studentName");
                String item = rs.getString("item");
                String plasticItem = rs.getString("plasticItem");
                
                if (studentName != null) studentName = studentName.trim();
                if (item != null) item = item.trim();
                if (plasticItem != null) plasticItem = plasticItem.trim();
                
                System.out.println("Record ID " + rs.getInt("id") + " - hasPhoto: " + hasPhoto + 
                                 (hasPhoto ? " (size: " + photoBlob.length() + " bytes)" : ""));
                
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"studentName\":\"").append(escapeJson(studentName)).append("\",")
                    .append("\"item\":\"").append(escapeJson(item)).append("\",")
                    .append("\"plasticItem\":\"").append(escapeJson(plasticItem)).append("\",")
                    .append("\"quantity\":").append(rs.getInt("quantity")).append(",")
                    .append("\"date\":\"").append(rs.getString("date")).append("\",")
                    .append("\"hasPhoto\":").append(hasPhoto)
                    .append("}");
                first = false;
            }
            json.append("]");
            
            System.out.println("Sending JSON response with " + (first ? 0 : json.toString().split("\\{").length - 1) + " records");
            response.getWriter().write(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("ERROR in GetDataServlet: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
        }
        
        System.out.println("=== GET DATA REQUEST END ===");
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        // First trim the string to remove any whitespace
        str = str.trim();
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}