//elements
let ticketInfo = document.querySelector("#ticketInfo");

//listeners
document.getElementById("viewButton").addEventListener("click", showTicketInfo);

async function showTicketInfo() {
  let requestId = document.querySelector("#requestId").value;

  let url = `https://teamproject.jjhello.repl.co/api/product/`;
  let response = await fetch(url);
  let data = await response.json();

  ticketInfo.innerHTML = `Request ID: ${data.tickets[0].requestId}`;
  ticketInfo.innerHTML += `<br>`;

  ticketInfo.innerHTML += `Customer: ${data.tickets[0].cFirstName} ${data.tickets[0].cLastName}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Zip: ${data.tickets[0].cZip}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Email: ${data.tickets[0].cEmail}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Phone Number: ${data.tickets[0].cPhoneNumber}`;
  ticketInfo.innerHTML += `<br>`;

  ticketInfo.innerHTML += `Product: ${data.tickets[0].productName}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Type: ${data.tickets[0].productType}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Brand: ${data.tickets[0].productBrand}`;
  ticketInfo.innerHTML += `<br>`;

  ticketInfo.innerHTML += `Description: ${data.tickets[0].description}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Repair: ${data.tickets[0].repair}`;
  ticketInfo.innerHTML += `<br>`;

  ticketInfo.innerHTML += `Request Date: ${data.tickets[0].timeRequested}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Completion Date: ${data.tickets[0].timeFilled}`;
  ticketInfo.innerHTML += `<br>`;

  ticketInfo.innerHTML += `Technician: ${data.tickets[0].tFirstName} ${data.tickets[0].tLastName}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Email: ${data.tickets[0].tEmail}`;
  ticketInfo.innerHTML += `<br>`;
  ticketInfo.innerHTML += `Phone Number: ${data.tickets[0].tPhoneNumber}`;
  ticketInfo.innerHTML += `<br>`;
}