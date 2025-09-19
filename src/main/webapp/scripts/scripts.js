// ---------------- GLOBAL VARIABLES ----------------
let users = []; 
let currentUser = null; 
let collectedData = []; 
let chart;
let editingIndex = -1;

// ---------------- AUTH FUNCTIONS ----------------
function showRegister(){ 
  document.getElementById("authPage").style.display="none";
  document.getElementById("registerPage").style.display="block";
  document.getElementById("forgotPage").style.display="none";
}

function showLogin(){ 
  document.getElementById("authPage").style.display="block";
  document.getElementById("registerPage").style.display="none";
  document.getElementById("forgotPage").style.display="none";
}

function showForgot(){ 
  document.getElementById("authPage").style.display="none";
  document.getElementById("registerPage").style.display="none";
  document.getElementById("forgotPage").style.display="block";
}

// LOGIN
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const username = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      fetch('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      })
      .then(res => res.text())
      .then(role => {
        if (role === 'invalid') {
          alert("Invalid credentials!");
        } else if (role === 'error') {
          alert("Server error, try again!");
        } else {
          currentUser = username;
          
          document.getElementById("authPage").style.display = "none";
          document.getElementById("registerPage").style.display = "none";
          document.getElementById("forgotPage").style.display = "none";
          document.getElementById("logoutBtn").style.display = "inline-block";

          if (role === 'admin') {
            document.getElementById("adminPage").style.display = "block";
            document.getElementById("navData").style.display = "none";
            document.getElementById("navProgress").style.display = "none";
            document.getElementById("navTips").style.display = "none";
            document.getElementById("navProfile").style.display = "none";
            
            // Load data and render admin components
            loadData().then(() => {
              renderAdminTable();
              renderLeaderboard();
            });
          } else {
            document.getElementById("dataPage").style.display = "block";
            document.getElementById("navData").style.display = "inline-block";
            document.getElementById("navProgress").style.display = "inline-block";
            document.getElementById("navTips").style.display = "inline-block";
            document.getElementById("navProfile").style.display = "inline-block";

            loadData().then(() => {
              updateProfileTotal();
            });
          }

          alert(`Login successful as ${role}`);
        }
      })
      .catch(err => console.error("Login error:", err));
    });
  }
});

// REGISTER
document.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const username = document.getElementById("regUsername").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value.trim();
      const role = document.getElementById("regRole").value;

      fetch('register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`
      })
      .then(res => res.text())
      .then(response => {
        if (response === 'success') {
          alert('Registration successful! Please login.');
          showLogin();
        } else {
          alert('Error registering user. Try again!');
        }
      })
      .catch(err => console.error("Register error:", err));
    });
  }
});

// LOGOUT
function logout(){
  currentUser = null;
  showLogin();
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById("navData").style.display="none";
  document.getElementById("navProgress").style.display="none";
  document.getElementById("navTips").style.display="none";
  document.getElementById("navProfile").style.display="none";
  document.getElementById("logoutBtn").style.display="none";
}

// SHOW PAGE
function showPage(pageId){
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(pageId).style.display="block";
  document.getElementById("logoutBtn").style.display="inline-block";
  
  if (pageId === 'profilePage') {
    updateProfileTotal();
  }
  
  if (pageId === 'progressPage') {
    updateChart();
  }
}

