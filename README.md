# Compare-Viz

A flexible web application for comparing and visualizing performance metrics between two systems or tools.

## Features

- 📊 **Flexible Comparison**: Compare performance between any two systems (A/B)
- 📈 **Multiple Metrics**: Support for various metrics like throughput, latency, error rates
- 🔍 **Dynamic Filtering**: Filter data based on parameters
- 📉 **Interactive Charts**: Visualize data with customizable x-axis (test conditions or parameters)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🌙 **Dark Mode**: Easy on the eyes with dark mode support
- 🔧 **YAML Configuration**: Easy setup through YAML configuration files

## Quick Start

### 1. Configure Your Dashboard

Edit `public/config.yaml` to set up your dashboard:

```yaml
title: System Performance Comparison Dashboard
description: Compare and visualize performance between different systems

scenarios:
  - id: pulsar-vs-kafka
    name: Messaging Systems Comparison
    file: data/pulsar_vs_kafka.csv
    description: Compare Apache Pulsar vs Apache Kafka performance
    target_a_name: Apache Pulsar
    target_b_name: Apache Kafka
    metrics:
      - id: produce_rate
        name: Produce Rate
        unit: msg/s
        higher_is_better: true
      - id: latency_p50
        name: Latency (P50)
        unit: ms
        higher_is_better: false
    parameters:
      parameter_1:
        name: Producers
        unit: instances
      parameter_2:
        name: Consumers
        unit: instances
      parameter_3:
        name: Partitions
        unit: partitions
```

### 2. Prepare Your Data

Place your CSV files in the `public/data/` directory:

```csv
test_condition,producers,consumers,partitions,pulsar_produce_rate,kafka_produce_rate,pulsar_latency_p50,kafka_latency_p50
test-001,1,1,1,10000,9500,5,7
test-002,2,2,4,40000,38000,6,8
test-003,4,4,8,75000,70000,7,10
```

### 3. Define Column Mappings

Map your CSV columns to internal parameter names:

```yaml
column_mappings:
  - file: data/pulsar_vs_kafka.csv
    mappings:
      test_condition: test_condition
      parameter_1: producers
      parameter_2: consumers
      parameter_3: partitions
      scenario_a_produce_rate: pulsar_produce_rate
      scenario_b_produce_rate: kafka_produce_rate
      scenario_a_latency_p50: pulsar_latency_p50
      scenario_b_latency_p50: kafka_latency_p50
```

## Configuration Reference

### Global Settings

| Field | Description | Required |
|-------|-------------|----------|
| `title` | Dashboard title | No |
| `description` | Dashboard description | No |

### Scenario Configuration

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique scenario identifier | Yes |
| `name` | Display name for the scenario | Yes |
| `file` | Path to CSV file | Yes |
| `description` | Scenario description | Yes |
| `target_a_name` | Name of system/tool A | Yes |
| `target_b_name` | Name of system/tool B | Yes |
| `metrics` | Array of metrics | Yes |
| `parameters` | Parameter definitions | Yes |

### Metric Configuration

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique metric identifier | Yes |
| `name` | Display name for the metric | Yes |
| `unit` | Unit of measurement (e.g., ms, req/s, %) | Yes |
| `higher_is_better` | Whether higher values are better | Yes |

### Parameter Configuration

You can define up to 3 parameters (`parameter_1`, `parameter_2`, `parameter_3`):

```yaml
parameters:
  parameter_1:
    name: Display name
    unit: Unit of measurement
```

## Development

### Prerequisites

- Node.js 20.19.0 or higher
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Use Cases

### Database Performance Comparison

Compare PostgreSQL vs MySQL:
- Parameters: connections, threads, query complexity
- Metrics: queries per second, latency, error rate

### Web Server Comparison

Compare Nginx vs Apache:
- Parameters: concurrent connections, request size
- Metrics: response time, throughput, CPU usage

### Message Queue Comparison

Compare RabbitMQ vs Kafka:
- Parameters: producers, consumers, message size
- Metrics: throughput, latency, memory usage

## Architecture

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Data Processing**: DuckDB WASM for in-browser SQL queries
- **Configuration**: YAML-based configuration

## Troubleshooting

### Data Not Showing

1. Check browser console for errors
2. Verify CSV file path is correct
3. Ensure column mappings match CSV headers

### Metrics Showing as Zero

1. Check if CSV column names match the mappings
2. Verify numeric data format (no commas in numbers)
3. Ensure metric IDs in mappings match metric definitions

### Performance Issues

1. Reduce the number of data points in CSV
2. Use filtering to limit displayed data
3. Check browser memory usage

## Deployment

### GitHub Pages

1. Update the base path in `vite.config.ts`:
   ```typescript
   const base = mode === 'production' ? '/your-repo-name/' : '/'
   ```

2. Enable GitHub Pages in your repository:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: Select `gh-pages` (will be created by GitHub Actions)

3. Push to main branch:
   ```bash
   git push origin main
   ```

4. GitHub Actions will automatically build and deploy to:
   ```
   https://[username].github.io/[repository-name]/
   ```

### Manual Build

```bash
# Build for production
npm run build

# The output will be in the dist/ directory
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License