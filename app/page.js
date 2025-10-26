'use client'; // Required for Supabase client-side interaction

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Import our client
// Correctly import only the necessary components from recharts
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
// For the table, we'll use basic HTML table elements styled inline

// Helper to format timestamp
const formatTimestamp = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); 
  } catch (error) {
    console.error("Error formatting timestamp:", error, "Input:", isoString);
    return 'Error';
  }
};


export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from Supabase
  const fetchData = async () => {
    // Ensure supabase client is initialized before fetching
    if (!supabase) {
        setError("Supabase client not initialized. Check environment variables.");
        setLoading(false);
        return;
    }
      
    setLoading(true); // Set loading true at the start of fetch
    try {
      const { data: sensorData, error: fetchError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('id', { ascending: false }) 
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }
      
      const formattedData = sensorData.map(item => ({
        ...item,
        timestamp: formatTimestamp(item.created_at) 
      }));

      setData(formattedData);
      setError(null); 
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and set up real-time listener
  useEffect(() => {
    // Ensure supabase client is initialized before setting up listener
    if (!supabase) {
        setError("Supabase client not initialized. Cannot set up real-time listener.");
        setLoading(false);
        return;
    }
      
    fetchData(); // Initial fetch

    const channel = supabase
      .channel('sensor_data_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
        console.log('New data received:', payload.new);
        setData((currentData) => {
           const newDataPoint = {
             ...payload.new,
             timestamp: formatTimestamp(payload.new.created_at) 
           };
           const updatedData = [newDataPoint, ...currentData].slice(0, 100); 
           return updatedData;
        });
      })
      .subscribe((status, err) => { // Added error handling for subscribe
          if (err) {
              console.error("Supabase subscription error:", err);
              setError("Real-time connection failed.");
          } else {
              console.log("Supabase subscription status:", status);
          }
      });

    return () => {
      if (supabase && channel) { // Ensure channel exists before removing
         supabase.removeChannel(channel);
      }
    };
  }, []); 

  // --- Render the UI ---
  if (loading && data.length === 0) { // Show loading only on initial load
    return <div style={styles.container}>Loading sensor data...</div>;
  }

  if (error) {
    return <div style={styles.container}>Error: {error}</div>;
  }

  if (data.length === 0 && !loading) { // Show no data message only if not loading
    return <div style={styles.container}>No sensor data yet. Make sure your ESP8266 is running and sending data.</div>;
  }

   const chartData = [...data].reverse().map(d => ({ 
    timestamp: d.timestamp || 'N/A', 
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
            <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="#8884d8" dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="GyroX" stroke="#82ca9d" dot={false} isAnimationActive={false}/>
            <Line yAxisId="right" type="monotone" dataKey="GyroY" stroke="#ffc658" dot={false} isAnimationActive={false}/>
            <Line yAxisId="right" type="monotone" dataKey="GyroZ" stroke="#ff7300" dot={false} isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- Data Table --- */}
      <div style={styles.tableContainer}>
        <h2 style={styles.subHeader}>Recent Readings</h2>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>Timestamp</th>
              <th style={styles.tableHeaderCell}>Weight (g)</th>
              <th style={styles.tableHeaderCell}>Gyro X</th>
              <th style={styles.tableHeaderCell}>Gyro Y</th>
              <th style={styles.tableHeaderCell}>Gyro Z</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row) => ( 
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{row.timestamp}</td>
                <td style={styles.tableCell}>{row.weight_g?.toFixed(1)}</td>
                <td style={styles.tableCell}>{row.gyro_x?.toFixed(1)}</td>
                <td style={styles.tableCell}>{row.gyro_y?.toFixed(1)}</td>
                <td style={styles.tableCell}>{row.gyro_z?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Basic Inline Styles
const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#222', 
    color: '#eee', 
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
    margin: '0 auto', 
  },
  tableHeaderRow: {
    backgroundColor: '#333',
    borderBottom: '1px solid #555',
  },
   tableHeaderCell: {
    padding: '8px 12px',
    textAlign: 'left',
    color: '#eee',
    fontWeight: 'bold', 
  },
  tableRow: {
     borderBottom: '1px solid #444',
  },
  tableCell: {
    padding: '8px 12px',
    color: '#ccc',
  },
};

