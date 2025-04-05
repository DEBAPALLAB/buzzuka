// js/order.js
import {
    collection,
    addDoc,
    serverTimestamp
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  document.addEventListener("DOMContentLoaded", () => {
    const drinkSelect = document.getElementById("drink");
    const quantityInput = document.getElementById("quantity");
    const totalPrice = document.getElementById("total-price");
  
    const updatePrice = () => {
      const price = +drinkSelect.selectedOptions[0].dataset.price;
      const qty = +quantityInput.value;
      totalPrice.textContent = price * qty;
    };
  
    document.getElementById("increase").onclick = () => {
      quantityInput.value = +quantityInput.value + 1;
      updatePrice();
    };
  
    document.getElementById("decrease").onclick = () => {
      if (+quantityInput.value > 1) {
        quantityInput.value = +quantityInput.value - 1;
        updatePrice();
      }
    };
  
    drinkSelect.onchange = updatePrice;
  
    document.getElementById("order-form").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const order = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        room: document.getElementById("room").value,
        btid: document.getElementById("btid").value,
        drink: drinkSelect.value,
        price: +drinkSelect.selectedOptions[0].dataset.price,
        quantity: +quantityInput.value,
        total: +totalPrice.textContent,
        served: false,
        timestamp: serverTimestamp()
      };
  
      try {
        await addDoc(collection(window.db, "orders"), order);
        alert("Order placed successfully!");
        document.getElementById("order-form").reset();
        quantityInput.value = 1;
        updatePrice();
      } catch (err) {
        alert("Failed to place order.");
        console.error(err);
      }
    });
  
    document.getElementById("admin-login").onclick = () => {
      window.location.href = "admin.html";
    };
  });
  