import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const totalPriceElem = document.getElementById("total-price");
  const drinksContainer = document.getElementById("drinks-container");
  const drinkTemplate = document.getElementById("drink-template");
  const addDrinkBtn = document.getElementById("add-drink");

  // 🧠 Helper: Add a new
  const addDrinkRow = () => {
    const clone = drinkTemplate.content.cloneNode(true);
    const row = clone.querySelector(".drink-row");

    const select = row.querySelector(".drink-select");
    const desc = row.querySelector(".drink-desc");
    const qtyInput = row.querySelector(".quantity");
    const increase = row.querySelector(".increase");
    const decrease = row.querySelector(".decrease");
    const remove = row.querySelector(".remove-drink");

    const updateRow = () => {
      const selected = select.selectedOptions[0];
      desc.textContent = selected.dataset.desc || "";
      updateTotalPrice();
    };

    increase.onclick = () => {
      qtyInput.value = +qtyInput.value + 1;
      updateTotalPrice();
    };

    decrease.onclick = () => {
      if (+qtyInput.value > 1) {
        qtyInput.value = +qtyInput.value - 1;
        updateTotalPrice();
      }
    };

    remove.onclick = () => {
      row.remove();
      updateTotalPrice();
    };

    select.onchange = updateRow;
    updateRow(); // initialize desc
    drinksContainer.appendChild(row);
  };

  // 🧠 Helper: Update total price across all drinks
  const updateTotalPrice = () => {
    let total = 0;
    document.querySelectorAll(".drink-row").forEach(row => {
      const select = row.querySelector(".drink-select");
      const qty = +row.querySelector(".quantity").value;
      const price = +select.selectedOptions[0].dataset.price;
      total += qty * price;
    });
    totalPriceElem.textContent = total;
  };

  // ➕ Add first drink row by default
  addDrinkRow();

  addDrinkBtn.onclick = () => addDrinkRow();

  // ✅ Handle form submission
  document.getElementById("order-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const drinks = [];
    document.querySelectorAll(".drink-row").forEach(row => {
      const select = row.querySelector(".drink-select");
      const qty = +row.querySelector(".quantity").value;
      const price = +select.selectedOptions[0].dataset.price;
      drinks.push({
        name: select.value,
        price,
        quantity: qty,
        subtotal: price * qty
      });
    });

    const total = drinks.reduce((acc, d) => acc + d.subtotal, 0);

    const order = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      room: document.getElementById("room").value,
      btid: document.getElementById("btid").value,
      drinks,
      total,
      served: false,
      timestamp: serverTimestamp(),
      orderTime: new Date().toLocaleString()
    };

    try {
      await addDoc(collection(window.db, "orders"), order);
      alert("Order placed successfully!");
      document.getElementById("order-form").reset();
      drinksContainer.innerHTML = "";
      addDrinkRow();
      updateTotalPrice();
    } catch (err) {
      alert("Failed to place order.");
      console.error(err);
    }
  });

  // 👮 Admin button
  document.getElementById("admin-login").onclick = () => {
    window.location.href = "admin.html";
  };
});