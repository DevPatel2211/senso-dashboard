'use client'; // Required for Supabase client-side interaction

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Import our client
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'recharts'; // Correct import for Table components

// Helper to format timestamp
const formatTimestamp = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString(); // Format as HH:MM:SS AM/PM
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from Supabase
  const fetchData = async () => {
    try {
      // --- THE FIX IS HERE ---
      // Removed the .order('created_at', ...) part
      const { data: sensorData, error: fetchError } = await supabase
        .from('sensor_data')
        .select('*')
        .limit(100); // Get the latest 100 entries

      if (fetchError) {
        throw fetchError;
      }
      
      // Add a formatted timestamp for display
      const formattedData = sensorData.map(item => ({
        ...item,
        timestamp: formatTimestamp(item.created_at) // Keep formatting if column exists, handle null
      })).reverse(); // Reverse to show oldest first in chart/table if needed

      setData(formattedData);
      setError(null); // Clear previous errors
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and set up real-time listener
  useEffect(() => {
    fetchData(); // Initial fetch

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel('sensor_data_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
        console.log('New data received:', payload.new);
        // Add new data to the state, keeping the array size limited
        setData((currentData) => {
           const newDataPoint = {
             ...payload.new,
             timestamp: formatTimestamp(payload.new.created_at) // Format timestamp
           };
           // Add new point and keep only the latest 100 entries
           const updatedData = [newDataPoint, ...currentData].slice(0, 100); 
           return updatedData;
        });
      })
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Render the UI ---
  if (loading) {
    return <div style={styles.container}>Loading sensor data...</div>;
  }

  if (error) {
    return <div style={styles.container}>Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div style={styles.container}>No sensor data yet. Make sure your ESP8266 is running and sending data.</div>;
  }

  // Prepare data for the chart (ensure values are numbers)
   const chartData = data.map(d => ({
    timestamp: d.timestamp || 'N/A', // Use formatted time or 'N/A'
    Weight: parseFloat(d.weight_g) || 0,
    GyroX: parseFloat(d.gyro_x) || 0,
    GyroY: parseFloat(d.gyro_y) || 0,
    GyroZ: parseFloat(d.gyro_z) || 0,
  }));

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>SensoGuard Real-Time Dashboard</h1>

      {/* --- Line Chart --- */}
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="timestamp" stroke="#ccc" />
            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Gyro (°/s)', angle: -90, position: 'insideRight', fill: '#82ca9d' }} />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} itemStyle={{ color: '#eee' }} />
            <Legend wrapperStyle={{ color: '#ccc' }}/>
            <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="#8884d8" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="GyroX" stroke="#82ca9d" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="GyroY" stroke="#ffc658" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="GyroZ" stroke="#ff7300" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- Data Table --- */}
      <div style={styles.tableContainer}>
        <h2 style={styles.subHeader}>Recent Readings</h2>
         <Table style={{ width: '100%', borderCollapse: 'collapse' }}> {/* Basic table styling */}
          <TableHeader>
            <TableRow style={styles.tableHeaderRow}>
              <TableHead style={styles.tableHeaderCell}>Timestamp</TableHead>
              <TableHead style={styles.tableHeaderCell}>Weight (g)</TableHead>
              <TableHead style={styles.tableHeaderCell}>Gyro X</TableHead>
              <TableHead style={styles.tableHeaderCell}>Gyro Y</TableHead>
              <TableHead style={styles.tableHeaderCell}>Gyro Z</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((row) => ( // Show only latest 10 rows
              <TableRow key={row.id} style={styles.tableRow}>
                <TableCell style={styles.tableCell}>{row.timestamp}</TableCell>
                <TableCell style={styles.tableCell}>{row.weight_g?.toFixed(1)}</TableCell>
                <TableCell style={styles.tableCell}>{row.gyro_x?.toFixed(1)}</TableCell>
                <TableCell style={styles.tableCell}>{row.gyro_y?.toFixed(1)}</TableCell>
                <TableCell style={styles.tableCell}>{row.gyro_z?.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Basic Inline Styles (can be moved to a CSS file)
const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#222', // Dark background
    color: '#eee', // Light text
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#eee',
  },
  subHeader: {
    marginTop: '30px',
    marginBottom: '10px',
    color: '#ccc',
  },
  chartContainer: {
    marginBottom: '40px',
  },
   tableContainer: {
    maxWidth: '800px',
    margin: '0 auto', // Center the table
  },
  tableHeaderRow: {
    backgroundColor: '#333',
    borderBottom: '1px solid #555',
  },
   tableHeaderCell: {
    padding: '8px 12px',
    textAlign: 'left',
    color: '#eee',
  },
  tableRow: {
     borderBottom: '1px solid #444',
  },
  tableCell: {
    padding: '8px 12px',
    color: '#ccc',
  },
};