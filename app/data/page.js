'use client'; // Required for Supabase client-side interaction

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Note the '../../'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './page.module.css'; // Import the data page styles

export default function DataPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from Supabase
  const fetchData = async () => {
    try {
      const { data: sensorData, error: fetchError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('id', { ascending: false }) // Order by ID
        .limit(50); // Get the latest 50 entries

      if (fetchError) {
        throw fetchError;
      }

      setData(sensorData.reverse());
      setError(null);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and set up real-time listener
  useEffect(() => {
    fetchData(); // Initial fetch

    const channel = supabase
      .channel('sensor_data_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
        console.log('New data received:', payload.new);
        setData((currentData) => {
          const newDataPoint = { ...payload.new };
          const updatedData = [...currentData, newDataPoint].slice(-50);
          return updatedData;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className={styles.container}>Loading sensor data...</div>;
  }

  if (error) {
    return <div className={styles.container} style={{ color: '#EF4444' }}>Error: {error}</div>;
  }

  // Prepare data for the chart
  const chartData = data.map(d => ({
    timestamp: d.id, // Use ID as the timestamp
    Weight: parseFloat(d.weight_g) || 0,
    GyroX: parseFloat(d.gyro_x) || 0,
    GyroY: parseFloat(d.gyro_y) || 0,
    GyroZ: parseFloat(d.gyro_z) || 0,
    Temperature: parseFloat(d.temperature_c) || 0,
    IR_Value: parseInt(d.ir_value) || 0 // <-- ADDED IR_VALUE
  }));

  // --- Style definitions for charts (hardcoded hex values) ---
  const axisColor = "#9CA3AF"; // --text-secondary
  const gridColor = "#4B5563"; // --border-color
  const tooltipBackground = "#111827"; // --background-dark
  const tooltipText = "#F9FAFB"; // --text-primary

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Real-Time Data Dashboard</h1>

      <div className={styles.chartGrid}>

        {/* --- Individual Chart: Weight --- */}
        <div className={styles.chartBox}>
          <h2>Weight Over Time</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={axisColor} fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize="12px" label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', fill: axisColor, dx: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBackground, border: `1px solid ${gridColor}` }} itemStyle={{ color: tooltipText }} />
              <Legend />
              <Line type="monotone" dataKey="Weight" stroke="#3B82F6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Chart: Temperature --- */}
        <div className={styles.chartBox}>
          <h2>Temperature Over Time</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={axisColor} fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize="12px" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: axisColor, dx: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBackground, border: `1px solid ${gridColor}` }} itemStyle={{ color: tooltipText }} />
              <Legend />
              <Line type="monotone" dataKey="Temperature" stroke="#EF4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Individual Chart: Gyroscope --- */}
        <div className={styles.chartBox}>
          <h2>Gyroscope Over Time</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={axisColor} fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize="12px" label={{ value: 'Gyro (°/s)', angle: -90, position: 'insideLeft', fill: axisColor, dx: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBackground, border: `1px solid ${gridColor}` }} itemStyle={{ color: tooltipText }} />
              <Legend />
              <Line type="monotone" dataKey="GyroX" stroke="#10B981" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="GyroY" stroke="#F59E0B" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="GyroZ" stroke="#ff7300" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- NEW CHART: IR Value --- */}
        <div className={styles.chartBox}>
          <h2>IR Value Over Time (Finger Presence)</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={axisColor} fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize="12px" label={{ value: 'IR Raw Value', angle: -90, position: 'insideLeft', fill: axisColor, dx: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBackground, border: `1px solid ${gridColor}` }} itemStyle={{ color: tooltipText }} />
              <Legend />
              <Line type="monotone" dataKey="IR_Value" name="IR Value" stroke="#E882D8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* --- Data Table --- */}
      {data.length > 0 ? (
        <div className={styles.tableContainer}>
          <h2>Recent Readings</h2>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tr}>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Weight (g)</th>
                <th className={styles.th}>Temp (°C)</th>
                <th className={styles.th}>Gyro X</th>
                <th className={styles.th}>Gyro Y</th>
                <th className={styles.th}>Gyro Z</th>
                <th className={styles.th}>IR Value</th>
              </tr>
            </thead>
            <tbody>
              {data.slice().reverse().slice(0, 10).map((row) => ( // Show latest 10, newest first
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}>{row.id}</td>
                  <td className={styles.td}>{row.weight_g?.toFixed(1)}</td>
                  <td className={styles.td}>{row.temperature_c?.toFixed(1)}</td>
                  <td className={styles.td}>{row.gyro_x?.toFixed(1)}</td>
                  <td className={styles.td}>{row.gyro_y?.toFixed(1)}</td>
                  <td className={styles.td}>{row.gyro_z?.toFixed(1)}</td>
                  <td className={styles.td}>{row.ir_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#9CA3AF' }}>No sensor data yet. Make sure your ESP8266 is running and sending data.</p>
      )}
    </div>
  );
}