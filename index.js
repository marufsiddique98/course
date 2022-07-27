var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql');
var bp = require('body-parser');
//var session = require('express-session');
var { auth,requiresAuth } = require('express-openid-connect');

mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'boutique'
});

var app=express();

app.use(express.static('public'));
app.set('view engine','ejs');
// app.use(session,{secret:"secret"});
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: 'https://dev-ow0u0hqx.us.auth0.com',
        baseURL: 'http://localhost:3000',
        clientID: 'wMYClH2knW8qIFXEYNOhtepEdGm4IDky',
        secret: 'gjwQmZdjiFnev8yjwuWjTon5aA1PIj7A7ioxrVyvcCx7_VqlphpggstbBrBMmzMY',
        clientSecret:'gjwQmZdjiFnev8yjwuWjTon5aA1PIj7A7ioxrVyvcCx7_VqlphpggstbBrBMmzMY',
        idpLogout: true,
    })
  );

function connection(){
    return mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'course'
    });
}

app.listen(3000);
app.use(bp.urlencoded({extends:true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static("."));



//routes

app.get('/',function(req,res){
    var con=connection();
    con.query('SELECT * FROM category',(e,r)=>{
        return res.render('pages/index',{
            category:r
        });
    });
    
});
app.get('/courses/:id',function(req,res){
    var id=req.params.id;
    var con=connection();
    var sql='SELECT * FROM course WHERE category_id=';
    sql=sql.concat(id)
    con.query(sql,(e,r)=>{
        return res.render('pages/courses',{
            courses:r
        });
    });
});
app.get('/lectures/:id',function(req,res){
    var id=req.params.id;
    var con=connection();
    var sql1='SELECT * FROM lectures WHERE course_id=';
    sql1=sql1.concat(id);
    var sql2='SELECT * FROM course WHERE id=';
    sql2=sql2.concat(id);
    sql2=sql2.concat(" LIMIT 1");
    con.query(sql2,(e,r)=>{
        var course=r;
        con.query(sql1,(e,r)=>{
            return res.render('pages/lectures',{
                course:course,
                lectures:r
            });
        });
    });
});

