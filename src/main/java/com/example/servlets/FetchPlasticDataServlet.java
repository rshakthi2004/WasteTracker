package com.example.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.example.utils.DBUtils;
import com.google.gson.JsonObject;

@WebServlet("/FetchPlasticDataServlet")
public class FetchPlasticDataServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("error", "User not logged in");
            out.print(errorJson.toString());
            return;
        }

        String username = (String) session.getAttribute("username");
        String email = "";
        int totalPlasticsCollected = 0;

        try (Connection con = DBUtils.getConnection()) {
            
            System.out.println("Fetching profile for username: " + username);
            
            // Get email from registration/users table
            PreparedStatement emailPs = con.prepareStatement(
                "SELECT email FROM users WHERE username = ?"
            );
            emailPs.setString(1, username);
            ResultSet emailRs = emailPs.executeQuery();
            
            if (emailRs.next()) {
                email = emailRs.getString("email");
                System.out.println("Found email: " + email);
            } else {
                email = "No email found";
                System.out.println("No email found for username: " + username);
            }

            // Calculate total plastics collected from plastic_data table
            // Based on your screenshot, the table has: student_name, plastic_type, item, quantity, date
            PreparedStatement plasticPs = con.prepareStatement(
                "SELECT SUM(quantity) as total FROM plastic_data WHERE student_name = ?"
            );
            plasticPs.setString(1, username);
            ResultSet plasticRs = plasticPs.executeQuery();
            
            if (plasticRs.next()) {
                totalPlasticsCollected = plasticRs.getInt("total");
                System.out.println("Total plastics calculated: " + totalPlasticsCollected);
            }
            
            // If total is still 0, let's debug
            if (totalPlasticsCollected == 0) {
                System.out.println("Total is 0, checking what data exists...");
                PreparedStatement debugPs = con.prepareStatement(
                    "SELECT student_name, quantity FROM plastic_data WHERE student_name LIKE ?"
                );
                debugPs.setString(1, "%" + username + "%");
                ResultSet debugRs = debugPs.executeQuery();
                
                System.out.println("Searching for student_name containing: " + username);
                while (debugRs.next()) {
                    System.out.println("Found: student_name='" + debugRs.getString("student_name") + 
                                     "', quantity=" + debugRs.getInt("quantity"));
                }
            }

            // Create and send JSON response
            JsonObject json = new JsonObject();
            json.addProperty("username", username);
            json.addProperty("email", email);
            json.addProperty("totalPlasticsCollected", totalPlasticsCollected);
            json.addProperty("status", "success");

            String jsonResponse = json.toString();
            System.out.println("Sending JSON response: " + jsonResponse);
            out.print(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Database error: " + e.getMessage());
            
            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("error", "Database error: " + e.getMessage());
            errorJson.addProperty("status", "error");
            out.print(errorJson.toString());
        }
    }
}