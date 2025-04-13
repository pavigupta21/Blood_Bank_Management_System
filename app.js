const cookieParser = require('cookie-parser');
const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const dbtable = require('./models/dbModel');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
});
app.get('/signout',async (req,res)=>{
    try {
        // Get the token from cookies
        const token = req.cookies.token;
        if (!token) return res.redirect('/signup'); // If no token, just redirect

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email; // Extract email from token

        // Delete user from the database
        await dbtable.query('DELETE FROM DBadmin WHERE email = ?', [userEmail]);

        // Clear the cookie
        res.clearCookie('token');

        // Redirect to signup page
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error while signing out');
    }
});
app.post('/signup', async (req, res) => {
    try {
        const {name,email,password}=req.body;
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
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.post('/login', async (req, res) => {
    try {
        const {email,password}=req.body;
        const [rows] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).send('Invalid email or password');
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }
        const token=jwt.sign({email},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while login');
    }
});
app.get('/incstock', async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        res.render('inc_stock', { bloodData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading stock page');
    }
});
app.post('/incstock', async (req, res) => {
    const { blood_group, units } = req.body;
    try {
        await dbtable.query('UPDATE BloodGroup SET units = units + ? WHERE blood_group = ?', [units, blood_group]);
        res.redirect('/incstock');
    } catch (error) {
        console.error(error);
        res.send('Error updating stock');
    }
});
app.get('/decstock', async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        res.render('dec_stock', { bloodData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading stock page');
    }
});
app.post('/decstock', async (req, res) => {
    const { blood_group, units } = req.body;
    try {
        await dbtable.query('UPDATE BloodGroup SET units = units - ? WHERE blood_group = ?', [units, blood_group]);
        res.redirect('/decstock');
    } catch (error) {
        console.error(error);
        res.send('Error updating stock');
    }
});
app.get("/addnewdonor", (req, res) => {
    res.render("add_new_donor");
});
app.post("/addnewdonor", async (req, res) => {
    try {
        const {name,age,gender,contact,address,blood_group,units_donated}=req.body;
        await dbtable.query('INSERT INTO Donor (name, age, gender, contact, address, blood_group, units_donated) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                      [name, age, gender, contact, address, blood_group, units_donated]);
        // Update the blood group table to reflect the new donor's donation
        await dbtable.query('UPDATE BloodGroup SET units = units + ? WHERE blood_group = ?', [units_donated, blood_group]);
        // Redirect to the incstock page after adding the donor
        res.redirect('/readdonors');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while adding new donor details');
    }
});
app.get("/addnewpatient", (req, res) => {
    res.render("add_new_patient");
});
app.post("/addnewpatient", async (req, res) => {
    try {
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused}=req.body;
        await dbtable.query('INSERT INTO Patient (name, age, gender, contact, hospital_name,hospital_address, blood_group, units_transfused) VALUES (?, ?, ?, ?, ?, ?, ?,?)', 
                      [name, age, gender, contact,hospital_name,hospital_address, blood_group, units_transfused]);
        // Update the blood group table to reflect the new patient's transfusion
        await dbtable.query('UPDATE BloodGroup SET units = units - ? WHERE blood_group = ?', [units_transfused, blood_group]);
        // Redirect to the incstock page after adding the donor
        res.redirect('/readpatients');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while adding new donor details');
    }
});

app.get("/readdonors",async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT * FROM Donor');
        res.render("read_donors",{donorData:rows});
    } catch (error) {
        console.error(error);
        res.send('Error loading donors page');
    }
});
app.get("/readpatients",async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT * FROM Patient');
        res.render("read_patients",{patientData:rows});
    } catch (error) {
        console.error(error);
        res.send('Error loading patients page');
    }
});
app.get('/deletepatient/:patient_id',async (req,res)=>
    {   
        try {
            await dbtable.query('DELETE FROM Patient WHERE patient_id = ?', [req.params.patient_id]);
            res.redirect('/readpatients');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error deleting patient');
        }
});
app.get('/deletedonor/:donor_id',async (req,res)=>
    {   
        try {
            await dbtable.query('DELETE FROM Donor WHERE donor_id = ?', [req.params.donor_id]);
            res.redirect('/readdonors');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error deleting donor');
        }
});
app.post('/updatedonor/:donor_id',async (req,res)=>{
    try {
        const donorId = parseInt(req.params.donor_id);
        const {name,age,gender,contact,address,blood_group,units_donated}=req.body;

        const [result] = await dbtable.query('UPDATE Donor SET name = ?, age = ?, gender = ?, contact=?,address=?,blood_group=?,units_donated=? WHERE donor_id = ?', 
                                        [name, age, gender, contact, address, blood_group, units_donated, donorId]);

       
        if (result.affectedRows > 0) {
            res.redirect('/readdonors');
        } else {
                res.status(404).send('Donor not found');
        }

    }
    catch (error) {
        console.error(error);
        res.status(500).send('Database error while updating donor details');
    }
});
app.get('/editdonor/:donor_id',async (req,res)=>{
    try {
        const donorId = parseInt(req.params.donor_id);
        const [rows] = await dbtable.query('SELECT * FROM Donor WHERE donor_id = ?', [donorId]);
        res.render('edit_donor', { donor: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while fetching donor details');
    }
});
app.post('/updatepatient/:patient_id',async (req,res)=>{
    try {
        const patientId = parseInt(req.params.patient_id);
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused}=req.body;

        const [result] = await dbtable.query('UPDATE Patient SET name = ?, age = ?, gender = ?, contact=?,hospital_name=?,hospital_address=?,blood_group=?,units_transfused=? WHERE patient_id = ?', 
                                        [name, age, gender, contact, hospital_name,hospital_address, blood_group, units_transfused, patientId]);

       
        if (result.affectedRows > 0) {
            res.redirect('/readpatients');
        } else {
                res.status(404).send('Patient not found');
        }

    }
    catch (error) {
        console.error(error);
        res.status(500).send('Database error while updating patient details');
    }
});
app.get('/editpatient/:patient_id',async (req,res)=>{
    try {
        const patientId = parseInt(req.params.patient_id);
        const [rows] = await dbtable.query('SELECT * FROM Patient WHERE patient_id = ?', [patientId]);
        res.render('edit_patient', { patient: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while fetching patient details');
    }
});
app.listen(4000);