
# 🩸 Blood Bank Management System

## 📌 Overview

The **Blood Bank Management System** is a MySQL-based web application that manages blood donations, transfusions, and real-time blood stock availability. The system is designed with a strong **database-centric architecture**, ensuring consistency and reliability through **ER modeling, triggers, and stored procedures**.

The project was initially built using a structured ER diagram and later enhanced with a **real-time notification system** to support controlled donation and transfusion requests.

---

## 🗃️ Database Design (ER Model)

<img width="1125" height="594" alt="image" src="https://github.com/user-attachments/assets/1d17de0c-de1e-4ad6-ba7b-0d8c2e0c0854" />

The core system is based on the following entities:

* **Donor** – personal details, medical history, blood group
* **Patient** – patient details and hospital information
* **BloodGroupStock** – tracks available blood units by blood group
* **Donor_LogTable** – logs donation transactions
* **Patient_LogTable** – logs transfusion transactions

Blood stock is automatically updated based on donor and patient activity.

> ℹ️ *Note:* The ER diagram represents the initial database design. The notification feature was added later as an enhancement without altering the core relational structure.

---

## 🔄 Automated Stock Management

* Blood stock **increases** when a donation entry is recorded
* Blood stock **decreases** when a transfusion entry is recorded
* Implemented using **MySQL triggers and stored procedures**
* Prevents negative stock values and maintains referential integrity

---

## 🔔 Real-Time Notification System (Enhancement)

To improve workflow and control:

* **Donors** can send blood donation requests
* **Patients** can send blood transfusion requests
* **Blood Bank Admin** receives requests in a centralized dashboard
* Admin can **accept or reject** requests
* Real-time updates handled using **Socket.IO**

---

## 🔐 Authentication & Roles

* Separate **login and registration** for:

  * Donors
  * Patients
  * Blood Bank Admin
* Role-based dashboards and controlled access to actions

---

## 🛠️ Tech Stack

* **Frontend:** EJS (Embedded JavaScript)
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Real-Time Notifications:** Socket.IO
* **Core Concepts:** ER Modeling, Triggers, Stored Procedures, CRUD Operations

---

## 🖼️ Screenshots
# Donor/Patient and Admin Registration Page
<img width="2880" height="1711" alt="Screenshot (1017)" src="https://github.com/user-attachments/assets/64e53dc2-958c-4a6e-9103-e3ab72f23829" />

# Admin Dashboard
<img width="2880" height="1642" alt="Screenshot (1007)" src="https://github.com/user-attachments/assets/f98a7476-ab54-475b-88c7-ef041fb2ea26" />

# Donor and Patient Portal
<img width="2880" height="1627" alt="Screenshot (1003)" src="https://github.com/user-attachments/assets/eb3ad883-cd5a-4565-a1a2-0cf3bdd10c7b" />

# Donor Details Form
<img width="2880" height="1708" alt="Screenshot (1005)" src="https://github.com/user-attachments/assets/8cd598e3-e07d-407e-bbe1-de7d75305388" />

# Patient Details Form
<img width="2880" height="1708" alt="Screenshot (1015)" src="https://github.com/user-attachments/assets/eeae5414-4fd6-497e-a087-8c445dd625a3" />

# Donor Records
<img width="2880" height="1734" alt="Screenshot (1008)" src="https://github.com/user-attachments/assets/697662f0-9665-4579-b202-838a66ed4f6e" />

# Patient Records
<img width="2880" height="1714" alt="Screenshot (1012)" src="https://github.com/user-attachments/assets/ee50b984-7a15-4a8f-bf82-69d5253fab46" />

# Donor's Medical History
<img width="2880" height="1719" alt="Screenshot (1009)" src="https://github.com/user-attachments/assets/c2dde180-8140-4ac1-bfa4-6cf8b3f7a7a5" />

# Donor Log Table
<img width="2880" height="1719" alt="Screenshot (1014)" src="https://github.com/user-attachments/assets/a209f144-436c-4660-b4bd-30cca38bf6a8" />

# Patient Log Table
<img width="2880" height="1711" alt="Screenshot (1013)" src="https://github.com/user-attachments/assets/de661879-6bcd-4379-9966-763be797e668" />

# Manual Management of Blood Stock Levels
<img width="2880" height="1728" alt="Screenshot (1010)" src="https://github.com/user-attachments/assets/887bbb0f-7626-4c9e-87fe-64990f6eeebf" />
<img width="2880" height="1696" alt="Screenshot (1011)" src="https://github.com/user-attachments/assets/266cf05d-2c8d-45b5-a2d8-ae58c5ffd0b7" />


# Donor/Patient's Notification Dashboard
<img width="2856" height="1694" alt="Screenshot (1006)" src="https://github.com/user-attachments/assets/01b67ff0-6483-47eb-8b0f-6415e443bacb" />


# Blood Bank Admin's Notification Dashboard
<img width="2880" height="1722" alt="Screenshot (1016)" src="https://github.com/user-attachments/assets/8d4c9750-c5a6-4d2f-8c21-12b1abf00348" />









