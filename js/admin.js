// js/admin.js
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    onSnapshot,
    query,
    deleteDoc,
    orderBy
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  // 🚨 Replace with your chosen email & password
  const ADMIN_EMAIL = "admin@buzzuka"; // <-- PUT YOUR EMAIL HERE
  const ADMIN_PASS = "supersecure123";     // <-- PUT YOUR PASSWORD HERE
  
  const loginSection = document.getElementById("login-section");
  const ordersSection = document.getElementById("orders-section");
  const ordersList = document.getElementById("orders-list");
  
  document.getElementById("login-btn").onclick = async () => {
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
  
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      loginSection.style.display = "none";
      ordersSection.style.display = "block";
      loadOrders();
    } else {
      alert("Incorrect email or password.");
    }
  };
  
  document.getElementById("logout-btn").onclick = () => {
    loginSection.style.display = "block";
    ordersSection.style.display = "none";
    ordersList.innerHTML = "";
  };
  
  function loadOrders() {
    const q = query(collection(window.db, "orders"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
      renderOrders(snapshot.docs);
    });
  }
  
  const renderOrders = (orders) => {
    ordersList.innerHTML = "";
  
    let total = 0;
    let served = 0;
  
    orders.forEach((docSnap) => {
      total++;
      const data = docSnap.data();
      if (data.served) served++;
  
      const li = document.createElement("li");
      li.className = data.served ? "served" : "";
  
      li.innerHTML = `
        <strong>${data.name}</strong> - ${data.quantity} x ${data.drink} (₹${data.total})<br>
        Room: ${data.room}, Phone: ${data.phone}, BT ID: ${data.btid}<br>
        <div class="order-actions">
          <label><input type="checkbox" ${data.served ? "checked" : ""}/> Mark as Served</label>
          <button class="delete-btn">🗑️</button>
        </div>
      `;
  
      // Toggle served
      li.querySelector("input").addEventListener("change", async () => {
        await updateDoc(doc(window.db, "orders", docSnap.id), {
          served: !data.served,
        });
      });
  
      // Delete order
      li.querySelector(".delete-btn").addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to delete this order?");
        if (confirmed) {
          await deleteDoc(doc(window.db, "orders", docSnap.id));
        }
      });
  
      ordersList.appendChild(li);
    });
  
    // Update stats
    document.getElementById("total-count").textContent = total;
    document.getElementById("served-count").textContent = served;
    document.getElementById("pending-count").textContent = total - served;
  };
  
  
  