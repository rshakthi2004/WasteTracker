package com.example.servlets;

import com.example.utils.DBUtils;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Blob;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/getPhoto")
public class GetPhotoServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("=== GET PHOTO REQUEST ===");
        
        String id = request.getParameter("id");
        System.out.println("Photo request for ID: " + id);
        
        if (id == null || id.trim().isEmpty()) {
            System.out.println("ERROR: Missing id parameter");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing id parameter");
            return;
        }

        try (Connection conn = DBUtils.getConnection()) {
            String sql = "SELECT photo FROM collected_data WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            
            try {
                int photoId = Integer.parseInt(id);
                stmt.setInt(1, photoId);
                System.out.println("Querying for photo with ID: " + photoId);
            } catch (NumberFormatException e) {
                System.out.println("ERROR: Invalid id format: " + id);
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid id format");
                return;
            }
            
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Blob photoBlob = rs.getBlob("photo");
                System.out.println("Found record for ID: " + id);
                
                if (photoBlob != null && photoBlob.length() > 0) {
                    System.out.println("Photo blob size: " + photoBlob.length() + " bytes");
                    
                    // Set appropriate content type and headers
                    response.setContentType("image/jpeg");
                    response.setHeader("Cache-Control", "max-age=3600"); // Cache for 1 hour
                    response.setHeader("Content-Length", String.valueOf(photoBlob.length()));
                    
                    // Get blob as input stream and write to response
                    try (InputStream inputStream = photoBlob.getBinaryStream();
                         OutputStream outputStream = response.getOutputStream()) {
                        
                        byte[] buffer = new byte[8192]; // Increased buffer size
                        int bytesRead;
                        int totalBytesWritten = 0;
                        
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                            totalBytesWritten += bytesRead;
                        }
                        
                        outputStream.flush();
                        System.out.println("Successfully served photo: " + totalBytesWritten + " bytes written");
                        
                    } catch (Exception streamException) {
                        System.out.println("ERROR: Exception while streaming photo: " + streamException.getMessage());
                        streamException.printStackTrace();
                    }
                } else {
                    System.out.println("ERROR: Photo blob is null or empty for ID: " + id);
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Photo data not found");
                }
            } else {
                System.out.println("ERROR: No record found for ID: " + id);
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Record not found");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("ERROR: Database exception: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
        }
        
        System.out.println("=== GET PHOTO REQUEST END ===");
    }
}