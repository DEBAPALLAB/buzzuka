import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const db = window.db;
  const auth = getAuth();

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

  // Firebase Auth Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginSection.style.display = "none";
      ordersSection.style.display = "block";
      document.getElementById("extra-info").style.display = "block";
      document.getElementById("order-stats").style.display = "block";
      fetchOrders();
    } else {
      loginSection.style.display = "block";
      ordersSection.style.display = "none";
      document.getElementById("extra-info").style.display = "none";
      document.getElementById("order-stats").style.display = "none";
    }
  });

  // Login
  loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Invalid email or password.");
      console.error(error);
    }
  };

  // Logout
  logoutBtn.onclick = async () => {
    await signOut(auth);
  };

  function renderOrders() {
    ordersList.innerHTML = "";
    let total = 0;
    let served = 0;
    let pending = 0;
    const floorMap = {};

    allOrders
      .sort((a, b) => a.served - b.served)
      .forEach((order) => {
        const li = document.createElement("li");
        li.className = "order-card";

        const drinksHTML = order.drinks.map(d =>
          `<li>${d.name} x ${d.quantity} - ₹${d.price * d.quantity}</li>`
        ).join("");

        li.innerHTML = `
          <div class="order-header">
            <strong>${order.name}</strong> (${order.phone})
            <span class="room-btid">Room ${order.room} | BT ID: ${order.btid}</span>
          </div>
          <ul class="drink-list">${drinksHTML}</ul>
          <p><strong>Total: ₹${order.total}</strong></p>
          <p><strong>Time:</strong> ${order.orderTime || "⏳ Awaiting time record"}</p>
          <div class="order-actions">
            <button data-id="${order.id}" class="status-btn">
              ${order.served ? "✅ Served" : "⏳ Pending"}
            </button>
            <button data-id="${order.id}" class="delete-btn">🗑️ Delete</button>
          </div>
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

    floorStats.innerHTML = "";
    Object.entries(floorMap).forEach(([floor, count]) => {
      const li = document.createElement("li");
      li.textContent = `Floor ${floor}: ${count} orders`;
      floorStats.appendChild(li);
    });

    // Toggle Served
    document.querySelectorAll(".status-btn").forEach(btn => {
      btn.onclick = async () => {
        const order = allOrders.find(o => o.id === btn.dataset.id);
        if (!order) return;
        await updateDoc(doc(db, "orders", order.id), { served: !order.served });
      };
    });

    // Delete Order
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        const confirmDelete = confirm("Are you sure you want to delete this order?");
        if (confirmDelete) {
          await deleteDoc(doc(db, "orders", btn.dataset.id));
        }
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