// js/admin.js
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const db = window.db;

  const loginSection = document.getElementById("login-section");
  const ordersSection = document.getElementById("orders-section");
  const ordersList = document.getElementById("orders-list");

  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const totalRevenue = document.getElementById("total-revenue");
  const floorStats = document.getElementById("floor-stats");
  const totalCount = document.getElementById("total-count");
  const servedCount = document.getElementById("served-count");
  const pendingCount = document.getElementById("pending-count");

  let allOrders = [];

  loginBtn.onclick = async () => {
    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  logoutBtn.onclick = async () => {
    await signOut(auth);
  };

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginSection.style.display = "none";
      ordersSection.style.display = "block";
      fetchOrders();
    } else {
      loginSection.style.display = "block";
      ordersSection.style.display = "none";
    }
  });

  function renderOrders() {
    ordersList.innerHTML = "";
    let total = 0;
    let served = 0;
    let pending = 0;
    const floorMap = {};

    allOrders.forEach((order) => {
      const li = document.createElement("li");
      li.className = "order-card";

      const drinksHTML = order.drinks.map(d =>
        `<li>${d.name} x ${d.quantity} - ₹${d.price * d.quantity}</li>`
      ).join("");

      li.innerHTML = `
        <p><strong>${order.name}</strong> (${order.phone})</p>
        <p>Room: ${order.room} | BT ID: ${order.btid}</p>
        <ul>${drinksHTML}</ul>
        <p><strong>Total: ₹${order.total}</strong></p>
        <button data-id="${order.id}" class="status-btn">${order.served ? "✅ Served" : "⏳ Pending"}</button>
      `;

      ordersList.appendChild(li);

      if (order.served) {
        total += order.total;
        served++;
      } else {
        pending++;
      }

      const floor = order.room?.trim()[0];
      if (floor && !isNaN(floor)) {
        floorMap[floor] = (floorMap[floor] || 0) + 1;
      }
    });

    totalRevenue.textContent = total;
    totalCount.textContent = allOrders.length;
    servedCount.textContent = served;
    pendingCount.textContent = pending;

    // Render floor stats
    floorStats.innerHTML = "";
    Object.entries(floorMap).forEach(([floor, count]) => {
      const li = document.createElement("li");
      li.textContent = `Floor ${floor}: ${count} orders`;
      floorStats.appendChild(li);
    });

    // Attach toggle listeners
    document.querySelectorAll(".status-btn").forEach(btn => {
      btn.onclick = async () => {
        const order = allOrders.find(o => o.id === btn.dataset.id);
        if (!order) return;
        const newServed = !order.served;
        await updateDoc(doc(db, "orders", order.id), { served: newServed });
      };
    });
  }

  function fetchOrders() {
    const ordersRef = collection(db, "orders");
    onSnapshot(ordersRef, (snapshot) => {
      allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ensure backward compatibility: convert old single-drink format
      allOrders = allOrders.map(order => {
        if (!Array.isArray(order.drinks)) {
          return {
            ...order,
            drinks: [{
              name: order.drink,
              price: order.price,
              quantity: order.quantity
            }]
          };
        }
        return order;
      });

      renderOrders();
    });
  }
});
