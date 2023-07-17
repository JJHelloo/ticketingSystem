//installed mysql, express, ejs, node-fetch 2.6, faker

const express = require('express');
const app = express();
const pool = require("./dbPool.js");
const fetch = require("node-fetch");
const faker = require('faker');
const session = require('express-session')
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//express session
app.use(session({
    secret: 'cake',
    resave: true,
    saveUninitialized: true
}));

//routes
app.get('/', async (req, res) => {
    res.render('index', {info: {"imageURL":imageMac}})
});

app.post('/', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;


  //put unsplash image here when close to finalized
  imageMac =  "/img/mac.jpg";
  
  let hashedPassword = "";

  let sql = `SELECT *
            FROM pa_users
            WHERE username = ?`;
  let rows = await executeSQL(sql, [username]);

  if (rows.length >0){
    hashedPassword = rows[0].password;
  }

  let passwordMatch = await bcrypt.compare(password, hashedPassword);

  if (passwordMatch){
    req.session.authenticated = true;
    res.render("open")
  } else {
    res.render("index", {info: {"imageURL":imageMac, "message":"Incorrect Password and Username Combination"}});
  }
});

app.get('/open', async (req, res) => {
  
  
  if (!req.session.authenticated){
    res.redirect("/")
  }else{

    
  res.render("open")    
  }
});

function isAuthenticated(req,res,next){
    if (!req.session.authenticated){
      res.redirect("/");
    } else {
      next();
    }
}

app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

//display form for input product information
app.get('/product/new', async (req, res) => {
  if (!req.session.authenticated){
    res.redirect("/")
  }else{

  
   let sqlProduct = `SELECT DISTINCT productType
             From pa_products
             ORDER BY productType`;
  let rowProduct = await executeSQL(sqlProduct);

   res.render('newProduct', {"products":rowProduct})
}});

app.post("/product/new", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let productName = req.body.productName;
  let productType = req.body.productType;
  let productBrand = req.body.productBrand;

  let sql = "INSERT INTO pa_products (productName, productType, productBrand) VALUES (?, ?, ?);"
  let params = [productName, productType, productBrand];
  let rows = await executeSQL(sql, params);

   let sqlProduct = `SELECT DISTINCT productType
             From pa_products
             ORDER BY productType`;
  let rowProduct = await executeSQL(sqlProduct);
  
  res.render("newProduct", {"message": "Product added!", "products":rowProduct});
}});

app.get("/products", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `SELECT *
            FROM pa_products
            ORDER BY productName`;
 let rows = await executeSQL(sql);
 res.render("productList", {"products":rows});
}});

app.get("/technicians", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `SELECT *
            FROM pa_technicians
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("technicianList", {"technicians":rows});
}});

app.get('/request/new', async (req, res) => {
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
   
   let sqlCustomer = `SELECT customerId, firstName, lastName
             From pa_customers
             ORDER BY lastName`;
  let rowCustomer = await executeSQL(sqlCustomer);

  let sqlProduct = `SELECT *
             From pa_products
             ORDER BY productName`;
  let rowProduct = await executeSQL(sqlProduct);

   let sqlRequest = `SELECT *
             From pa_requests`;
  let rowRequest = await executeSQL(sqlRequest);

  let sqlTechnician = `SELECT *
             From pa_technicians
             ORDER BY technicianId`;
  let rowTechnician = await executeSQL(sqlTechnician);


  res.render("newRequest",{ info: {"technicians":rowTechnician, "products":rowProduct, "requests":rowRequest, "customers":rowCustomer,}});
}});

//display form for input product information
app.get('/customer/new', (req, res) => {
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
   res.render('newCustomer')
}});

app.post("/customer/new", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.email;
  let phoneNumber = req.body.phoneNumber;
  let military = req.body.military;
  let zipCode = req.body.zipCode;

  let sql = "INSERT INTO pa_customers (firstName, lastName, email, phoneNumber, military, zip) VALUES (?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, email, phoneNumber, military, zipCode];
  let rows = await executeSQL(sql, params);
  res.render("newCustomer", {"message": "Customer added!"});
}});

app.get("/customers", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `SELECT *
            FROM pa_customers
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("customerList", {"customers":rows});
}});

app.get("/customer/delete", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let sql = `DELETE
             FROM pa_customers
             WHERE customerID = ${req.query.customerId}`;
  let rows = await executeSQL(sql);
  res.redirect("/customers");
}});

app.get("/product/delete", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let sql = `DELETE
             FROM pa_products
             WHERE productID = ${req.query.productId}`;
  let rows = await executeSQL(sql);
  res.redirect("/products");
}});

app.get("/customer/edit", async function(req, res){
 if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let customerId = req.query.customerId;
 
 let sql = `SELECT *
            FROM pa_customers
            WHERE customerId =  ${customerId}`;
  
 let rows = await executeSQL(sql);
 res.render("editCustomer", {"customerInfo":rows});
}});

