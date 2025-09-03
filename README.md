# Hargeisa Vibes - Travel & Tourism Platform

A modern travel and tourism platform for Hargeisa, Somaliland, built with React, TypeScript, and MySQL.

## 🏗️ **Architecture**

This project now uses a **client-server architecture**:

- **Frontend**: React + TypeScript + Vite (runs on port 8080)
- **Backend**: Node.js + Express + MySQL (runs on port 3001)
- **Database**: MySQL with comprehensive schema

## 🚀 **Quick Start**

### **Prerequisites**
1. **Node.js** (v16 or higher)
2. **MySQL Server** (v8.0 or higher)
3. **Git**

### **1. Clone and Setup**
```bash
git clone <your-repo-url>
cd hargeisa-vibes-explore-main
```

### **2. Setup Database**
```bash
# Connect to MySQL as root
mysql -u root -p

# Create database and user
CREATE DATABASE bbx1ftpsp8wy1mhy1m9c;
CREATE USER 'hargeisa_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bbx1ftpsp8wy1mhy1m9c.* TO 'hargeisa_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u hargeisa_user -p bbx1ftpsp8wy1mhy1m9c < database-schema.sql
```

### **3. Setup Backend**
```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your database credentials
# Update DB_USER, DB_PASSWORD, etc.

# Start backend server
npm run dev
```

### **4. Setup Frontend**
```bash
# In the root directory
npm install

# Start frontend
npm run dev
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📁 **Project Structure**

```
hargeisa-vibes-explore-main/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API services
│   └── ...
├── server/                 # Backend Node.js server
│   ├── server.js          # Main Express server
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment template
├── database-schema.sql     # MySQL database schema
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🔧 **Configuration**

### **Backend Environment Variables**
Create `server/.env` file:
```env
DB_HOST=localhost
DB_USER=hargeisa_user
DB_PASSWORD=your_secure_password
DB_NAME=bbx1ftpsp8wy1mhy1m9c
DB_PORT=3306
PORT=3001
NODE_ENV=development
```

### **Frontend API Configuration**
The frontend automatically connects to `http://localhost:3001/api`. Update `src/lib/database.ts` if you change the backend URL.

## 🗄️ **Database Features**

- **Services**: Hotels, activities, car rentals, etc.
- **Deals**: Special offers and discounts
- **Users**: Customer and admin management
- **Bookings**: Reservation system
- **Reviews**: Rating and feedback system
- **Analytics**: Event tracking and reporting

## 🚀 **Development Commands**

### **Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Backend**
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
```

## 🔍 **Troubleshooting**

### **"API connection failed"**
- Ensure backend server is running on port 3001
- Check `server/.env` configuration
- Verify MySQL service is running

### **"Database connection failed"**
- Check MySQL credentials in `server/.env`
- Ensure database `bbx1ftpsp8wy1mhy1m9c` exists
- Verify user permissions

### **Port conflicts**
- Frontend: Change port in `vite.config.ts`
- Backend: Change `PORT` in `server/.env`

## 📱 **Features**

- **Admin Panel**: Full CRUD operations for services, deals, users
- **Booking System**: Customer reservations and payment tracking
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Built with Shadcn UI components
- **Type Safety**: Full TypeScript implementation

## 🔐 **Security Notes**

- Never commit `.env` files to version control
- Use strong passwords for database users
- Implement proper authentication in production
- Use HTTPS in production environments

## 📞 **Support**

For issues or questions:
1. Check the console logs for error messages
2. Verify database connectivity
3. Ensure both frontend and backend are running
4. Review the database setup guide in `database-setup.md`

## 📄 **License**

This project is licensed under the MIT License.
