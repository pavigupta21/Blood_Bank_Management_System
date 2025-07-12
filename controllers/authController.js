const dbtable = require('../models/dbModel');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const logout = (req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
};
const userlogout=(req,res)=>{
    res.clearCookie('token');
    res.redirect('/userlogin');
}
const usersignout=async(req,res)=>{
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect('/usersignup');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email; 
        await dbtable.query('DELETE FROM User WHERE email = ?', [userEmail]);

        res.clearCookie('token');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error while signing out');
    }
}
const signout = async (req,res)=>{
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect('/signup');

       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email; 
        await dbtable.query('DELETE FROM DBadmin WHERE email = ?', [userEmail]);

        
        res.clearCookie('token');

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error while signing out');
    }
};
const usersignup=(req,res)=>{
    const errorMessage=req.query.error;
    res.render('index',{errorMessage});
};
const usersignup_post = async (req, res) => {
    try {
        let role='';
        const {name,email,password}=req.body;
        const [existing] = await dbtable.query('SELECT * FROM User WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('index', { errorMessage: 'User with this email already exists.',name,email,password });
        }
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds);
        await dbtable.query('INSERT INTO User (name, email, password) VALUES (?, ?, ?)', 
                      [name, email, hashedPassword]);
        const [newUser] = await dbtable.query('SELECT user_id FROM User WHERE email = ?', [email]);
        const user_id = newUser[0].user_id;
        role='user';
        const token=jwt.sign({email,role,user_id},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect(`/userhome/${user_id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while signup');
    }
}
const signup =  (req, res) => {
    const errorMessage = req.query.error;
    res.render('index', { errorMessage });
};
const signup_post =  async (req, res) => {
    try {
        let role='';
        const {name,email,password,admin_key}=req.body;
        const [existing] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('index', { errorMessage: 'User with this email already exists.',name,email,password });
        }
        if(admin_key!==(name+"admin@123"))
        {
            return res.render('index', { errorMessage: 'Invalid admin key.',name,email,password });
        }
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds);
        await dbtable.query('INSERT INTO DBadmin (name, email, password,admin_key) VALUES (?, ?, ?, ?)', 
                      [name, email, hashedPassword,admin_key]);
        role='admin';
        const token=jwt.sign({email,role},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while signup');
    }
};
const login =  (req, res) => {
    res.render('login', { errorMessage: null });
};
const userlogin=(req,res)=>{
    res.render('userlogin', { errorMessage: null });
}
const gotohome = (req, res) => {
    res.render('home');
};
const userhome=(req,res)=>{
     const paramUserId = parseInt(req.params.user_id, 10);
    const tokenUserId = req.user.user_id;

    if (paramUserId !== tokenUserId) {
        return res.status(403).send('Unauthorized access');
    }

    res.render('userhome', { user_id: tokenUserId });
}
const userlogin_post=async(req,res)=>{
    try {
        let role='';
        const {email,password}=req.body;
        const [rows] = await dbtable.query('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.render('userlogin', { errorMessage: 'Invalid email or password' ,email,password});
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('userlogin', { errorMessage: 'Invalid email or password',email,password });
        }
        const user_id = user.user_id;
        role='user';
        const token=jwt.sign({email,role,user_id},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect(`/userhome/${user_id}`);
    } catch (error) {
        console.error(error);
        return res.render('userlogin', { errorMessage: 'Database error while logging in' });
    }
}
const login_post =  async (req, res) => {
    try {
        let role='';
        const {email,password}=req.body;
        const [rows] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.render('login', { errorMessage: 'Invalid email or password' ,email,password});
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { errorMessage: 'Invalid email or password',email,password });
        }
        role='admin';
        const token=jwt.sign({email,role},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        return res.render('login', { errorMessage: 'Database error while logging in' });
    }
};


module.exports={logout,signout,signup,signup_post,login,gotohome,login_post,usersignup,usersignup_post,userlogin,userlogin_post,userhome,usersignout,userlogout};