const express = require("express");
const app = express();

app.set("view engine", "ejs");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const {LocalStorage} = require("node-localstorage");
global.localStorage = new LocalStorage('./scratch');

const mysql = require("mysql");
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "student",
});
con.connect();

app.get("/logout", (req, res) => {
    localStorage.removeItem("status");
    res.redirect("/");
  });


// login the admin
app.get("/", (req, res) => {
    res.render("admin");
});
app.post("/", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var query =
        "select * from admin where email='" +
        email +
        "' and password='" +
        password +
        "'";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        if (result.length == 1) {
            localStorage.setItem("login",true)
            res.redirect("home");
        } else {
            res.redirect("/");
        }
    });
});
// end the login section

app.get("/home", (req, res) => {
    res.render("home");
});

// start add standard
app.get("/addstandard", (req, res) => {
    res.render("addstandard");
});
app.post("/addstandard", (req, res) => {
    var std = req.body.std;
    var query = "insert into addstd(std) values('" + std + "')";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("home");
    });
});

app.get('/viewstd',(req,res) => {
    const query =   "select * from addstd"
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render('viewstd',{result})
    });
})
// end add standard
// start add div
app.get("/addDiv", (req, res) => {
    res.render("addDiv");
});
app.post("/addDiv", (req, res) => {
    var std = req.body.std;
    var division = req.body.division;
    var query =
        "insert into adddiv(std,division) values('" + std + "','" + division + "')";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.redirect("addDiv");
    });
});
// end add div

// start add staff
app.get("/addstaff", (req, res) => {
    const query = "select * from addstd";
    con.query(query, (error, result, index) => {
        if (error) throw error;

        const query1 = "select * from adddiv";
        con.query(query1, (error, result1, index) => {
            if (error) throw error;
            res.render("addstaff", { result, result1 });
        });
    });
});

app.post("/addstaff", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var std = req.body.std;
    var div = req.body.division;
    var query =
        "insert into staff(name,email,password,std,division) values('" +
        name +
        "','" +
        email +
        "','" +
        password +
        "','" +
        std +
        "','" +
        div +
        "')";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.redirect("/viewstaff");
    });
});
// end add staff

app.get("/viewstaff", (req, res) => {
    var query = "select * from staff ";
    con.query(query, (error, result, index) => {
        if (error) throw error;

        res.render("viewstaff", { result });
    });
});

// add students
app.get("/addstu", (req, res) => {
    const query = "select * from addstd";
    con.query(query, (error, result, index) => {
        if (error) throw error;

        const query1 = "select * from adddiv";
        con.query(query1, (error, result1, index) => {
            if (error) throw error;
            res.render("addstu", { result, result1 });
        });
    });
});

app.post("/addstu", (req, res) => {
    var rollno = req.body.rno;
    var name = req.body.name;
    var std = req.body.std;
    var div = req.body.division;
    var query =
        "insert into addstudent(rollno,name,std,division) values('" +
        rollno +
        "','" +
        name +
        "','" +
        std +
        "','" +
        div +
        "')";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.redirect("/viewstu");
    });
});

app.get("/viewstu", (req, res) => {
    var query = "select * from addstudent ";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("viewstu", { result });
    });
});

// end the view student section

app.get("/studentview", (req, res) => {
    const result = [];
    if (localStorage.getItem("staff")) {
        res.render("studentview", { result });
    } else {
        res.redirect("/stafflogin");
    }
});

app.post("/studentview", (req, res) => {
    var std = req.body.std;
    var div = req.body.div;
    const query =
        "select * from student where std='" + std + "' and divi='" + div + "'";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("studentview", { result });
    });
});

// Add result student section

app.get("/addresult/:id", (req, res) => {
    // let result = [];x    
    const id = req.params.id;
    let dat =localStorage.getItem("staff");
    console.log(dat);
    const query = "select * from addstudent where id=" + id;
    if (localStorage.getItem("staff")) {
        con.query(query, (error, result, index) => {
            res.render("addresult", { result });
        });
    } else {
        res.redirect("/stafflogin");
    }
});

app.post("/addresult/:id", (req, res) => {
    var rno = req.body.rno;
    var std = req.body.std;
    var div = req.body.div;
    var name = req.body.name;
    var s1 = req.body.s1;
    var s2 = req.body.s2;
    var s3 = req.body.s3;
    var s4 = req.body.s4;
    var total = parseFloat(s1) + parseFloat(s2) + parseFloat(s3) + parseFloat(s4);
    var per = parseFloat(total / 4);

    const query =
        "insert into result (rollno,std,division,name,s1,s2,s3,s4,total,per)values('" + rno + "','" + std + "','" + div + "','" + name + "','" + s1 + "','" + s2 + "','" + s3 + "','" + s4 + "','" + total + "','" + per + "')";
    con.query(query, (error, result, index) => {
        res.redirect("/viewresult");
    });
});

app.get("/viewresult", (req, res) => {
    const query = "select * from result";   
    if (localStorage.getItem("staff")) {
        con.query(query, (error, result, index) => {
            if (error) throw error;
            res.render("viewresult", { result });
        });
    } else {
        res.redirect("/");
    }
});

