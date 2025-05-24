# Communication_LTD_Vulnerable

This project is a vulnerable web application developed for educational purposes, focusing on security training and testing.

## Project Structure

```
Communication_LTD_Vulnerable/
├── backend/
│   └── ... (backend-related files)
├── frontend/
│   └── ... (frontend-related files)
├── .gitignore
└── README.md
```


---

## 🛠️ Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or newer)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

---

## Getting Started

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/dorby55/Communication_LTD_Vulnerable.git
cd Communication_LTD_Vulnerable
```

### 2. Set Up the Backend
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Configure the .env File
Create a .env file:

```bash
New-Item -Path . -Name ".env" -ItemType "File"
```
Edit the .env file using a text editor of your choice and provide your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=communication_ltd
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
EMAIL_FROM="Communication LTD <your_email_user>"
PORT=5000
```

### 4. Create and Initialize the MySQL Database
#### Option A: Using the Terminal (if mysql is available)
Make sure MySQL is running, then run this inside the backend/ folder:

```bash
Get-Content .\schema.sql | mysql -u your_mysql_username -p
```
Replace your_mysql_username with your MySQL username (e.g., root). You will be prompted for your password.

#### Option B: Using MySQL Workbench (GUI Method)
If the terminal command doesn’t work, you can import the schema manually:

Open MySQL Workbench

Click on your existing MySQL connection (e.g., Local instance MySQL)

Go to File → Open SQL Script…

Select the schema.sql file in the backend folder

Click the lightning bolt icon (⚡) to run the script (or press Ctrl + Shift + Enter)

Refresh the Schemas panel on the left — you should now see a schema called communication_ltd_vulnerable

### 5. Start the Backend Server
Run the server:

```bash
npm start
```
The backend should now be running at http://localhost:5000.

### 6. Set Up the Frontend
Open a new terminal window or tab, navigate to the location where you cloned the project(path/Communication_LTD_Vulnerabley). then run:

```bash
cd frontend\communication-ltd-frontend
npm install
npm start
```
The frontend should now be running at http://localhost:3000 or another available port.

### Testing the Application
Once both frontend and backend servers are running, open your browser and go to: http://localhost:3000 ,
You can now interact with the app and test its functionality. Remember, this app is intentionally vulnerable for educational purposes.
