const dbtable = require('../models/dbModel');


const addnewpatient = (req, res) => {
    const errorMessage = req.query.error;
    res.render('add_new_patient', { errorMessage });
};

const addnewpatient_post =  async (req, res) => {
    try {
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused}=req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];
        // Validation check
        if(age<0)
        {
            return res.render('add_new_patient', { errorMessage: 'Invalid age entered' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused},);
        }
        if(!validGenders.includes(gender)){
            return res.render('add_new_patient', { errorMessage: 'Invalid gender entered' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused},);
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('add_new_patient', { errorMessage: 'Contact number must be 10 digits long' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused},);
        }
        if (!validBloodGroups.includes(blood_group)) {
            return res.render('add_new_patient', { errorMessage: 'Invalid blood group entered.',name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused });
        }
        if( units_transfused <= 0) {
            return res.render('add_new_patient', { errorMessage: 'Units transfused must be greater than 0.' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused});
        }
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
};

const readpatients = async (req, res) => {
    try {
        const bloodGroup = req.query.blood_group;
        const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

        let query = 'SELECT * FROM Patient';
        let params = [];
        let errorMessage = '';

        if (bloodGroup && bloodGroup.trim() !== '') {
            const input = bloodGroup.trim();
            if (!validBloodGroups.includes(input)) {
                errorMessage = 'Invalid blood group entered.';
            } else {
                query += ' WHERE blood_group = ?';
                params.push(input);
            }
        }

        const [rows] = errorMessage ? [[], []] : await dbtable.query(query, params);
        res.render("read_patients", {
            patientData: rows,
            blood_group: bloodGroup || '',
            error: errorMessage
        });

    } catch (error) {
        console.error(error);
        res.send('Error loading patients page');
    }
};

const deletepatient = async (req,res)=>
    {   
        try {
            await dbtable.query('DELETE FROM patient_logtable WHERE patient_id = ?', [req.params.patient_id]);
            await dbtable.query('DELETE FROM Patient WHERE patient_id = ?', [req.params.patient_id]);
            res.redirect('/readpatients');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error deleting patient');
        }
};

const updatepatient = async (req,res)=>{
    try {
        const patientId = parseInt(req.params.patient_id);
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_transfused}=req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];
        const patient = { patient_id: patientId, name, age, gender, contact,hospital_name, hospital_address,blood_group, units_transfused };
        // Validation check
        if(age<0){
            return res.render('edit_patient', { error: 'Invalid age entered' ,patient},);
        }
        if(!validGenders.includes(gender)){
            return res.render('edit_patient', { error: 'Invalid gender entered' ,patient},);
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('edit_patient', { error: 'Contact number must be 10 digits long' ,patient},);
        }
       if (!validBloodGroups.includes(blood_group)) {
           return res.render('edit_patient', { error: 'Invalid blood group entered.', patient });
       }

       if (units_transfused <= 0) {
           return res.render('edit_patient', { error: 'Units transfused must be greater than 0.', patient });
       }

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
};
const editpatient = async (req,res)=>{
    try {
        const patientId = parseInt(req.params.patient_id);
        const [rows] = await dbtable.query('SELECT * FROM Patient WHERE patient_id = ?', [patientId]);
        res.render('edit_patient', { patient: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while fetching patient details');
    }
};

const patientlogtable = async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT l.entry_id, l.patient_id, p.name, l.units_transfused, l.date_of_transfusion FROM Patient_logtable l JOIN Patient p ON l.patient_id = p.patient_id');
        res.render('patient_log_table', { logtableData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading patient log table page');
    }
};
const deletepatientlog = async (req, res) => {
    const entry_id = req.params.entry_id;
    try {
        await dbtable.query('DELETE FROM patient_logtable WHERE entry_id = ?', [entry_id]);
        res.redirect('/patientlogtable');
    } catch (error) {
        console.error(error);
        res.send('Error deleting log entry');
    }
};

const transfusionhistory = async (req, res) => {
    const patientId = req.params.patient_id;
    const errorMessage = req.query.error;
    const [patientRows] = await dbtable.query('SELECT * from Patient where patient_id=?',[patientId]); 
    const [patientLogs] = await dbtable.query('SELECT * from patient_logtable where patient_id=?',[patientId]); 
    const patient = patientRows[0];
    res.render('transfusion_history', { patient, patientLogs,errorMessage });
};
const addtransfusion = async (req, res) => {
    const { units, date } = req.body;
    const patientId = req.params.patient_id;

    

    if (units <= 0) {
        const [patientRows] = await dbtable.query('SELECT * from Patient where patient_id=?', [patientId]);
    const [patientLogs] = await dbtable.query('SELECT * from patient_logtable where patient_id=?', [patientId]);
    const patient = patientRows[0]; 
        return res.render('transfusion_history', {
            errorMessage: 'Number of units transfused must be greater than 0',
            patient,
            patientLogs
        });
    }

    try {
       
        const [patientRows] = await dbtable.query('SELECT * FROM Patient WHERE patient_id = ?', [patientId]);
        const patient = patientRows[0];
        const [bloodGroupRow] = await dbtable.query('SELECT blood_group FROM Patient WHERE patient_id = ?', [patientId]);
        const blood_group = bloodGroupRow[0].blood_group;
        try {
            await dbtable.query('CALL add_transfusion_entry(?,?,?,?)', [patientId, units, date, blood_group]);
            return res.redirect(`/transfusionhistory/${patientId}`);
        } catch (error) {
            console.error("Procedure error:", error);
            const [patientLogs] = await dbtable.query('SELECT * FROM patient_logtable WHERE patient_id = ?', [patientId]);

            return res.render('transfusion_history', {
                errorMessage: error.sqlMessage || 'An error occurred during transfusion',
                patient,
                patientLogs
            });
        }
        
        res.redirect(`/transfusionhistory/${patientId}`); 
            
    } catch (error) {
        console.error("Error from procedure or database:", error);
        
    }
};



module.exports={addnewpatient,addnewpatient_post,readpatients,deletepatient,updatepatient,editpatient,patientlogtable,deletepatientlog,transfusionhistory,addtransfusion};