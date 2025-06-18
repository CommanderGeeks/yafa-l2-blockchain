export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui', 
      textAlign: 'center',
      background: '#0a0a0a',
      color: '#10b981',
      minHeight: '100vh'
    }}>
      <h1>🚀 YAFA Explorer API</h1>
      <p>Version 1.0.0</p>
      <p>API Server Running ✅</p>
      
      <div style={{ marginTop: '40px' }}>
        <h2>📡 Available Endpoints:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="/api/health" style={{ color: '#10b981' }}>/api/health</a> - Health Check</li>
          <li><a href="/api/stats" style={{ color: '#10b981' }}>/api/stats</a> - Chain Statistics</li>
          <li><a href="/api/blocks" style={{ color: '#10b981' }}>/api/blocks</a> - Latest Blocks</li>
          <li><a href="/api/txs" style={{ color: '#10b981' }}>/api/txs</a> - Latest Transactions</li>
        </ul>
      </div>
    </div>
  );
}