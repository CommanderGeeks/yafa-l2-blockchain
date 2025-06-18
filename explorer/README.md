# YAFA L2 Block Explorer

A comprehensive, real-time block explorer for the YAFA L2 blockchain with live data streaming, transaction tracking, and analytics.

## 🏗️ Architecture

- **Indexer**: Node.js service that streams blocks from YAFA L2 and stores data in PostgreSQL
- **API**: Next.js REST API serving explorer data with pagination and filtering
- **Web**: React frontend with real-time updates and YAFA-themed UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- YAFA L2 node running on `http://localhost:3000`

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and navigate
cd Explorer

# 2. Copy environment file
cp .env.sample .env

# 3. Edit .env with your settings
nano .env

# 4. Start all services
docker compose up -d

# 5. Run database migrations
docker compose exec indexer npm run migrate

# 6. Start backfill (optional - for historical data)
docker compose exec indexer npm run backfill
```

**Services will be available at:**
- Web Explorer: http://localhost:3002
- API: http://localhost:3001
- PostgreSQL: localhost:5432

### Option 2: Local Development

```bash
# 1. Setup PostgreSQL database
createdb yafa_explorer

# 2. Install dependencies for all services
cd indexer && npm install && cd ..
cd api && npm install && cd ..
cd web && npm install && cd ..

# 3. Copy and configure environment
cp .env.sample .env
# Edit .env with your PostgreSQL connection string

# 4. Run database migrations
cd indexer
npm run migrate
cd ..

# 5. Start services (in separate terminals)
cd indexer && npm run dev     # Terminal 1
cd api && npm run dev         # Terminal 2  
cd web && npm run dev         # Terminal 3

# 6. Optional: Backfill historical data
cd indexer && npm run backfill
```

## 📊 Features

### Real-time Data
- Live block and transaction streaming
- WebSocket connections for instant updates
- Automatic reorg detection and handling

### Explorer Pages
- **Dashboard**: Latest blocks, transactions, and chain statistics
- **Block Details**: Complete block information with transaction list
- **Transaction Details**: Full transaction data with logs and traces
- **Address Details**: Account balance, transaction history, token holdings
- **Token Details**: ERC20/ERC721 token information and holders

### Search & Navigation
- Universal search (blocks, transactions, addresses)
- Auto-detection of search input type
- Pagination and filtering on all list views

### Analytics
- Block time charts
- Transaction throughput graphs
- Gas usage statistics
- Network activity metrics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RPC_URL` | YAFA L2 HTTP RPC endpoint | `http://localhost:3000` |
| `RPC_WSS_URL` | YAFA L2 WebSocket endpoint | `ws://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `API_PORT` | API server port | `3001` |
| `WEB_PORT` | Web server port | `3002` |
| `REORG_DEPTH` | Blocks to monitor for reorgs | `12` |
| `INDEXER_POLL_INTERVAL` | Polling interval (ms) | `5000` |

### Database Schema

The indexer uses Prisma ORM with the following main tables:
- `blocks` - Block headers and metadata
- `transactions` - Transaction details
- `logs` - Event logs and contract interactions
- `addresses` - Account information and balances
- `tokens` - ERC20/ERC721 token metadata

## 🛠️ Development

### Adding New Features

1. **Indexer**: Modify `indexer/src/indexer.ts` to capture additional data
2. **Database**: Update `indexer/prisma/schema.prisma` and run migrations
3. **API**: Add new endpoints in `api/app/api/`
4. **Web**: Create new components in `web/components/`

### Running Tests

```bash
# Run indexer tests
cd indexer && npm test

# Run API tests  
cd api && npm test

# Run web tests
cd web && npm test
```

### Database Migrations

```bash
cd indexer

# Create new migration
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Generate Prisma client
npm run db:generate
```

## 📡 API Endpoints

### Blocks
- `GET /api/blocks` - List recent blocks
- `GET /api/blocks/[number]` - Get specific block

### Transactions
- `GET /api/txs` - List recent transactions
- `GET /api/txs/[hash]` - Get specific transaction

### Addresses
- `GET /api/address/[addr]` - Get address details
- `GET /api/address/[addr]/txs` - Get address transactions

### Tokens
- `GET /api/token/[addr]` - Get token details
- `GET /api/token/[addr]/transfers` - Get token transfers

### Statistics
- `GET /api/stats` - Get chain statistics

All endpoints support pagination via `?page=N&limit=M` parameters.

## 🔄 Reorg Handling

The indexer monitors for blockchain reorganizations:

1. **Detection**: Compares new block hashes with stored data
2. **Rollback**: Removes invalidated blocks and transactions
3. **Re-index**: Processes the new canonical chain
4. **Notification**: Updates connected web clients via WebSocket

## 🐛 Troubleshooting

### Common Issues

**Indexer not syncing:**
```bash
# Check RPC connection
curl http://localhost:3000

# Check logs
docker compose logs indexer
```

**Database connection errors:**
```bash
# Test connection
psql $DATABASE_URL

# Reset database
npm run db:reset
```

**Web app not loading:**
```bash
# Check API is running
curl http://localhost:3001/api/stats

# Check environment variables
cat .env
```

### Performance Tuning

For high-throughput chains, consider:
- Increasing `INDEXER_BATCH_SIZE`
- Using read replicas for API queries
- Implementing Redis caching
- Optimizing database indexes

## 📈 Monitoring

### Health Checks
- `GET /api/health` - API health status
- `GET /indexer/health` - Indexer sync status

### Metrics
- Block processing rate
- Database query performance
- WebSocket connection count
- API response times

## 🚢 Production Deployment

### Docker Production

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Deploy with production config
docker compose -f docker-compose.prod.yml up -d
```

### Environment Setup

1. Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
2. Configure SSL certificates
3. Set up load balancers
4. Enable monitoring and alerting
5. Configure backups and disaster recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the YAFA L2 ecosystem.