app.get("/product/edit", async function(req, res){
 if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let productId = req.query.productId;
 
 let sql = `SELECT *
            FROM pa_products
            WHERE productId =  ${productId}`;
  
 let rows = await executeSQL(sql);

   let sqlProduct = `SELECT DISTINCT productType
             From pa_products
             ORDER BY productType`;
  let rowProduct = await executeSQL(sqlProduct);
  
 res.render("editProduct",{info: {"productInfo":rows, "products":rowProduct}});
}});

app.post("/customer/print", async function(req, res){
 
let params = [req.body.firstName,  
              req.body.lastName, req.body.email, req.body.phoneNumber, req.body.military, req.body.zipCode, req.body.customerId];         
let rows = await executeSQL(sql,params);
 
sql = `SELECT *
        FROM pa_customers
        WHERE customerId= ${req.body.customerId}`;
 rows = await executeSQL(sql);
 res.render("customerPrint", {"customerInfo":rows, "message": "Customer Updated!"});
}});

app.post("/product/edit", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `UPDATE pa_products
            SET productName = ?,
               productType = ?,
               productBrand = ?
            WHERE productId = ?`;
 
let params = [req.body.productName,  
              req.body.productType, req.body.productBrand, req.body.productId];         
let rows = await executeSQL(sql,params);
 
sql = `SELECT *
        FROM pa_products
        WHERE productId= ${req.body.productId}`;
 rows = await executeSQL(sql);
 res.render("editProduct", {"productInfo":rows, "message": "product Updated!"});
}});

//below is edit technician

app.get('/technician/new', (req, res) => {
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
   res.render('newTechnician')
}});

app.post("/technician/new", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.email;
  let phoneNumber = req.body.phoneNumber;
  let military = req.body.military;
  let zipCode = req.body.zipCode;

  let sql = "INSERT INTO pa_technicians (firstName, lastName, email, phoneNumber, military, zip) VALUES (?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, email, phoneNumber, military, zipCode];
  let rows = await executeSQL(sql, params);
  res.render("newTechnician", {"message": "Technician added!"});
}});

app.get("/technicians", async function(req, res){if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `SELECT *
            FROM pa_technicians
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("technicianList", {"technicians":rows});
}});

app.get("/technician/delete", async function(req, res){
  if (!req.session.authenticated){
    res.redirect("/")
  }else{
  let sql = `DELETE
             FROM pa_technicians
             WHERE technicianID = ${req.query.technicianId}`;
  let rows = await executeSQL(sql);
  res.redirect("/technicians");
}});

app.get("/technician/edit", async function(req, res){if (!req.session.authenticated){
    res.redirect("/")
  }else{
 
 let technicianId = req.query.technicianId;
 
 let sql = `SELECT *
            FROM pa_technicians
            WHERE technicianId =  ${technicianId}`;
  
 let rows = await executeSQL(sql);
 res.render("editTechnician", {"technicianInfo":rows});
}});

app.post("/technician/edit", async function(req, res){if (!req.session.authenticated){
    res.redirect("/")
  }else{
 let sql = `UPDATE pa_technicians
            SET firstName = ?,
               lastName = ?,
               email = ?,
               phoneNumber = ?,
               military = ?,
               zip = ?
            WHERE technicianId = ?`;
 
let params = [req.body.firstName,  
              req.body.lastName, req.body.email, req.body.phoneNumber, req.body.military, req.body.zipCode, req.body.technicianId];         
let rows = await executeSQL(sql,params);
 
sql = `SELECT *
        FROM pa_technicians
        WHERE technicianId= ${req.body.technicianId}`;
 rows = await executeSQL(sql);
 res.render("editTechnician", {"technicianInfo":rows, "message": "Technician Updated!"});
}});


//test database
app.get("/1", async function(req, res){
  let sql = "SELECT * FROM pa_technicians";
  let rows = await executeSQL(sql);
  res.send(rows);
});

//test database
app.get("/2", async function(req, res){
  let sql = "SELECT * FROM pa_products";
  let rows = await executeSQL(sql);
  res.send(rows);
});

//test database
app.get("/3", async function(req, res){
  let sql = "SELECT * FROM pa_requests";
  let rows = await executeSQL(sql);
  res.send(rows);
});

//test database
app.get("/4", async function(req, res){
  let sql = "SELECT * FROM pa_technicians";
  let rows = await executeSQL(sql);
  res.send(rows);
});

//functions
async function executeSQL(sql, params){
return new Promise (function(resolve, reject) {
  pool.query(sql, params, function (err, rows, fields) {
    if (err) throw err;
    resolve(rows);
  });
});
}


app.listen(3000, () => {
  console.log('server started');
})