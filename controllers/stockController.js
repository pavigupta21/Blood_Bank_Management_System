const dbtable = require('../models/dbModel');


const incstock =  async (req, res) => {
    try {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        res.render('inc_stock', { bloodData: rows });
    } catch (error) {
        console.error(error);
        res.send('Error loading stock page');
    }
};
const incstock_post =  async (req, res) => {
    const { blood_group, units } = req.body;
    const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group)) {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        return res.render('inc_stock', { error: 'Invalid blood group entered', bloodData: rows,blood_group, units });
    }
    if (units <= 0) {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        return res.render('inc_stock', { error: 'units donated must be greater than 0', bloodData: rows,blood_group, units });
    }
    try {
        await dbtable.query('UPDATE BloodGroup SET units = units + ? WHERE blood_group = ?', [units, blood_group]);
        res.redirect('/incstock');
    } catch (error) {
        console.error(error);
        res.send('Error updating stock');
    }
};
const decstock =  async (req, res) => {
    const errorMessage = req.query.error;
    try {
        const [rows] = await dbtable.query('SELECT * FROM BloodGroup');
        res.render('dec_stock', { bloodData: rows, errorMessage });
    } catch (error) {
        console.error(error);
        res.send('Error loading stock page');
    }
};
const decstock_post =  async (req, res) => {
    const { blood_group, units } = req.body;
    const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group)) {
        return res.redirect('/decstock?error=Invalid blood group entered');
    }
    if (units<=0) {
        return res.redirect('/decstock?error=Units must be greater than 0');
    }

    try {
        await dbtable.query('CALL update_blood_stock(?, ?)', [blood_group, units]);
        res.redirect('/decstock');
    } catch (error) {
        console.error("Error in procedure:", error);
        return res.redirect('/decstock?error=Not enough stock available!');
    }
};

module.exports={incstock,incstock_post,decstock,decstock_post};