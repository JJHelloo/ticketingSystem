//installed mysql, express, ejs, node-fetch 2.6, faker
const express = require('express');
const app = express();
const pool = require("./dbPool.js");
const fetch = require("node-fetch");
const faker = require('faker');
const session = require('express-session')
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");
app.set('trust proxy', 1) // trust first proxy` 
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var authenticated = false;

app.get('/', async (req, res) => {

  try {
    let response = await fetch(url);
    let data = await response.json();
    imageMac = data.urls.small;
  } catch (error) {
  }
  res.render('index');
});

app.post('/login', async (req, res) => {
  let username = req.body.username;
  let userPassword = req.body.password;

  let passwordHash = "";
  let sql = `SELECT *
             FROM pa_users
             WHERE username = ?`;
  let data = await executeSQL(sql, [username]);

  if (data.length > 0) {
    passwordHash = data[0].password;
  }

  const match = await bcrypt.compare(userPassword, passwordHash);

  if (match) {
    req.session.authenticated = true;
    res.redirect('/technician/home')
  } else {
    let imageMac = "/img/mac.jpg";

    res.render('index', { "error": "Invalid user name or password", info: { "imageURL": imageMac } })
  }
});
//
//newUser (register)
app.get("/register", (req, res) => {
  res.render("newUser")
});

app.post("/register", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  let sql = `SELECT username
            FROM pa_users
            WHERE username = ?`;
  let params = [username];
  let usernameRows = await executeSQL(sql, [username]);

  if (usernameRows.length > 0) {
    res.render("newUser", { "message": "Username already Taken!" })
  }
  else {
    const hash = await bcrypt.hash(password, saltRounds);

    sql = "INSERT INTO pa_users (username, password) VALUES (?, ?) ;"

    params = [username, hash];
    await executeSQL(sql, params);

    res.redirect("/")
  }
});

//technicianHome
app.get('/technician/home', isLoggedIn, (req, res) => {
  res.render('technicianHome')
});

//technicianNew
app.get('/technician/new', isLoggedIn, (req, res) => {
  res.render('technicianNew')
});

app.post('/technician/new', async (req, res) => {
  let fName = req.body.fName;
  let lName = req.body.lName;
  let zip = req.body.zip;
  let email = req.body.email;
  let phoneNumber = req.body.phoneNumber;
  let military = req.body.military;

  let sql = "INSERT INTO pa_technicians (firstName, lastName, zip, email, phoneNumber, military) VALUES (?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, zip, email, phoneNumber, military];
  let rows = await executeSQL(sql, params);

  res.render('technicianNew', { "message": "Technician added!" })
});

//technicianLookup
app.get('/technician/lookup', async (req, res) => {
  let sql = `SELECT *
            FROM pa_technicians
            ORDER BY lastName`;
  let rows = await executeSQL(sql);

  res.render('technicianLookup', { "technicians": rows })
});

//technicianEdit
app.get("/technician/edit", isLoggedIn, async function(req, res) {

  let technicianId = req.query.technicianId;

  let sql = `SELECT *
            FROM pa_technicians
            WHERE technicianId =  ${technicianId}`;
  let rows = await executeSQL(sql);
  res.render("technicianEdit", { "technicianInfo": rows });
});

app.post("/technician/edit", async function(req, res) {
  let sql = `UPDATE pa_technicians
            SET firstName = ?,
               lastName = ?,
               zip = ?,
               email = ?,
               phoneNumber = ?,
               military = ?
            WHERE technicianId =  ?`;

  let params = [req.body.fName,
  req.body.lName, req.body.zip, req.body.email,
  req.body.phoneNumber, req.body.military, req.body.technicianId];
  let rows = await executeSQL(sql, params);

  sql = `SELECT *
        FROM pa_technicians
        WHERE technicianId= ${req.body.technicianId}`;
  rows = await executeSQL(sql);
  res.render("technicianEdit", { "technicianInfo": rows, "message": "Technician Updated!" });
});

//customerLookup
app.get('/customer/lookup', isLoggedIn, async (req, res) => {
  let sqlCustomer = `SELECT customerId, firstName, lastName, email
             From pa_customers
             ORDER BY lastName`;
  let rowCustomerLastName = await executeSQL(sqlCustomer);

  sqlCustomer = `SELECT customerId, firstName, lastName
             From pa_customers
             ORDER BY customerId`;
  let rowCustomerCustomerId = await executeSQL(sqlCustomer);

  res.render("customerLookup", { info: { "customersById": rowCustomerCustomerId, "customersByLastName": rowCustomerLastName } });
});

