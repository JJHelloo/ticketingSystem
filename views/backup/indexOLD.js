/*
//deletes a technician (REMOVED DUE TO FOREIGN KEY CONSTRAINTS)
app.get("/technician/delete", async function(req, res) {
  let sql = `DELETE
            FROM pa_technicians
            WHERE technicianId = ${req.query.technicianId}`;
  let rows = await executeSQL(sql);
  res.redirect("/technician/lookup");
});
*/