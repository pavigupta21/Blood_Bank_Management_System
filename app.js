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
});
app.post('/signup', async (req, res) => {
    try {
        const {name,email,password}=req.body;
        const [existing] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('index', { errorMessage: 'User with this email already exists.' });
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
});
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.post('/login', async (req, res) => {
    try {
        const {email,password}=req.body;
        const [rows] = await dbtable.query('SELECT * FROM DBadmin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.render('login', { errorMessage: 'Invalid email or password' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { errorMessage: 'Invalid email or password' });
        }
        const token=jwt.sign({email},process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        return res.render('login', { errorMessage: 'Database error while logging in' });
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
    const errorMessage = req.query.error;
    try {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        res.render('dec_stock', { bloodData: rows, errorMessage });
    } catch (error) {
        console.error(error);
        res.send('Error loading stock page');
    }
});
app.post('/decstock', async (req, res) => {
    const { blood_group, units } = req.body;
    try {
        await dbtable.query('CALL update_blood_stock(?, ?)', [blood_group, units]);
        res.redirect('/decstock');
    } catch (error) {
        console.error("Error in procedure:", error);
        return res.redirect('/decstock?error=Not enough stock available!');
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
       
    const [rows] = await dbtable.query('SELECT LAST_INSERT_ID() AS donor_id');
    const donor_id = rows[0].donor_id;

  
    await dbtable.query('INSERT INTO Donor_logtable (donor_id, units_donated) VALUES (?, ?)', 
                        [donor_id, units_donated]);
        
        await dbtable.query('UPDATE BloodGroup SET units = units + ? WHERE blood_group = ?', [units_donated, blood_group]);
        
        res.redirect('/readdonors');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while adding new donor details');
    }
});
app.get("/addnewpatient", (req, res) => {
    const errorMessage = req.query.error;
    res.render('add_new_patient', { errorMessage });
    

});
app.post("/addnewpatient", async (req, res) => {
    try {
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused}=req.body;
        
         try {
            await dbtable.query('CALL update_blood_stock(?, ?)', [blood_group, units_transfused]);
        } catch (error) {
            console.error("Error in procedure:", error);
            return res.redirect('/addnewpatient?error=Not enough stock available!');
        }
        await dbtable.query('INSERT INTO Patient (name, age, gender, contact, hospital_name,hospital_address, blood_group, units_transfused) VALUES (?, ?, ?, ?, ?, ?, ?,?)', 
                      [name, age, gender, contact,hospital_name,hospital_address, blood_group, units_transfused]);
       
        const [rows] = await dbtable.query('SELECT LAST_INSERT_ID() AS patient_id');
        const patient_id = rows[0].patient_id;
        
        try {
            await dbtable.query('INSERT INTO Patient_logtable (patient_id, units_transfused) VALUES (?, ?)', 
                [patient_id, units_transfused]);
        } catch (error) {
            console.error("Error inserting into Patient_logtable:", error);
        }
       
        
        res.redirect('/readpatients');
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while adding new patient details');
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
app.get('/donorlogtable', async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT l.entry_id, l.donor_id, d.name, l.units_donated, l.date_of_donation FROM donor_logtable l JOIN Donor d ON l.donor_id = d.donor_id');
        res.render('donor_log_table', { logtableData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading donor log table page');
    }
});
app.get('/deletedonorlog/:entry_id', async (req, res) => {
    const entry_id = req.params.entry_id;
    try {
        await dbtable.query('DELETE FROM donor_logtable WHERE entry_id = ?', [entry_id]);
        res.redirect('/donorlogtable');
    } catch (error) {
        console.error(error);
        res.send('Error deleting log entry');
    }
});
app.get('/patientlogtable', async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT l.entry_id, l.patient_id, p.name, l.units_transfused, l.date_of_transfusion FROM Patient_logtable l JOIN Patient p ON l.patient_id = p.patient_id');
        res.render('patient_log_table', { logtableData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading patient log table page');
    }
});
app.get('/deletepatientlog/:entry_id', async (req, res) => {
    const entry_id = req.params.entry_id;
    try {
        await dbtable.query('DELETE FROM patient_logtable WHERE entry_id = ?', [entry_id]);
        res.redirect('/patientlogtable');
    } catch (error) {
        console.error(error);
        res.send('Error deleting log entry');
    }
});
app.get('/donationhistory/:donor_id', async (req, res) => {
    const donorId = req.params.donor_id;
    const [donorRows] = await dbtable.query('SELECT * from Donor where donor_id=?',[donorId]); // fetch from Donor table
    const [donorLogs] = await dbtable.query('SELECT * from donor_logtable where donor_id=?',[donorId]); // fetch from Donor_logtable
    const donor = donorRows[0];
    res.render('donation_history', { donor, donorLogs });
});
app.post('/adddonation/:donor_id', async (req, res) => {
    const { units, date } = req.body;
    const donorId = req.params.donor_id;

    await dbtable.query(
        "INSERT INTO donor_logtable (donor_id, units_donated, date_of_donation) VALUES (?, ?, ?)",
        [donorId, units, date]
    );
    await dbtable.query('UPDATE Donor SET units_donated = units_donated + ? WHERE donor_id = ?', [units, donorId]);
    await dbtable.query('UPDATE BloodGroup SET units = units + ? WHERE blood_group = (SELECT blood_group FROM Donor WHERE donor_id = ?)', [units, donorId]);
    res.redirect(`/donationhistory/${donorId}`);
});
app.get('/transfusionhistory/:patient_id', async (req, res) => {
    const patientId = req.params.patient_id;
    const errorMessage = req.query.error;
    const [patientRows] = await dbtable.query('SELECT * from Patient where patient_id=?',[patientId]); 
    const [patientLogs] = await dbtable.query('SELECT * from patient_logtable where patient_id=?',[patientId]); 
    const patient = patientRows[0];
    res.render('transfusion_history', { patient, patientLogs,errorMessage });
});
app.post('/addtransfusion/:patient_id', async (req, res) => {
    const { units, date } = req.body;
    const patientId = req.params.patient_id;

    try {
       
        const [patient] = await dbtable.query('SELECT blood_group FROM Patient WHERE patient_id = ?', [patientId]);
        const blood_group = patient[0].blood_group;
        try {
            await dbtable.query('CALL update_blood_stock(?, ?)', [blood_group, units]);
        } catch (error) {
            console.error("Error in procedure:", error);
            return res.redirect(`/transfusionhistory/${patientId}?error=Not enough stock available!`);
        }
        
        await dbtable.query(
            "INSERT INTO patient_logtable (patient_id, units_transfused, date_of_transfusion) VALUES (?, ?, ?)",
            [patientId, units, date]
        );

        await dbtable.query(
            'UPDATE Patient SET units_transfused = units_transfused + ? WHERE patient_id = ?',
            [units, patientId]
        );
        res.redirect(`/transfusionhistory/${patientId}`);

    } catch (error) {
        console.error("Error from procedure or database:", error);
        
    }
});



app.listen(4000);