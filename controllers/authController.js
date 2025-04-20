const dbtable = require('../models/dbModel');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const logout = (req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
};
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
const signup =  (req, res) => {
    const errorMessage = req.query.error;
    res.render('index', { errorMessage });
};
const signup_post =  async (req, res) => {
    try {
        const {name,email,password}=req.body;
        const [existing] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('index', { errorMessage: 'User with this email already exists.',name,email,password });
        }
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds);
        await dbtable.query('INSERT INTO DBadmin (name, email, password) VALUES (?, ?, ?)', 
                      [name, email, hashedPassword]);
        const token=jwt.sign({email},process.env.JWT_SECRET);
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
const gotohome = (req, res) => {
    res.render('home');
};
const login_post =  async (req, res) => {
    try {
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
        const token=jwt.sign({email},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        return res.render('login', { errorMessage: 'Database error while logging in' });
    }
};

module.exports={logout,signout,signup,signup_post,login,gotohome,login_post};