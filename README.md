# Elastic Agent Diagnostic Analyzer

This web-based tool analyzes Elastic Agent diagnostic bundles, providing an intuitive interface for uploading and inspecting Elastic Agent diagnostic information, configurations, and logs.

## Features

The analyzer is organized into several tabs, each focusing on a specific aspect of the Elastic Agent:

### Overview Tab

- Displays Version Information:

  - Build Time
  - Commit
  - Snapshot status
  - Version number

- Shows Agent State:

  - Fleet Message
  - Fleet State
  - Log Level
  - Message
  - State

- Presents a detailed Components Table:
  - Component ID
  - Version Info (Name and Version)
  - Status
  - State
  - I/O Type
  - Units

### Configuration Tab

Provides access to various configuration files:

- Local Config
- Pre-Config
- Variables
- Computed Config
- Expected Components
- Actual Components

Each configuration can be expanded to view its contents.

### Logs Tab

Allows users to analyze log entries from the Elastic Agent.

### Profiling Tab

Offers tools to visualize and analyze profiling data from the Elastic Agent.

## Prerequisites

- Node.js (version 14.0.0 or later recommended)
- npm (version 6.0.0 or later) or yarn (version 1.22.0 or later)
- Git (for cloning the repository)

## Installation

1. Clone the repository: `git clone https://github.com/your-username/elastic-agent-diagnostic-analyzer.git`
2. Navigate to the project directory: `cd elastic-agent-diagnostic-analyzer/frontend`
3. Install dependencies:

- If using npm: `npm install`
- If using yarn: `yarn install`

## Running the Development Server

1. Start the development server:

- If using npm: `npm run dev`
- If using yarn: `yarn dev`

2. Open your browser and visit `http://localhost:3000`

## Troubleshooting

If you encounter any issues during installation or running the project:

1. Make sure you're using the correct versions of Node.js and npm/yarn.
2. Try deleting the `node_modules` folder and `package-lock.json` (or `yarn.lock`) file, then run the install command again.
3. If you're still having issues, please check the project's GitHub Issues page or create a new issue with details about the problem you're facing.

## Licenses

This project uses various open-source libraries, each with its own license. For details, please see the LICENSE files in the node_modules directory of each package.

Key libraries and their licenses include:

- React, Next.js, Chart.js, date-fns, lodash: MIT License
- D3.js, protobufjs: BSD-3-Clause License
- react-data-grid, react-data-table-component: Apache-2.0 License
- pako: ISC License (similar to MIT)
- styled-components: MIT License

All other dependencies are also under permissive open-source licenses (mostly MIT).
A full list of dependencies and their licenses can be found in the package.json file.

### Disclaimer

This information is provided for guidance only and does not constitute legal advice. For any specific legal concerns, please consult with a qualified legal professional.
