"use client"; // This tells Next.js it's a client-side component

import { useState, useEffect } from 'react';
// Corrected import path assuming utils is at the root
import { supabase } from '../utils/supabaseClient'; 
import { 
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, 
  Tooltip, Legend, Line 
} from 'recharts'; // Import chart components

export default function Home() {
  // State to hold our sensor data
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data from Supabase
  async function fetchData() {
    setLoading(true);
    
    // Fetch the last 100 rows, ordered by creation time
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching data:', error);
    } else if (data) {
      // Format the data for the chart and table
      const formattedData = data.map(item => ({
        ...item,
        // Format the timestamp to be readable
        time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      })).reverse(); // Reverse to show oldest-to-newest on the chart
      
      setSensorData(formattedData);
    }
    setLoading(false);
  }

  // Fetch data on component load and set up a 5-second auto-refresh
  useEffect(() => {
    fetchData(); // Fetch initial data
    
    // Set up an interval to poll for new data every 5 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // 5000ms = 5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#fff', background: '#222', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>SensoGuard Real-Time Dashboard</h1>

      {loading && sensorData.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Loading initial data...</p>
      ) : sensorData.length === 0 ? (
         <p style={{ textAlign: 'center' }}>No sensor data yet. Make sure your ESP8266 is running and sending data.</p>
      ) : (
        <>
          {/* --- The Chart --- */}
          <div style={{ width: '100%', height: '400px', marginBottom: '40px' }}>
            <h2 style={{ borderBottom: '1px solid #555', paddingBottom: '10px' }}>Real-Time Gyroscope & Weight</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="time" stroke="#999" />
                <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Gyro (deg/s)', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Weight (g)', angle: 90, position: 'insideRight', fill: '#82ca9d' }} />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} itemStyle={{ color: '#fff' }}/>
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="gyro_x" name="Gyro X" stroke="#8884d8" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="gyro_y" name="Gyro Y" stroke="#ca82c2" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="gyro_z" name="Gyro Z" stroke="#ffc658" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="weight_g" name="Weight" stroke="#82ca9d" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* --- The Table --- */}
          <div>
            <h2 style={{ borderBottom: '1px solid #555', paddingBottom: '10px' }}>Raw Data Log (Newest First)</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#333' }}>
                  <tr>
                    <th style={tableHeaderStyle}>Time</th>
                    <th style={tableHeaderStyle}>Weight (g)</th>
                    <th style={tableHeaderStyle}>Gyro X</th>
                    <th style={tableHeaderStyle}>Gyro Y</th>
                    <th style={tableHeaderStyle}>Gyro Z</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show newest first in table without reversing the original data */}
                  {sensorData.slice().reverse().map((item) => ( 
                    <tr key={item.id} style={{ borderBottom: '1px solid #444' }}>
                      <td style={tableCellStyle}>{item.time}</td>
                      <td style={tableCellStyle}>{item.weight_g.toFixed(1)}</td>
                      <td style={tableCellStyle}>{item.gyro_x.toFixed(2)}</td>
                      <td style={tableCellStyle}>{item.gyro_y.toFixed(2)}</td>
                      <td style={tableCellStyle}>{item.gyro_z.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Inline Styles for the Table ---
const tableHeaderStyle = {
  padding: '10px',
  borderBottom: '2px solid #555',
  textAlign: 'left',
};

const tableCellStyle = {
  padding: '8px 10px',
  borderBottom: '1px solid #444',
};

