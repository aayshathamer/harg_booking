# Database Setup Guide for Hargeisa Vibes

## 🗄️ **Database Requirements**

Your application now requires a **MySQL database** to function properly. The mock database has been removed.

## 📋 **Prerequisites**

1. **MySQL Server** installed and running
2. **Database** created with the schema from `database-schema.sql`
3. **User** with proper permissions

## 🚀 **Quick Setup Steps**

### 1. **Install MySQL Server**
- **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt install mysql-server`

### 2. **Start MySQL Service**
```bash
# Windows (as Administrator)
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 3. **Create Database and User**
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE bbx1ftpsp8wy1mhy1m9c;

-- Create user (replace with your preferred credentials)
CREATE USER 'hargeisa_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON bbx1ftpsp8wy1mhy1m9c.* TO 'hargeisa_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 4. **Import Schema**
```bash
mysql -u hargeisa_user -p bbx1ftpsp8wy1mhy1m9c < database-schema.sql
```

### 5. **Update Configuration**
Edit `src/lib/database.ts` and update the `dbConfig`:

```typescript
export const dbConfig: DatabaseConfig = {
  host: 'localhost',
  user: 'hargeisa_user',           // Your MySQL username
  password: 'your_secure_password', // Your MySQL password
  database: 'bbx1ftpsp8wy1mhy1m9c',      // Database name
  port: 3306
};
```

## 🔧 **Alternative: Use Existing Database**

If you already have a MySQL database:

1. **Update the `dbConfig`** in `src/lib/database.ts`
2. **Run the schema** from `database-schema.sql` on your existing database
3. **Ensure your user has proper permissions**

## 🧪 **Test Connection**

1. **Start your application**: `npm run dev`
2. **Check console** for "Database connection initialized successfully"
3. **Try creating a service** in the admin panel

## ❌ **Common Issues**

### **"Access denied for user"**
- Check username/password in `dbConfig`
- Ensure user has proper permissions
- Verify MySQL service is running

### **"Connection refused"**
- MySQL service not running
- Wrong port number
- Firewall blocking connection

### **"Unknown database"**
- Database doesn't exist
- Run `database-schema.sql` first

## 📱 **Development vs Production**

- **Development**: Use local MySQL instance
- **Production**: Use cloud database (AWS RDS, Google Cloud SQL, etc.)
- **Environment Variables**: Store credentials in `.env` file for production

## 🔐 **Security Notes**

- **Never commit** database credentials to version control
- **Use strong passwords** for database users
- **Limit permissions** to only what's needed
- **Use environment variables** for production deployments

## 📞 **Need Help?**

1. Check MySQL error logs
2. Verify network connectivity
3. Test connection with MySQL client
4. Review MySQL documentation
