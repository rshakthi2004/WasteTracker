<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plastic Waste Tracker</title>
  <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
  <!-- Navbar -->
  <div class="navbar">
    <h2>Plastic Waste Tracker</h2>
    <div>
      <button id="navData" onclick="showPage('dataPage')" style="display:none;">Data</button>
      <button id="navProgress" onclick="showPage('progressPage')" style="display:none;">Progress</button>
      <button id="navTips" onclick="showPage('tipsPage')" style="display:none;">Tips & Awareness</button>
      <button id="navProfile" onclick="showPage('profilePage')" style="display:none;">Profile</button>
      <button id="logoutBtn" onclick="logout()" style="display:none;">Logout</button>
    </div>
  </div>

  <!-- Auth Page -->
  <div id="authPage" class="login-container">
    <h1 id="form-title">Login</h1>
    <form id="loginForm">
  <input type="text" id="loginEmail" name="username" placeholder="Username" required>
  <input type="password" id="loginPassword" name="password" placeholder="Password" required>
  <button type="submit">Login</button>
  <p>
    <a href="#" onclick="showRegister()">Register</a> | 
    <a href="#" onclick="showForgot()">Forgot Password?</a>
  </p>
</form>
    
  </div>

  <!-- Register Page -->
<div id="registerPage" class="login-container" style="display:none;">
  <h1>Register</h1>
  <form id="registerForm">
    <input type="text" id="regUsername" name="username" placeholder="Username" required>
    <input type="email" id="regEmail" name="email" placeholder="Email" required>
    <input type="password" id="regPassword" name="password" placeholder="Password" required>
    <select id="regRole" name="role" required>
      <option value="">-- Select Role --</option>
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>
    <button type="submit">Register</button>
    <p><a href="#" onclick="showLogin()">Back to Login</a></p>
  </form>
</div>
  
  <!-- Forgot Password Page -->
  <div id="forgotPage" class="login-container" style="display:none;">
    <h1>Forgot Password</h1>
    <form id="forgotForm">
      <input type="email" id="forgotEmail" placeholder="Enter your email" required>
      <button type="submit">Reset Password</button>
      <p><a href="#" onclick="showLogin()">Back to Login</a></p>
    </form>
  </div>

  <!-- Page 1: Input & Collected Data -->
<div id="dataPage" class="page" style="display:none;">
    <section id="input-section">
        <h2>Input Plastic Waste Data</h2>
        <form id="waste-form" method="POST" action="submitData" enctype="multipart/form-data">
    <label>Student Name:</label>
    <input type="text" name="studentName" required>

    <label>Plastic Type:</label>
    <select name="item" required>
        <option value="">-- Select --</option>
        <option value="PET">PET</option>
        <option value="HDPE">HDPE</option>
        <option value="PVC">PVC</option>
        <option value="LDPE">LDPE</option>
        <option value="PP">PP</option>
        <option value="PS">PS</option>
    </select>

    <label>Plastic Item:</label>
    <input type="text" name="plasticItem" required>

    <label>Quantity:</label>
    <input type="number" name="quantity" required>

    <label>Date:</label>
    <input type="date" name="date" required>

    <label>Photo:</label>
    <input type="file" name="photo" accept="image/*" required>

    <button type="submit">Add Data</button>
</form>

<table id="data-table">
    <thead>
        <tr>
            <th>Student Name</th>
            <th>Plastic Type</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Photo</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
    </section>
</div>

  <!-- Page 2: Progress -->
  <div id="progressPage" class="page" style="display:none;">
        <h2>Progress Chart</h2>
        <canvas id="progress-chart" width="400" height="200"></canvas>
    </div>

  <!-- Page 3: Tips & Awareness -->
  <div id="tipsPage" class="page" style="display:none;">
    <h2>🌍 Easy Tips to Save Our Earth</h2>
    <ul>
      <li>♻️ Segregate waste – Keep plastics in a separate bin.</li>
      <li>🚯 Avoid single-use plastics like straws and spoons.</li>
      <li>🛍️ Carry cloth/jute bags when shopping.</li>
      <li>💧 Use refillable water bottles.</li>
      <li>🌱 Plant trees – they clean our air!</li>
      <li>📚 Share knowledge with friends and family.</li>
      <li>🎨 Reuse plastics for crafts and projects.</li>
      <li>🐢 Protect animals – plastics in rivers harm them.</li>
    </ul>
  </div>

  <!-- Page 4: Profile -->
  <div id="profilePage" class="page" style="display:none;">
    <h2>Profile 👤</h2>
    <p><strong>Username:</strong> <span id="profileUsername"></span></p>
    <p><strong>Total Plastics Collected:</strong> <span id="profileTotal">0</span></p>
  </div>

  <!-- Page 5: Admin -->
  <div id="adminPage" class="page" style="display:none;">
    <h2>Admin Dashboard 👩‍💼</h2>
    
    <!-- Leaderboard Section -->
    <section id="leaderboard-section">
      <h3>🏆 Student Leaderboard</h3>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Total Collected</th>
            <th>Last Activity</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>

    <!-- Add New Entry Section -->
    <section id="admin-add-section">
      <h3>➕ Add New Entry</h3>
      <form id="admin-add-form">
        <div class="admin-form-row">
          <input type="text" id="adminStudentName" placeholder="Student Name" required>
          <select id="adminItem" required>
            <option value="">-- Select Plastic Type --</option>
            <option value="PET">PET</option>
            <option value="HDPE">HDPE</option>
            <option value="PVC">PVC</option>
            <option value="LDPE">LDPE</option>
            <option value="PP">PP</option>
            <option value="PS">PS</option>
          </select>
          <input type="text" id="adminPlasticItem" placeholder="Plastic Item" required>
          <input type="number" id="adminQuantity" placeholder="Quantity" required>
          <input type="date" id="adminDate" required>
          <input type="file" id="adminPhoto" accept="image/*" required>
          <button type="submit">Add Entry</button>
        </div>
      </form>
    </section>

    <!-- Submissions Table -->
    <section id="submissions-section">
      <h3>📊 All Submissions</h3>
      <p>Here Admin can see all collected submissions.</p>
      <table id="admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Plastic Type</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Photo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  </div>

  <!-- Lightbox modal for full image -->
  <div id="lightbox" class="lightbox">
    <span class="close" onclick="closeLightbox()">&times;</span>
    <img class="lightbox-content" id="lightboxImg">
  </div>

  <!-- Edit Modal -->
  <div id="editModal" class="edit-modal">
    <div class="edit-modal-content">
      <h3>✏️ Edit Entry</h3>
      <form id="edit-form">
        <input type="text" id="editStudentName" placeholder="Student Name" required>
        <select id="editItem" required>
          <option value="PET">PET</option>
          <option value="HDPE">HDPE</option>
          <option value="PVC">PVC</option>
          <option value="LDPE">LDPE</option>
          <option value="PP">PP</option>
          <option value="PS">PS</option>
        </select>
        <input type="text" id="editPlasticItem" placeholder="Plastic Item" required>
        <input type="number" id="editQuantity" placeholder="Quantity" required>
        <input type="date" id="editDate" required>
        <input type="file" id="editPhoto" accept="image/*">
        <p style="font-size: 12px; color: #666;">Leave photo empty to keep current image</p>
        <button type="button" class="save-btn" onclick="saveEdit()">Save Changes</button>
        <button type="button" class="cancel-btn" onclick="closeEditModal()">Cancel</button>
      </form>
    </div>
  </div>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
  <script src="scripts/scripts.js"></script>
</body>
</html>
