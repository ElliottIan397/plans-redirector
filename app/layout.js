// app/layout.js
export const metadata = {
  title: 'Plans Redirector',
  description: 'Clean short links for personalized MSP plans',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
