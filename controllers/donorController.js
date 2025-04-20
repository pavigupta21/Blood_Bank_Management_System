const dbtable = require('../models/dbModel');

const addnewdonor =  (req, res) => {
    res.render("add_new_donor");
};
const addnewdonor_post =  async (req, res) => {
    try {
        const {name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions}=req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];

        // Validation check
        if (age < 18 || age>65) {
            return res.render('add_new_donor', { error: 'Age of donor must lie between 18 and 65' ,name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions},);
        }
        if(!validGenders.includes(gender)){
            return res.render('add_new_donor', { error: 'Invalid gender entered' ,name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions},);
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('add_new_donor', { error: 'Contact number must be 10 digits long' ,name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions},);
        }
        if (!validBloodGroups.includes(blood_group)) {
            return res.render('add_new_donor', { error: 'Invalid blood group entered.' ,name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions});
        }
        if( units_donated <= 0) {
            return res.render('add_new_donor', { error: 'Units donated must be greater than 0.' ,name,age,gender,contact,address,blood_group,units_donated,disease_status,chronic_conditions,medications,ongoing_conditions});
        }
        await dbtable.query('INSERT INTO Donor (name, age, gender, contact, address, blood_group, units_donated,disease_status,chronic_conditions,medications,ongoing_conditions) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?)', 
                      [name, age, gender, contact, address, blood_group, units_donated,disease_status,chronic_conditions,medications,ongoing_conditions]);
       
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
};

const readdonors =  async (req, res) => {
    try {
        const bloodGroup = req.query.blood_group;
        const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

        let query = 'SELECT * FROM Donor';
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
        res.render("read_donors", {
            donorData: rows,
            blood_group: bloodGroup || '',
            error: errorMessage
        });

    } catch (error) {
        console.error(error);
        res.send('Error loading donors page');
    }
};

const deletedonor = async (req,res)=>
    {   
        try {
            await dbtable.query('DELETE FROM donor_logtable WHERE donor_id = ?', [req.params.donor_id]);
            await dbtable.query('DELETE FROM Donor WHERE donor_id = ?', [req.params.donor_id]);
            res.redirect('/readdonors');
        } catch (error) {
            console.error(error);
            
            res.status(500).send('Error deleting donor');
        }
};

const updatedonor = async (req,res)=>{
    try {
        const donorId = parseInt(req.params.donor_id);
        const {name,age,gender,contact,address,blood_group,units_donated}=req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];
        const donor = { donor_id: donorId, name, age, gender, contact, address, blood_group, units_donated };
         // Validation check
         if (age < 18 || age > 65) {
            return res.render('edit_donor', { error: 'Age of donor must lie between 18 and 65', donor });
        }
        if(!validGenders.includes(gender)){
            return res.render('edit_donor', { error: 'Invalid gender entered' ,donor},);
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('edit_donor', { error: 'Contact number must be 10 digits long' ,donor},);
        }
        if (!validBloodGroups.includes(blood_group)) {
            return res.render('edit_donor', { error: 'Invalid blood group entered.', donor });
        }

        if (units_donated <= 0) {
            return res.render('edit_donor', { error: 'Units donated must be greater than 0.', donor });
        }

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
};
const editdonor = async (req,res)=>{
    try {
        const donorId = parseInt(req.params.donor_id);
        const [rows] = await dbtable.query('SELECT * FROM Donor WHERE donor_id = ?', [donorId]);
        res.render('edit_donor', { donor: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error while fetching donor details');
    }
};

const donorlogtable =  async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT l.entry_id, l.donor_id, d.name, l.units_donated, l.date_of_donation FROM donor_logtable l JOIN Donor d ON l.donor_id = d.donor_id');
        res.render('donor_log_table', { logtableData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading donor log table page');
    }
};
const deletedonorlog =  async (req, res) => {
    const entry_id = req.params.entry_id;
    try {
        await dbtable.query('DELETE FROM donor_logtable WHERE entry_id = ?', [entry_id]);
        res.redirect('/donorlogtable');
    } catch (error) {
        console.error(error);
        res.send('Error deleting log entry');
    }
};
const donationhistory =  async (req, res) => {
    const donorId = req.params.donor_id;
    const [donorRows] = await dbtable.query('SELECT * from Donor where donor_id=?',[donorId]); // fetch from Donor table
    const [donorLogs] = await dbtable.query('SELECT * from donor_logtable where donor_id=?',[donorId]); // fetch from Donor_logtable
    const donor = donorRows[0];
    res.render('donation_history', { donor, donorLogs });
};

const adddonation =  async (req, res) => {
    const { units, date } = req.body;
    const donorId = req.params.donor_id;

    const [donorRows] = await dbtable.query('SELECT * from Donor where donor_id=?', [donorId]);
    const [donorLogs] = await dbtable.query('SELECT * from donor_logtable where donor_id=?', [donorId]);
    const donor = donorRows[0];

    if (units <= 0) {
        return res.render('donation_history', {
            error: 'Number of units donated must be greater than 0',
            donor,
            donorLogs
        });
    }
    try {
        await dbtable.query('CALL add_donation_entry(?, ?, ?)', [donorId, units, date]);
        res.redirect(`/donationhistory/${donorId}`);
    } catch (err) {
        return res.render('donation_history', {
            error: err.sqlMessage || 'An error occurred',
            donor,
            donorLogs
        });
    }
};

const medicalhistory = async (req, res) => {
    const donorId = req.params.donor_id;
    const [donorRows] = await dbtable.query('SELECT * from Donor where donor_id=?',[donorId]); // fetch from Donor table
    const donor = donorRows[0];
    res.render('medical_history', { donor});
};
module.exports={addnewdonor,addnewdonor_post,readdonors,deletedonor,updatedonor,editdonor,donorlogtable,deletedonorlog,donationhistory,adddonation,medicalhistory};