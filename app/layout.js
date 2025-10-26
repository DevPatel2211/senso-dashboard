// In app/layout.js
export const metadata = {
  title: 'SensoGuard Dashboard',
  description: 'Real-time sensor data',
}

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}