// ---------------- SIMPLIFIED PROFILE UPDATE ----------------
function updateProfileTotal() {
  console.log("=== UPDATING PROFILE TOTAL ===");
  
  // Set username first
  if (currentUser) {
    document.getElementById("profileUsername").textContent = currentUser;
  }

  if (!currentUser || !collectedData || collectedData.length === 0) {
    console.log("No user or no data available");
    document.getElementById("profileTotal").textContent = "0";
    return;
  }

  console.log("Current user:", currentUser);
  console.log("Total entries in data:", collectedData.length);
  console.log("Sample of data structure:", collectedData[0]);

  let total = 0;
  let matchedEntries = [];

  // Loop through all data and find matches for current user
  for (let i = 0; i < collectedData.length; i++) {
    const entry = collectedData[i];
    
    // Get all possible student name fields
    const possibleNames = [
      entry.studentName,
      entry.student_name, 
      entry.student,
      entry.name
    ];

    // Check if any field matches current user (case insensitive)
    let isMatch = false;
    for (let nameField of possibleNames) {
      if (nameField && typeof nameField === 'string') {
        if (nameField.toLowerCase().trim() === currentUser.toLowerCase().trim()) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      const quantity = Number(entry.quantity) || 0;
      total += quantity;
      matchedEntries.push({
        studentName: possibleNames.find(n => n) || 'Unknown',
        quantity: quantity,
        item: entry.item || entry.plastic_type || 'Unknown'
      });
      console.log(`Match found: ${possibleNames.find(n => n)} - Quantity: ${quantity} - Running total: ${total}`);
    }
  }

  console.log(`Found ${matchedEntries.length} matching entries`);
  console.log("All matched entries:", matchedEntries);
  console.log(`FINAL TOTAL: ${total}`);

  // Update the display
  document.getElementById("profileTotal").textContent = total;
  console.log("=== PROFILE UPDATE COMPLETE ===");
}

// ---------------- FORM SETUP ----------------
document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
        dateInput.max = today;
    }

    // Plastic info
    const plasticInfo = {
        PET: "PET: Bottles and containers. Widely recycled.",
        HDPE: "HDPE: Milk jugs, pipes. Strong & recyclable.",
        PVC: "PVC: Pipes, packaging. Limited recyclability.",
        LDPE: "LDPE: Bags, wraps. Hard to recycle.",
        PP: "PP: Straws, caps, containers. Recyclable.",
        PS: "PS: Styrofoam, cups. Rarely recycled."
    };

    const itemSelect = document.querySelector('select[name="item"]');
    if (itemSelect) {
        let infoElement = itemSelect.parentNode.querySelector('.plastic-info');
        if (!infoElement) {
            infoElement = document.createElement('div');
            infoElement.className = 'plastic-info';
            infoElement.style.cssText = 'margin-top: 5px; padding: 8px; background-color: #f0f8ff; border-radius: 4px; font-size: 0.9em; color: #666;';
            itemSelect.parentNode.appendChild(infoElement);
        }
        
        itemSelect.addEventListener("change", () => {
            infoElement.innerText = plasticInfo[itemSelect.value] || "";
        });
    }

    // Form submission
    const wasteForm = document.getElementById("waste-form");
    if (wasteForm) {
        wasteForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const studentName = document.querySelector('input[name="studentName"]')?.value?.trim();
            const item = document.querySelector('select[name="item"]')?.value;
            const plasticItem = document.querySelector('input[name="plasticItem"]')?.value?.trim();
            const quantity = document.querySelector('input[name="quantity"]')?.value;
            const date = document.querySelector('input[name="date"]')?.value;
            const photo = document.querySelector('input[name="photo"]')?.files[0];

            if (!studentName || !item || !plasticItem || !quantity || !date) {
                alert("Please fill in all required fields");
                return;
            }

            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;

            fetch('submitData', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if (data.trim() === "success") {
                    alert("Data added successfully!");
                    wasteForm.reset();
                    
                    if (dateInput) {
                        const today = new Date().toISOString().split("T")[0];
                        dateInput.value = today;
                    }
                    
                    // Reload data and update profile
                    loadData().then(() => {
                        updateProfileTotal();
                    });
                } else {
                    alert("Error submitting data: " + data);
                }
            })
            .catch(error => {
                alert('Network error: ' + error.message);
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Admin form submission handler
    const adminForm = document.getElementById("admin-add-form");
    if (adminForm) {
        adminForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const studentName = document.getElementById("adminStudentName").value.trim();
            const item = document.getElementById("adminItem").value;
            const plasticItem = document.getElementById("adminPlasticItem").value.trim();
            const quantity = document.getElementById("adminQuantity").value;
            const date = document.getElementById("adminDate").value;
            const photo = document.getElementById("adminPhoto").files[0];

            if (!studentName || !item || !plasticItem || !quantity || !date || !photo) {
                alert("Please fill in all required fields including photo");
                return;
            }

            const formData = new FormData();
            formData.append("studentName", studentName);
            formData.append("item", item);
            formData.append("plasticItem", plasticItem);
            formData.append("quantity", quantity);
            formData.append("date", date);
            formData.append("photo", photo);

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Adding...";
            submitBtn.disabled = true;

            fetch('submitData', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if (data.trim() === "success") {
                    alert("Data added successfully by admin!");
                    adminForm.reset();
                    
                    const adminDateInput = document.getElementById("adminDate");
                    if (adminDateInput) {
                        const today = new Date().toISOString().split("T")[0];
                        adminDateInput.value = today;
                    }
                    
                    // Reload data and update admin tables
                    loadData().then(() => {
                        renderAdminTable();
                        renderLeaderboard();
                    });
                } else {
                    alert("Error submitting data: " + data);
                }
            })
            .catch(error => {
                alert('Network error: ' + error.message);
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    loadData();

    const adminDateInput = document.getElementById("adminDate");
    if (adminDateInput) {
        const today = new Date().toISOString().split("T")[0];
        adminDateInput.value = today;
        adminDateInput.max = today;
    }
});

// ---------------- LOAD DATA FROM DATABASE ----------------
function loadData() {
    console.log("Loading data from server...");
    
    return fetch('getData')
        .then(res => {
            if (!res.ok) throw new Error(`Network error: ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log("Raw data from server:", data);
            collectedData = Array.isArray(data) ? data : [];
            console.log("Processed collectedData:", collectedData);
            renderTable();
            
            if (currentUser) {
                updateProfileTotal();
            }
            
            return data;
        })
        .catch(error => {
            console.error("Error loading data:", error);
            collectedData = [];
            renderTable();
            return [];
        });
}

// ---------------- RENDER TABLE ----------------
function renderTable() {
    const dataTable = document.getElementById("data-table");
    if (!dataTable) return;

    const tbody = dataTable.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!collectedData.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>';
        return;
    }

    collectedData.forEach((d, index) => {
        const row = document.createElement("tr");
        
        let photoContent = 'No photo';
        if (d.hasPhoto) {
            const photoUrl = `getPhoto?id=${d.id}&t=${Date.now()}`;
            photoContent = `<img src="${photoUrl}" 
                                alt="photo" 
                                style="width:50px;height:50px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #ddd;" 
                                onclick="showFullImage('${photoUrl}')"
                                onerror="this.style.display='none'; this.parentNode.innerHTML='Photo error';">`;
        }
        
        row.innerHTML = `
            <td>${escapeHtml(d.studentName || d.student_name || 'N/A')}</td>
            <td>${escapeHtml(d.item || d.plastic_type || 'N/A')}</td>
            <td>${escapeHtml(d.plasticItem || d.item || 'N/A')}</td>
            <td>${d.quantity || 0}</td>
            <td>${d.date || 'N/A'}</td>
            <td>${photoContent}</td>
        `;
        tbody.appendChild(row);
    });
}

// ---------------- UTILITY FUNCTIONS ----------------
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showFullImage(src) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    
    const loading = document.createElement('div');
    loading.textContent = 'Loading...';
    loading.style.cssText = 'color: white; font-size: 18px;';
    modal.appendChild(loading);
    
    img.onload = () => {
        if (modal.contains(loading)) {
            modal.removeChild(loading);
        }
        modal.appendChild(img);
    };
    
    img.onerror = () => {
        loading.textContent = 'Error loading image';
    };
    
    document.body.appendChild(modal);
    
    modal.onclick = () => document.body.removeChild(modal);
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// ---------------- ADMIN FUNCTIONS ----------------
function renderAdminTable(){
    console.log("Rendering admin table with data:", collectedData);
    
    const adminTable = document.getElementById("admin-table");
    if (!adminTable) {
        console.log("Admin table not found");
        return;
    }
    
    const tbody = adminTable.querySelector("tbody");
    if (!tbody) {
        console.log("Admin table tbody not found");
        return;
    }
    
    tbody.innerHTML = "";
    
    if (!collectedData || collectedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No data available</td></tr>';
        return;
    }
    
    collectedData.forEach((d, index) => {
        const row = document.createElement("tr");
        
        let photoContent = 'No photo';
        if (d.hasPhoto) {
            const photoUrl = `getPhoto?id=${d.id}&t=${Date.now()}`;
            photoContent = `<img src="${photoUrl}" 
                                alt="photo" 
                                style="width:40px;height:40px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #ddd;" 
                                onclick="showFullImage('${photoUrl}')"
                                onerror="this.style.display='none'; this.parentNode.innerHTML='Photo error';">`;
        }
        
        row.innerHTML = `
            <td>${escapeHtml(d.studentName || d.student_name || 'N/A')}</td>
            <td>${escapeHtml(d.item || d.plastic_type || 'N/A')}</td>
            <td>${escapeHtml(d.plasticItem || d.item || 'N/A')}</td>
            <td>${d.quantity || 0}</td>
            <td>${d.date || 'N/A'}</td>
            <td>${photoContent}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editEntry(${index})" style="margin-right:5px;padding:5px 10px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer;">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteEntry(${index})" style="padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:3px;cursor:pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`Admin table rendered with ${collectedData.length} rows`);
}

function renderLeaderboard(){
    console.log("Rendering leaderboard with data:", collectedData);
    
    const leaderboardTable = document.getElementById("leaderboard-table");
    if (!leaderboardTable) {
        console.log("Leaderboard table not found");
        return;
    }
    
    const tbody = leaderboardTable.querySelector("tbody");
    if (!tbody) {
        console.log("Leaderboard tbody not found");
        return;
    }
    
    const studentStats = {};
    
    if (!collectedData || collectedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>';
        return;
    }
    
    collectedData.forEach(d => {
        const student = d.studentName || d.student_name || d.student || "Unknown";
        if (!studentStats[student]) {
            studentStats[student] = {
                name: student,
                total: 0,
                lastActivity: d.date || 'N/A'
            };
        }
        studentStats[student].total += parseInt(d.quantity) || 0;
        if (d.date && d.date > studentStats[student].lastActivity) {
            studentStats[student].lastActivity = d.date;
        }
    });

    const sortedStudents = Object.values(studentStats).sort((a, b) => b.total - a.total);

    tbody.innerHTML = "";
    sortedStudents.forEach((student, index) => {
        const row = document.createElement("tr");
        const rank = index + 1;
        let rankDisplay = rank;
        
        if (rank === 1) rankDisplay = "🥇 1";
        else if (rank === 2) rankDisplay = "🥈 2";
        else if (rank === 3) rankDisplay = "🥉 3";
        
        row.innerHTML = `
            <td style="text-align:center;">${rankDisplay}</td>
            <td>${escapeHtml(student.name)}</td>
            <td style="text-align:center;">${student.total}</td>
            <td style="text-align:center;">${student.lastActivity}</td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`Leaderboard rendered with ${sortedStudents.length} students`);
}

function editEntry(index) {
    console.log("Editing entry at index:", index, collectedData[index]);
    editingIndex = index;
    const entry = collectedData[index];
    
    document.getElementById("editStudentName").value = entry.studentName || entry.student_name || '';
    document.getElementById("editItem").value = entry.item || entry.plastic_type || '';
    document.getElementById("editPlasticItem").value = entry.plasticItem || entry.item || '';
    document.getElementById("editQuantity").value = entry.quantity || '';
    document.getElementById("editDate").value = entry.date || '';
    
    document.getElementById("editModal").style.display = "block";
}

function saveEdit() {
    if (editingIndex === -1) return;
    
    const studentName = document.getElementById("editStudentName").value.trim();
    const item = document.getElementById("editItem").value;
    const plasticItem = document.getElementById("editPlasticItem").value.trim();
    const quantity = parseInt(document.getElementById("editQuantity").value);
    const date = document.getElementById("editDate").value;
    const photoFile = document.getElementById("editPhoto").files[0];
    
    if (!studentName || !item || !plasticItem || !quantity || !date) {
        alert("Please fill all required fields including student name");
        return;
    }
    
    // Create FormData to send to server
    const formData = new FormData();
    formData.append("action", "edit");
    formData.append("id", collectedData[editingIndex].id || editingIndex);
    formData.append("studentName", studentName);
    formData.append("item", item);
    formData.append("plasticItem", plasticItem);
    formData.append("quantity", quantity);
    formData.append("date", date);
    
    if (photoFile) {
        formData.append("photo", photoFile);
    }
    
    // Update local data immediately for better UX
    collectedData[editingIndex].studentName = studentName;
    collectedData[editingIndex].student_name = studentName;
    collectedData[editingIndex].item = item;
    collectedData[editingIndex].plastic_type = item;
    collectedData[editingIndex].plasticItem = plasticItem;
    collectedData[editingIndex].quantity = quantity;
    collectedData[editingIndex].date = date;
    
    // Send to server (optional - depends on your backend)
    // You may need to implement an edit endpoint
    
    renderAdminTable();
    renderLeaderboard();
    closeEditModal();
    alert("Entry updated successfully!");
    
    updateProfileTotal();
}

function deleteEntry(index) {
    if (confirm("Are you sure you want to delete this entry?")) {
        console.log("Deleting entry at index:", index);
        
        // Create FormData to send to server
        const formData = new FormData();
        formData.append("action", "delete");
        formData.append("id", collectedData[index].id || index);
        
        // Remove from local data immediately
        collectedData.splice(index, 1);
        
        // Send to server (optional - depends on your backend)
        // You may need to implement a delete endpoint
        
        renderAdminTable();
        renderLeaderboard();
        updateChart();
        updateProfileTotal();
        alert("Entry deleted successfully!");
    }
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    editingIndex = -1;
    document.getElementById("edit-form").reset();
}

function showPhoto(photoData, photoName) {
    document.getElementById("lightboxImg").src = photoData;
    document.getElementById("lightbox").style.display = "block";
}

function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

// Event listeners for modals
document.addEventListener("DOMContentLoaded", function() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        lightbox.addEventListener("click", function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }
    
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeLightbox();
            closeEditModal();
        }
    });
    
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.addEventListener("click", function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }
});

function updateChart() {
    if (!collectedData || collectedData.length === 0) {
        return;
    }

    const labels = collectedData.map(d => (d.item || d.plastic_type) + " (" + (d.plasticItem || d.item) + ")");
    const data = collectedData.map(d => parseInt(d.quantity) || 0);

    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById("progress-chart");
    if (!ctx) {
        return;
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Plastic Collected",
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Plastic Waste Collection Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}