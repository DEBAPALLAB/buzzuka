// js/admin.js
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    onSnapshot,
    query,
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
  
  function renderOrders(orders) {
    ordersList.innerHTML = "";
    orders.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.className = data.served ? "served" : "";
  
      li.innerHTML = `
        <strong>${data.name}</strong> - ${data.quantity} x ${data.drink} (₹${data.total})<br>
        Room: ${data.room}, Phone: ${data.phone}, BT ID: ${data.btid}<br>
        <label><input type="checkbox" ${data.served ? "checked" : ""}/> Mark as Served</label>
      `;
  
      li.querySelector("input").addEventListener("change", async () => {
        await updateDoc(doc(window.db, "orders", docSnap.id), {
          served: !data.served
        });
      });
  
      ordersList.appendChild(li);
    });
  }
  