//customerPrints
app.post("/customer/printByLastName", async function(req, res) {
  let sql = `SELECT *
        FROM pa_customers
        WHERE customerId= ${req.body.customerIdOfLastName}`;
  let rows = await executeSQL(sql);
  res.render("customerPrint", { "customerInfo": rows });
});

app.post("/customer/printById", async function(req, res) {
  let sql = `SELECT *
        FROM pa_customers
        WHERE customerId= ${req.body.customerId}`;
  let rows = await executeSQL(sql);
  res.render("customerPrint", { "customerInfo": rows });
});

app.post("/customer/printByNew", async function(req, res) {
  let fName = req.body.fName;
  let lName = req.body.lName;
  let email = req.body.email;
  let phoneNumber = req.body.phoneNumber;
  let military = req.body.military;
  let zipCode = req.body.zipCode;

  let sql = "INSERT INTO pa_customers (firstName, lastName, email, phoneNumber, military, zip) VALUES (?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, email, phoneNumber, military, zipCode];
  let rows = await executeSQL(sql, params);

  sql = `SELECT *
        FROM pa_customers
        ORDER BY customerId DESC`;
  rows = await executeSQL(sql);
  //descending item is the most recent

  res.render("customerPrint", { "customerInfo": rows });
});

//customerEdit
app.get("/customer/edit", isLoggedIn, async function(req, res) {
  let customerId = req.query.customerId;

  let sql = `SELECT *
            FROM pa_customers
            WHERE customerId =  ${customerId}`;
  let rows = await executeSQL(sql);
  res.render("customerEdit", { "customerInfo": rows });
});

app.post("/customer/edit", async function(req, res) {
  let sql = `UPDATE pa_customers
            SET firstName = ?,
               lastName = ?,
               zip = ?,
               email = ?,
               phoneNumber = ?,
               military = ?
            WHERE customerId =  ?`;

  let params = [req.body.firstName,
  req.body.lastName, req.body.zip, req.body.email,
  req.body.phoneNumber, req.body.military, req.body.customerId];
  let rows = await executeSQL(sql, params);

  sql = `SELECT *
        FROM pa_customers
        WHERE customerId = ${req.body.customerId}`;
  rows = await executeSQL(sql);

  res.render("customerEdit", { "customerInfo": rows, "message": "Customer Updated!" });
});

//ticketNew
app.get('/ticket/new', isLoggedIn, async (req, res) => {
  let sql = `SELECT productId, productName, productType, productBrand
      FROM pa_products
      ORDER BY productType`;
  let productRows = await executeSQL(sql);

  sql = `SELECT customerId, firstName, lastName
      FROM pa_customers
      ORDER BY lastName`;
  let customerRows = await executeSQL(sql);

  sql = `SELECT technicianId, firstName, lastName
      FROM pa_technicians
      ORDER BY lastName`;
  let technicianRows = await executeSQL(sql);

  res.render('ticketNew', { "products": productRows, "customers": customerRows, "technicians": technicianRows })
});

app.post("/ticket/new", async function(req, res) {
  let productId = req.body.productId;
  let customerId = req.body.customerId;
  let timeRequested = new Date();
  let technicianId = req.body.technicianId;
  let description = req.body.description;
  let sql = "INSERT INTO pa_requests (productId, customerId, timeRequested, technicianId, description) VALUES (?, ?, ?, ?, ?);"
  let params = [productId, customerId, timeRequested, technicianId, description];
  await executeSQL(sql, params);

  sql = `SELECT productId, productName, productType, productBrand
      FROM pa_products
      ORDER BY productType`;
  let productRows = await executeSQL(sql);

  sql = `SELECT customerId, firstName, lastName
      FROM pa_customers
      ORDER BY lastName`;
  let customerRows = await executeSQL(sql);

  sql = `SELECT technicianId, firstName, lastName
      FROM pa_technicians
      ORDER BY lastName`;
  let technicianRows = await executeSQL(sql);

  res.render("ticketNew", { "message": "Ticket added!", "products": productRows, "customers": customerRows, "technicians": technicianRows });
});

//ticketsCurrentlyOpen (sorted by date)
app.get('/ticket/currentlyOpen', isLoggedIn, async (req, res) => {
  let sql = `SELECT requestId, productName, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, timeFilled, pa_technicians.firstName as tFirstName, pa_technicians.lastName as tLastName, description
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      JOIN pa_technicians ON pa_requests.technicianId = pa_technicians.technicianId
      WHERE timeFilled IS NULL
      ORDER BY timeRequested`;
  let ticketRows = await executeSQL(sql);

  res.render('ticketCurrentlyOpen', { "tickets": ticketRows })
});

