var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql');
var bp = require('body-parser');
var sessions = require( 'express-session' );
var cookieParser = require('cookie-parser');

mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'course'
});
var con=  mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'course'
    });
var app=express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('public'));
app.set('view engine','ejs');

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

var auth=(req,res,next)=>{
    if(req.session.logged && req.session.role=='user'){
        next()
    }
    else{
        res.redirect('/login')
    }
}
var teacherauth=(req,res,next)=>{
    if(req.session.logged && req.session.role=='teacher'){
        next()
    }
    else{
        res.redirect('/teacher/login')
    }
}
var adminauth=(req,res,next)=>{
    if(req.session.logged && req.session.role=='admin'){
        next()
    }
    else{
        res.redirect('/admin/login')
    }
}

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
} );
app.get('/admin',adminauth,function(req,res){
    var con=connection();
    con.query('SELECT * FROM teachers',(e,r)=>{
        return res.render('pages/dashboard',{
            teachers:r
        });
    });  
} );
app.get('/admin/teachers',adminauth,function(req,res){
    var con=connection();
    con.query( 'SELECT * FROM teachers', ( e, r ) => {
        if ( e ) {
            res.send( e.message )
            return
        }
        res.render('pages/admin/teachers',{
            teachers:r
        });
    });  
} );

app.get('/admin/students',adminauth,function(req,res){
    var con=connection();
    con.query('SELECT * FROM students',(e,r)=>{
        return res.render('pages/admin/students',{
            students:r
        });
    });  
} );
app.get('/teacher',teacherauth,function(req,res){
    var con=connection();
    con.query('SELECT * FROM category',(e,r)=>{
        return res.render('pages/index',{
            category:r
        });
    });  
} );

//user auth
app.get('/register',(req,res)=>{
    if(req.session.logged){
        res.redirect('/logout');
        return
    }
    res.render('pages/register')
})
app.get('/login',(req,res)=>{
    if(req.session.logged){
        res.redirect('/');
        return
    }
    res.render('pages/login')
})
app.get('/logout',auth,(req,res)=>{
    if(req.session.logged){
        req.session.logged=false
        req.session.id = null
        req.session.role='user'
        res.redirect('/');
        return
    }
})
app.post('/log-in',(req,res)=>{
    var email=req.body.email;
    var password=req.body.password;
    con.query(`SELECT id FROM users WHERE email='${email}' AND password='${password}'`,(e,r)=>{
        if(r){
            req.session.userid=r[0].id
            req.session.logged=true
            req.session.role='user'
            res.redirect('/');
        }
        else{
            res.render('pages/login')
        }
    })
    
})

app.post('/registration',(req,res)=>{
    var name=req.body.name;
    var email=req.body.email;
    var phone=req.body.phone;
    var address=req.body.address;
    var password=req.body.password;
    con.query(`INSERT INTO users(name,email,phone,address,password) VALUES('${name}','${email}','${phone}','${address}','${password}')`,(e,r)=>{
        req.session.id=r[0].id
        req.session.logged=true
        req.session.role='user'
        res.redirect('/');
    })
})
// user auth

// admin auth

app.get('/admin/login',(req,res)=>{
    if(req.session.logged){
        res.redirect('/');
        return
    }
    res.render('pages/login')
})
app.get('/admin/logout',adminauth,(req,res)=>{
    if(req.session.logged){
        req.session.logged=false
        req.session.id=null
        req.session.role=''
        res.redirect('/');
        return
    }
})
app.post('/admin/log-in',(req,res)=>{
    var email=req.body.email;
    var password=req.body.password;
    con.query(`SELECT id FROM admin WHERE email='${email}' AND password='${password}'`,(e,r)=>{
        if(r){
            req.session.userid=r[0].id
            req.session.logged = true
            req.session.role='admin'
            res.redirect('/');
        }
        else{
            res.redirect('/admin/login');
        }
    })
    
})

// admin auth

// teacher auth

app.get('/teacher/register',(req,res)=>{
    if(req.session.logged){
        res.redirect('/teacher/logout');
        return
    }
    res.render('pages/teacher/register')
})
app.get('/teacher/login',(req,res)=>{
    if(req.session.logged){
        res.redirect('/');
        return
    }
    res.render('pages/teacher/login')
})
app.get('/teacher/logout',teacherauth,(req,res)=>{
    if(req.session.logged){
        req.session.logged=false
        req.session.id=null
        req.session.role=''
        res.redirect('/');
        return
    }
})
app.post('/teacher/log-in',(req,res)=>{
    var email=req.body.email;
    var password=req.body.password;
    con.query(`SELECT id FROM teachers WHERE email='${email}' AND password='${password}'`,(e,r)=>{
        if(r){
            req.session.userid=r[0].id
            req.session.logged=true
            res.redirect('/teacher');
        }
        else{
            res.redirect('/teacher/login')
        }
    })
    
})

app.post('/teacher/registration',(req,res)=>{
    var name=req.body.name;
    var email=req.body.email;
    var phone=req.body.phone;
    var address=req.body.address;
    var password=req.body.password;
    con.query(`INSERT INTO teachers(name,email,phone,address,password) VALUES('${name}','${email}','${phone}','${address}','${password}')`,(e,r)=>{
        req.session.id=r[0].id
        req.session.logged=true
        req.session.role='teacher'
        res.redirect('/teacher');
    })
})
// teacher auth

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
} );


app.get('/course/:id',(req,res)=>{
    var id=req.params.id;
    con.query(`SELECT * FROM course WHERE id=${id}`,(e,result)=>{
        if(e){
            res.send(e) 
            return
        }
        res.render('pages/buy',{
            product:result[0],
            user_id:req.session.userid
        });
    });
})

app.post('/buy-confirm',(req,res)=>{
    var id=req.body.id;
    var acc=req.body.acc;
    var trans=req.body.trans;
    con.query(`INSERT INTO buy(user_id,trans,account,course_id) VALUES('1','${trans}','${acc}','${id}')`,(e,r)=>{
        if(e){
            res.send(e)
            return
        }
        res.render('pages/buy-confirm');
    })
})
