const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "r98du2bxwqkq3shg.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "jhfnqs7r2shwp05y",
  password: "ijy75at8strpxb4h",
  database: "pt64krvvldvz43ex"
});

module.exports = pool;
