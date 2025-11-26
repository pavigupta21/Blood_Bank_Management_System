const dbtable = require('../models/dbModel');
//const { io } = require('../app'); // Adjust the path as needed
const { getIO } = require('../socket');
const io = getIO();


const DonationOffer =  (req, res) => {
    const user_id = req.params.user_id;
    res.render("offer_donation",{user_id});
};

const Post_DonationOffer = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            return res.render('offer_donation', { error: 'User not logged in. Please log in again.' });
        }
        const { name,age,gender,contact,address,blood_group,disease_status,chronic_conditions,medications,ongoing_conditions,previous_donation } = req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];

        // Validation check
        if (age < 18 || age>65) {
            return res.render('offer_donation', { error: 'Age of donor must lie between 18 and 65' ,user_id,name,age,gender,contact,address,blood_group,disease_status,chronic_conditions,medications,ongoing_conditions,previous_donation});
        }
        if(!validGenders.includes(gender)){
            return res.render('offer_donation', { error: 'Invalid gender entered' ,user_id,name,age,gender,contact,address,blood_group,disease_status,chronic_conditions,medications,ongoing_conditions,previous_donation});
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('offer_donation', { error: 'Contact number must be 10 digits long' ,user_id,name,age,gender,contact,address,blood_group,disease_status,chronic_conditions,medications,ongoing_conditions,previous_donation});
        }
        if (!validBloodGroups.includes(blood_group)) {
            return res.render('offer_donation', { error: 'Invalid blood group entered.' ,user_id,name,age,gender,contact,address,blood_group,disease_status,chronic_conditions,medications,ongoing_conditions,previous_donation});
        }
    const [result] = await dbtable.query(
  "INSERT INTO Notifications (user_id, type, message, status, created_at) VALUES (?, 'donation', ?, 'pending', NOW())", 
  [user_id, JSON.stringify(req.body)]
);
const insertedId = result.insertId;
const [rows] = await dbtable.query(
  "SELECT * FROM Notifications WHERE notification_id = ?", 
  [insertedId]
);

const newNotification = rows[0];


    
//Emit to admin room
io.to('adminRoom').emit('newNotification', newNotification);
io.to(`user_${user_id}`).emit('newNotification');

 // res.redirect('/userhome/notify',{user_id});
 res.redirect(`/userhome/notify/${user_id}`);
    } catch (error) {
        console.error(error);
        res.render('offer_donation', { error: 'Error posting donation offer.' ,user_id});
    }
};

const TransfusionRequest = (req,res)=>{
    const user_id = req.params.user_id;
    const errorMessage = req.query.error;
    res.render("request_transfusion",{errorMessage,user_id});
}
const Post_TransfusionRequest = async (req, res) => {
   
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            return res.render('request_transfusion', { error: 'User not logged in. Please log in again.' });
        }
        const {name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required} = req.body;
        const validBloodGroups = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
        const validGenders=['M','F','other'];
        // Validation check
        if(age<0)
        {
            return res.render('request_transfusion', { errorMessage: 'Invalid age entered' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required,user_id});
        }
        if(!validGenders.includes(gender)){
            return res.render('request_transfusion', { errorMessage: 'Invalid gender entered' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required,user_id});
        }
        if(!/^\d{10}$/.test(contact)){
            return res.render('request_transfusion', { errorMessage: 'Contact number must be 10 digits long' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required,user_id});
        }
        if (!validBloodGroups.includes(blood_group)) {
            return res.render('request_transfusion', { errorMessage: 'Invalid blood group entered.',name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required,user_id });
        }
        if( units_required <= 0) {
            return res.render('request_transfusion', { errorMessage: 'Units required to be transfused must be greater than 0.' ,name,age,gender,contact,hospital_name,hospital_address,blood_group,units_required,user_id});
        }
        const [result] = await dbtable.query(
        "INSERT INTO Notifications (user_id, type, message, status, created_at) VALUES (?, 'transfusion', ?, 'pending', NOW())", 
        [user_id, JSON.stringify(req.body)]
        );
        const insertedId = result.insertId;
        const [rows] = await dbtable.query(
        "SELECT * FROM Notifications WHERE notification_id = ?", 
        [insertedId]
        );

        const newNotification = rows[0];
    
        //Emit to admin room
        io.to('adminRoom').emit('newNotification', newNotification);
     io.to(`user_${user_id}`).emit('newNotification');
 res.redirect(`/userhome/notify/${user_id}`);
    } catch (error) {
        console.error(error);
        res.render('request_transfusion', { errorMessage: 'Error posting transfusion request.',user_id });
    }
};

// const userNotify=async(req,res)=>{
//     const user_id=req.params.user_id;
//     res.render('user_notification',{user_id});
// }
const userNotify = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [rows] = await dbtable.query("SELECT * FROM Notifications WHERE user_id = ?", [user_id]);
    res.render('user_notification', { user_id, notifications: rows });
  } catch (err) {
    console.error(err);
    res.render('user_notification', { user_id, notifications: [], error: 'Failed to load notifications' });
  }
};
const adminNotify=async(req,res)=>{
  try {
    const [rows] = await dbtable.query("SELECT * FROM Notifications ");
    res.render('admin_notification', {notifications: rows });
  } catch (err) {
    console.error(err);
    res.render('admin_notification', {notifications: [], error: 'Failed to load notifications' });
  }
}

// const updateStatus = async(req,res)=>{
//     const notification_id = req.params.notification_id;
//     const {status} = req.body;
//     try{
//         await dbtable.query("UPDATE Notifications SET status = ? WHERE notification_id = ?", [status, notification_id]);
//         res.redirect('/home/notify');
//     }

//     catch(err){
//         console.error(err);
//         res.status(500).send('Error updating notification status');
//     }
// }
const updateStatus = async (req, res) => {
  const notification_id = req.params.notification_id;
  const { status } = req.body;

  try {
    await dbtable.query(
      "UPDATE Notifications SET status = ? WHERE notification_id = ?",
      [status, notification_id]
    );

    const [rows] = await dbtable.query(
      "SELECT * FROM Notifications WHERE notification_id = ?",
      [notification_id]
    );

    const updatedNotification = rows[0];

    // ✅ Emit realtime status update
    const io = getIO();
    io.to('adminRoom').emit('statusUpdated', updatedNotification);
    io.to(`user_${updatedNotification.user_id}`).emit('statusUpdated', updatedNotification);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating notification status' });
  }
};

module.exports = {DonationOffer, Post_DonationOffer,TransfusionRequest, Post_TransfusionRequest,userNotify, adminNotify,updateStatus};