const cookieParser = require('cookie-parser');
const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const donorRoutes = require('./routes/donorRoutes');
const patientRoutes = require('./routes/patientRoutes');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(authRoutes);
app.use(stockRoutes);
app.use(donorRoutes);
app.use(patientRoutes);


app.get('/', (req, res) => {
    res.render('index');
});


app.listen(4000);