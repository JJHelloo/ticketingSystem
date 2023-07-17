//elements
let productInfo = document.querySelector("#productInfo");

//listeners
document.getElementById("productId").addEventListener("change", showProductInfo);

async function showProductInfo() {
  let productId = document.querySelector("#productId").value;

  let url = `https://teamproject.jjhello.repl.co/api/product/${productId}`;
  let response = await fetch(url);
  let data = await response.json();

  productInfo.innerHTML = `Type: ${data.products[0].productType}`;
  productInfo.innerHTML += `<br>`;
  productInfo.innerHTML += `Brand: ${data.products[0].productBrand}`;
  productInfo.innerHTML += `<br>`;
}