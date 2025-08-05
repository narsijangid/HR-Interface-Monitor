# HR Interface Monitoring Dashboard

A comprehensive web-based interface monitoring dashboard for HR integrations, built with MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### 🏠 Homepage Dashboard
- **Summary Metrics**: Success rate, total executions, failed runs, and running processes
- **Visual Trends**: Real-time charts showing interface execution patterns
- **Status Distribution**: Pie chart visualization of success/failure rates
- **Interface Health**: Overview of all HR integration interfaces with health indicators
- **Recent Failures**: Quick view of the latest failed integrations

### 📊 Live Interface Logs
- **Comprehensive Table**: Display all interface logs with key information
- **Advanced Filtering**: Filter by interface name, integration key, status, severity, date range
- **Search Functionality**: Global search across all log fields
- **Pagination**: Efficient handling of large datasets (500k+ records)
- **Real-time Updates**: Auto-refresh capabilities

### ⏰ Time-based Filtering
- **Quick Periods**: Last Hour, 24 Hours, Week, Month
- **Custom Date Range**: Select specific start and end dates
- **Performance Optimized**: Efficient queries for large datasets

## Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **React Router** for navigation
- **Recharts** for interactive charts and visualizations
- **Lucide React** for consistent icons
- **Date-fns** for date manipulation
- **CSS3** for responsive styling

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting
- **Performance**: Pagination, indexing, aggregation queries
- **Error Handling**: Comprehensive error management

## Project Structure

```
HR/
├── Backend/
│   ├── models/
│   │   └── InterfaceLog.js
│   ├── routes/
│   │   ├── logs.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── seedData.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Logs.jsx
│   │   │   ├── Header.jsx
│   │   │   └── *.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env` file (already configured with MongoDB URI)
   - Update MongoDB connection string if needed

4. **Seed database** (optional - generates 500k test records):
   ```bash
   npm run seed
   ```

5. **Start backend server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   - Update `.env` file with correct API URL if needed

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   - Navigate to `http://localhost:5173`

## API Endpoints

### Dashboard Endpoints
- `GET /api/dashboard/summary` - Summary metrics for dashboard
- `GET /api/dashboard/trends` - Trend data for charts
- `GET /api/dashboard/interfaces` - Interface health overview

### Logs Endpoints
- `GET /api/logs` - Get all logs with pagination and filtering
- `GET /api/logs/:id` - Get specific log by ID
- `POST /api/logs` - Create new log entry
- `PUT /api/logs/:id` - Update log entry
- `DELETE /api/logs/:id` - Delete log entry
- `GET /api/logs/filters/values` - Get unique values for filters

## Performance Features

- **Database Indexing**: Optimized indexes for 500k+ records
- **Pagination**: 50 records per page with efficient cursor-based pagination
- **Aggregation Pipelines**: MongoDB aggregations for complex queries
- **Caching**: Frontend caching for better UX
- **Responsive Design**: Mobile-first responsive design
- **Lazy Loading**: Efficient data loading strategies

## Security Features

- **Rate Limiting**: 1000 requests per 15-minute window
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive validation on all endpoints
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## Usage

### Dashboard View
1. **Navigate to home** (`/`) for dashboard overview
2. **Select time period** using buttons (1h, 24h, 7d, 30d)
3. **View metrics** and charts in real-time
4. **Monitor interface health** across all integrations

### Logs View
1. **Navigate to logs** (`/logs`) for detailed log view
2. **Use filters** to narrow down results:
   - Interface name dropdown
   - Status and severity filters
   - Date range picker
   - Global search
3. **Navigate pages** using pagination controls
4. **Export data** (future enhancement)

## Development

### Adding New Features
1. **Backend**: Add new routes in `routes/` directory
2. **Frontend**: Create new components in `components/` directory
3. **Styling**: Use CSS modules or styled-components
4. **Testing**: Add unit tests for critical functions

### Database Schema
The InterfaceLog model includes:
- Interface identification (name, key)
- Execution details (status, message, duration)
- Metadata (source/target systems, job ID)
- Timestamps and performance metrics

## Troubleshooting

### Common Issues
1. **Connection errors**: Check MongoDB connection string
2. **CORS issues**: Verify CORS configuration in backend
3. **Port conflicts**: Ensure ports 5000 and 5173 are available
4. **Missing data**: Run seed script to populate test data

### Performance Tips
- Use database indexes for large datasets
- Implement pagination for list views
- Cache frequently accessed data
- Monitor API response times

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

This project is created for the HR Interface Monitoring Challenge.

## Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Test with provided seed data
- Monitor browser console for errors