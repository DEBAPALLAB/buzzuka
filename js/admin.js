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
  const ADMIN_EMAIL = "buzz"; // <-- PUT YOUR EMAIL HERE
  const ADMIN_PASS = "301718";     // <-- PUT YOUR PASSWORD HERE
  
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
    let revenue = 0;
    const floorMap = {};
  
    orders.forEach((docSnap) => {
      total++;
      const data = docSnap.data();
      const isServed = data.served;
      const floor = parseInt(data.room)?.toString()?.[0] || "Unknown";
  
      if (!floorMap[floor]) floorMap[floor] = 0;
      floorMap[floor]++;
  
      if (isServed) {
        served++;
        revenue += data.total;
      }
  
      const li = document.createElement("li");
      li.className = isServed ? "served" : "";
  
      li.innerHTML = `
        <strong>${data.name}</strong> - ${data.quantity} x ${data.drink} (₹${data.total})<br>
        Room: ${data.room}, Phone: ${data.phone}, BT ID: ${data.btid}<br>
        <div class="order-actions">
          <label><input type="checkbox" ${isServed ? "checked" : ""}/> Mark as Served</label>
          <button class="delete-btn">🗑️</button>
        </div>
      `;
  
      li.querySelector("input").addEventListener("change", async () => {
        await updateDoc(doc(window.db, "orders", docSnap.id), {
          served: !isServed,
        });
      });
  
      li.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this order?")) {
          await deleteDoc(doc(window.db, "orders", docSnap.id));
        }
      });
  
      ordersList.appendChild(li);
    });
  
    // Stats
    document.getElementById("total-count").textContent = total;
    document.getElementById("served-count").textContent = served;
    document.getElementById("pending-count").textContent = total - served;
    document.getElementById("total-revenue").textContent = revenue;
  
    // Floor demographics
    const floorStats = document.getElementById("floor-stats");
    floorStats.innerHTML = "";
    Object.keys(floorMap)
      .sort()
      .forEach((floor) => {
        const li = document.createElement("li");
        li.textContent = `Floor ${floor}: ${floorMap[floor]} orders`;
        floorStats.appendChild(li);
      });
  };
  
  
  
  