//ticketLookup
app.get('/ticket/lookup', isLoggedIn, async (req, res) => {
  let sql = `SELECT requestId, productName, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, timeFilled, pa_technicians.firstName as tFirstName, pa_technicians.lastName as tLastName, description
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      JOIN pa_technicians ON pa_requests.technicianId = pa_technicians.technicianId
      ORDER BY requestId`;
  let rows = await executeSQL(sql);

  res.render('ticketLookup', { "tickets": rows })
});

//ticketEdit
app.get("/ticket/edit", isLoggedIn, async function(req, res) {
  let requestId = req.query.requestId;

  let sql = `SELECT requestId, productId, productName, pa_requests.customerId as customerId, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, DATE_FORMAT(timeFilled, '%Y-%m-%d') timeFilled, pa_requests.technicianId as technicianId, pa_technicians.firstName as tFirstName, pa_technicians.lastName as tLastName, description, repair
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      JOIN pa_technicians ON pa_requests.technicianId = pa_technicians.technicianId
      WHERE requestId =  ${requestId}`;
  let rows = await executeSQL(sql);

  sql = `SELECT technicianId, firstName, lastName
      FROM pa_technicians
      ORDER BY lastName`;
  let technicianRows = await executeSQL(sql);

  res.render("ticketEdit", { "ticketInfo": rows, "technicians": technicianRows });
});

app.post("/ticket/edit", async function(req, res) {
  let sql = `UPDATE pa_requests
            SET timeFilled = ?,
               technicianId = ?,
               repair = ?
            WHERE requestId =  ?`;

  let params = [req.body.timeFilled,
  req.body.technicianId, req.body.repair, req.body.requestId];
  await executeSQL(sql, params);

  sql = `SELECT requestId, productId, productName, pa_requests.customerId as customerId, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, DATE_FORMAT(timeFilled, '%Y-%m-%d') timeFilled, pa_requests.technicianId as technicianId, pa_technicians.firstName as tFirstName, pa_technicians.lastName as tLastName, description, repair
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      JOIN pa_technicians ON pa_requests.technicianId = pa_technicians.technicianId
      WHERE requestId =  ${req.body.requestId}`;
  let rows = await executeSQL(sql);

  sql = `SELECT technicianId, firstName, lastName
      FROM pa_technicians
      ORDER BY lastName`;
  let technicianRows = await executeSQL(sql);

  res.render("ticketEdit", { "ticketInfo": rows, "technicians": technicianRows, "message": "Ticket Updated!" });
});

//ticketPrint (closed tickets)
app.get('/ticket/print', isLoggedIn, async (req, res) => {
  let sql = `SELECT requestId, productName, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, DATE_FORMAT(timeFilled, '%Y-%m-%d') timeFilled
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      WHERE timeFilled IS NOT NULL
      ORDER BY timeFilled desc`;
  let ticketRows = await executeSQL(sql);

  res.render('ticketPrint', { "tickets": ticketRows })
});

//api
app.get('/api/product/:productId', isLoggedIn, async (req, res) => {
  let productId = req.params.productId;
  let sql = `SELECT *
      FROM pa_products
      WHERE productId = ?`;

  let rows = await executeSQL(sql, [productId]);
  res.send({ "products": rows })
});

app.get('/api/ticket/:requestId', isLoggedIn, async (req, res) => {
  let requestId = req.params.requestId;

  let sql = `SELECT requestId, productId, productName, productType, productBrand, pa_requests.customerId as customerId, pa_customers.firstName as cFirstName, pa_customers.lastName as cLastName, pa_customers.zip as cZip, pa_customers.email as cEmail, pa_customers.phoneNumber as cPhoneNumber, DATE_FORMAT(timeRequested, '%Y-%m-%d') timeRequested, DATE_FORMAT(timeFilled, '%Y-%m-%d') timeFilled, pa_requests.technicianId as technicianId, pa_technicians.firstName as tFirstName, pa_technicians.lastName as tLastName, pa_technicians.email as tEmail, pa_technicians.phoneNumber as tPhoneNumber, description, repair
      FROM pa_requests
      NATURAL JOIN pa_products
      NATURAL JOIN pa_customers
      JOIN pa_technicians ON pa_requests.technicianId = pa_technicians.technicianId
      WHERE requestId =  ?`;

  let rows = await executeSQL(sql, [requestId]);
  res.send({ "tickets": rows })
});

//sql function
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}

function isLoggedIn(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/");
  }
}

app.listen(3000, () => {
  console.log('server started');
})