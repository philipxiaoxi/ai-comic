const http = require('http');
const https = require('https');

class ApiClient {
  constructor() {
    this.defaultServer = 'http://localhost:3000';
  }

  async request(server, method, path, body = null) {
    const url = new URL(path, server || this.defaultServer);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) {
              const err = new Error(json.error?.message || 'Request failed');
              err.code = json.error?.code;
              err.statusCode = res.statusCode;
              reject(err);
            } else {
              resolve(json);
            }
          } catch (err) {
            reject(new Error('Invalid response from server'));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Cannot connect to server: ${err.message}`));
      });

      req.setTimeout(35000, () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async navigate(server, url, tabId) {
    return this.request(server, 'POST', '/api/navigate', { url, tabId });
  }

  async getContent(server) {
    return this.request(server, 'GET', '/api/content');
  }

  async getText(server) {
    return this.request(server, 'GET', '/api/text');
  }

  async click(server, selector, tabId) {
    return this.request(server, 'POST', '/api/click', { selector, tabId });
  }

  async getPlugins(server) {
    return this.request(server, 'GET', '/api/plugins');
  }
}

module.exports = new ApiClient();
