'use client'; // Required for Supabase client-side interaction

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Note the '../../' to go up two levels
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './page.module.css'; // Import the data page styles

export default function DataPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch data from Supabase
    const fetchData = async () => {
        try {
            // Fetch the latest 50 entries, ordered by 'id'
            const { data: sensorData, error: fetchError } = await supabase
                .from('sensor_data')
                .select('*')
                .order('id', { ascending: false }) // Order by ID
                .limit(50); // Get the latest 50 entries

            if (fetchError) {
                throw fetchError;
            }

            // Data is already ordered, just reverse it so ID (time) flows left-to-right
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

        // Set up Supabase real-time subscription
        const channel = supabase
            .channel('sensor_data_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
                console.log('New data received:', payload.new);
                setData((currentData) => {
                    // Add new point (no timestamp formatting needed)
                    const newDataPoint = { ...payload.new };
                    // Add new point and keep only the latest 50 entries
                    const updatedData = [...currentData, newDataPoint].slice(-50);
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
        return <div className={styles.container}>Loading sensor data...</div>;
    }

    if (error) {
        return <div className={styles.container}>Error: {error}</div>;
    }

    // Prepare data for the chart (ensure values are numbers)
    const chartData = data.map(d => ({
        timestamp: d.id, // Use ID as the timestamp
        Weight: parseFloat(d.weight_g) || 0,
        GyroX: parseFloat(d.gyro_x) || 0,
        GyroY: parseFloat(d.gyro_y) || 0,
        GyroZ: parseFloat(d.gyro_z) || 0,
    }));

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Real-Time Data Dashboard</h1>

            <div className={styles.chartGrid}>
                {/* --- Individual Chart: Weight --- */}
                <div className={styles.chartBox}>
                    <h2>Weight Over Time</h2>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: 'var(--text-secondary)' }} />
                            <YAxis stroke="var(--text-secondary)" fontSize="12px" label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', dx: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--background-dark)', border: '1px solid var(--border-color)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Weight" stroke="var(--accent-blue)" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* --- Individual Chart: Gyroscope --- */}
                <div className={styles.chartBox}>
                    <h2>Gyroscope Over Time</h2>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize="12px" label={{ value: 'Row ID', position: 'insideBottom', dy: 10, fill: 'var(--text-secondary)' }} />
                            <YAxis stroke="var(--text-secondary)" fontSize="12px" label={{ value: 'Gyro (°/s)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', dx: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--background-dark)', border: '1px solid var(--border-color)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="GyroX" stroke="var(--accent-green)" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="GyroY" stroke="var(--accent-yellow)" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="GyroZ" stroke="var(--accent-red)" dot={false} strokeWidth={2} />
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
                                <th className={styles.th}>Gyro X</th>
                                <th className={styles.th}>Gyro Y</th>
                                <th className={styles.th}>Gyro Z</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice().reverse().slice(0, 10).map((row) => ( // Show latest 10, newest first
                                <tr key={row.id} className={styles.tr}>
                                    <td className={styles.td}>{row.id}</td>
                                    <td className={styles.td}>{row.weight_g?.toFixed(1)}</td>
                                    <td className={styles.td}>{row.gyro_x?.toFixed(1)}</td>
                                    <td className={styles.td}>{row.gyro_y?.toFixed(1)}</td>
                                    <td className={styles.td}>{row.gyro_z?.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No sensor data yet. Make sure your ESP8266 is running and sending data.</p>
            )}
        </div>
    );
}