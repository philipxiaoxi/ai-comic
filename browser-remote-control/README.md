# Browser Remote Control

Three-layer architecture CLI browser remote control tool.

## Architecture

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     WebSocket      ┌─────────────────┐
│   CLI Layer  │ ──────────────────→│ Server Layer │ ──────────────────→│ Browser Plugin   │
│  (Agent接口) │←──────────────────│  (通信中枢)   │←──────────────────│   (执行层)        │
└─────────────┘     JSON响应       └─────────────┘     执行结果        └─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Start Server

```bash
npm run server
```

### 3. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. The extension icon should show "ON" badge when connected

### 4. Use CLI

```bash
# Navigate to a URL
cd cli && node bin/browser-cli.js navigate --url "https://example.com"

# Get page content
node bin/browser-cli.js content

# Get page text
node bin/browser-cli.js text

# Click an element
node bin/browser-cli.js click --selector "#myButton"

# List connected plugins
node bin/browser-cli.js plugins
```

## API Reference

### Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/navigate` | Navigate to URL |
| GET | `/api/content` | Get HTML content |
| GET | `/api/text` | Get text content |
| POST | `/api/click` | Click element |
| GET | `/api/plugins` | List plugins |
| GET | `/health` | Health check |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_URL | 400 | Invalid URL format |
| ELEMENT_NOT_FOUND | 404 | Element not found |
| ELEMENT_NOT_VISIBLE | 400 | Element not visible |
| NAVIGATION_TIMEOUT | 504 | Navigation timeout |
| PLUGIN_DISCONNECTED | 503 | No plugin connected |
| COMMAND_TIMEOUT | 504 | Command timeout |