app.get("/viewresult/:id", (req, res) => {
    var id = req.params.id
    const query = "select * from result where id="+id;   
    if (localStorage.getItem("staff")) {
        con.query(query, (error, result, index) => {
            if (error) throw error;
            res.render("viewresult", { result });
        });
    } else {
        res.redirect("/");
    }
});

app.get("/updateres/:id", (req, res) => {
    var id = req.params.id;
    const query = "SELECT * FROM result where id=" + id;
    con.query(query, (error, result, index) => {
        res.render("update", { result });
    });
});

app.post("/updateres/:id", (req, res) => {
    const id = req.params.id;
    var s1 = req.body.s1;
    var s2 = req.body.s2;
    var s3 = req.body.s3;
    var s4 = req.body.s4;
    var total = parseFloat(s1) + parseFloat(s2) + parseFloat(s3) + parseFloat(s4);
    var per = parseFloat(total / 4);

    const query =
        "update result set s1='" + s1 + "',s2='" + s2 + "',s3='" + s3 + "',s4='" + s4 + "',total='" + total + "',per='" + per + "' where id=" + id;
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.redirect("/viewresult");
    });
});

app.get("/deleteres/:id", (req, res) => {
    var id = req.params.id;

    const query = "delete from result where id=" + id;
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.redirect("/viewresult");
    });
});

// std wise view result

app.get("/resultstd", (req, res) => {
    const result = [];
    if (localStorage.getItem("staff")) {
        res.render("resultstd", { result });
    } else {
        res.redirect("/stafflogin");
    }
});

app.post("/resultstd", (req, res) => {
    var std = req.body.std;
    var div = req.body.div;
    const query =
        "select * from result where std='" + std + "' and division='" + div + "'";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("resultstd", { result });
    });
});

// student result get

app.get("/results", (req, res) => {
    let result2 = [];
    let result3 = [];
    let result = [];
    const query = "select * from standard";
    con.query(query, (error, results, index) => {
        if (error) throw error;
        result = results;
    });
    const query1 = "select * from divison";
    con.query(query1, (error, result1, index) => {
        if (error) throw error;
        res.render("result", { result, result1, result2 });
    });
});

// staff login

app.get("/stafflogin", (req, res) => {
    res.render("stafflogin");
  });
  
  app.post("/stafflogin", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
  
    const query =
      "select * from staff where email='" +
      email +
      "' and password='" +
      password +
      "'";
  
    con.query(query, (error, result, index) => {
      if (result.length > 0) {
        localStorage.setItem("staff", "true");
        res.redirect("/homestaff");
      } else {
        res.redirect("/stafflogin");
      }
    });
  });

app.get("/homestaff", (req, res) => {
    const query = "select * from addstudent";
    if (localStorage.getItem("staff")) {
      con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("homestaff", { result });
        console.log(result);
      });
    } else {
      res.redirect("stafflogin");
    }
  });

  app.get("/homestu", (req, res) => {
    const result = [];
    if (localStorage.getItem("staff")) {
      res.render("homestu", { result });
    } else {
      res.redirect("/stafflogin");
    }
  });
  
  app.post("/viewstu", (req, res) => {
    var std = req.body.std;
    var div = req.body.div;
    const query =
      "select * from addstudent where std='" + std + "' and divi='" + div + "'";
    con.query(query, (error, result, index) => {
      console.log("sdjkfbusdah", result);
  
      if (error) throw error;
      res.render("homestu", { result });
    });
  });

// Top 3

app.get("/viewtop", (req, res) => {
    const result = [];
    // if (localStorage.setItem("login")) {
        res.render("viewtop", { result });
    // } else {
    //     res.redirect("/");
    // }
});

app.post("/viewtop", (req, res) => {
    var std = req.body.std;
    var div = req.body.div;
    const query =
        "select * from result where std='" +
        std +
        "' and division='" +
        div +
        "' ORDER BY per DESC LIMIT 3";
    con.query(query, (error, result, index) => {
        if (error) throw error;
        res.render("viewtop", { result });
    });
});

// student login

app.get("/result", (req, res) => {
    let result2 = [];
    let result3 = [];
    let result = [];
    const query = "select * from addstd";
    con.query(query, (error, results, index) => {
      if (error) throw error;
      result = results;
    });
    const query1 = "select * from adddiv";
    con.query(query1, (error, result1, index) => {
      if (error) throw error;
      res.render("result", { result, result1, result2 });
    });
    //   res.render("results", { result3 });
  });

app.post("/result", (req, res) => {
    var std = req.body.std;
    var div = req.body.div;
    var rno = req.body.rno;
    let result = [];
    let result1 = [];
    const query = "select * from addstd";
    con.query(query, (error, results, index) => {
      if (error) throw error;
      result = results;
    });
    const query1 = "select * from adddiv";
    con.query(query1, (error, result, index) => {
      if (error) throw error;
      result1 = result;
    });
    const query3 =
      "SELECT * FROM result WHERE std='" +
      std +
      "' AND division='" +
      div +
      "' AND rollno='" +
      rno +
      "'";
    con.query(query3, (error, result2, index) => {
      if (error) throw error;
      console.log("post", result2);
      localStorage.setItem("student", "true");
      res.render("result", { result, result1, result2 });
    });
  });

app.listen(5000);
