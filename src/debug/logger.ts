// DEV-only Debug Logger
// This file provides comprehensive logging for development environment
// Includes console patching, error tracking, network telemetry, and persistent storage

export interface DebugLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: unknown;
  stack?: string;
  url?: string;
  userAgent?: string;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private maxLogs = 1000;
  private storageKey = 'homestead-debug-logs';
  private origConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };
  private isDev = import.meta.env.DEV;

  constructor() {
    this.origConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    if (!this.isDev) {
      return; // Don't initialize in production
    }
    
    this.loadLogs();
    this.patchConsole();
    this.setupGlobalHandlers();
    this.setupNetworkTelemetry();
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load debug logs from localStorage:', err);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (err) {
      console.warn('Failed to save debug logs to localStorage:', err);
    }
  }

  private addLog(level: DebugLog['level'], source: string, message: string, data?: unknown): void {
    if (!this.isDev) return;

    const log: DebugLog = {
      timestamp: Date.now(),
      level,
      source,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (level === 'error' && data instanceof Error) {
      log.stack = data.stack;
      log.data = data.message;
    }

    this.logs.push(log);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save periodically
    if (this.logs.length % 10 === 0) {
      this.saveLogs();
    }
  }

  private patchConsole(): void {
    if (!this.isDev) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
      this.addLog('info', 'console', args.join(' '), args);
      this.origConsole.log(...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
      this.addLog('warn', 'console', args.join(' '), args);
      this.origConsole.warn(...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      this.addLog('error', 'console', args.join(' '), args);
      this.origConsole.error(...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.debug = (...args: any[]) => {
      this.addLog('debug', 'console', args.join(' '), args);
      this.origConsole.debug(...args);
    };
  }

  private setupGlobalHandlers(): void {
    if (!this.isDev) return;

    window.addEventListener('error', (event) => {
      this.addLog('error', 'window', `Unhandled error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('error', 'promise', `Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason
      });
    });
  }

  private setupNetworkTelemetry(): void {
    if (!this.isDev) return;

    // Patch fetch
    const origFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      try {
        const response = await origFetch(input, init);
        const duration = Date.now() - startTime;
        
        this.addLog('info', 'fetch', `${init?.method || 'GET'} ${url} ${response.status}`, {
          method: init?.method || 'GET',
          url: this.redactUrl(url),
          status: response.status,
          duration,
          type: 'success'
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.addLog('error', 'fetch', `${init?.method || 'GET'} ${url} failed`, {
          method: init?.method || 'GET',
          url: this.redactUrl(url),
          duration,
          error: error instanceof Error ? error.message : error,
          type: 'error'
        });
        
        throw error;
      }
    };

    // Patch XMLHttpRequest
    const origXHROpen = XMLHttpRequest.prototype.open;
    const origXHRSend = XMLHttpRequest.prototype.send;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async = true, username?: string | null, password?: string | null) {
      interface XHRWithDebug extends XMLHttpRequest {
        _debugMethod?: string;
        _debugUrl?: string;
        _debugStartTime?: number;
      }
      (this as XHRWithDebug)._debugMethod = method;
      (this as XHRWithDebug)._debugUrl = typeof url === 'string' ? url : url.toString();
      (this as XHRWithDebug)._debugStartTime = Date.now();
      
      return origXHROpen.call(this, method, url, async, username, password);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      interface XHRWithDebug extends XMLHttpRequest {
        _debugMethod?: string;
        _debugUrl?: string;
        _debugStartTime?: number;
      }
      const xhr = this as XHRWithDebug;
      const method = xhr._debugMethod || 'GET';
      const url = xhr._debugUrl || '';
      const startTime = xhr._debugStartTime || Date.now();

      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function(event: Event) {
        if (xhr.readyState === 4) {
          const duration = Date.now() - startTime;
          
          if (self.isDev) {
            self.addLog('info', 'xhr', `${method} ${url} ${xhr.status}`, {
              method,
              url: self.redactUrl(url),
              status: xhr.status,
              duration,
              type: xhr.status >= 400 ? 'error' : 'success'
            });
          }
        }
        
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.call(this, event);
        }
      };

      return origXHRSend.call(this, body);
    };
  }

  private redactUrl(url: string): string {
    // Redact sensitive information from URLs
    return url
      .replace(/([?&])(key|token|password|secret|authorization)=([^&]*)/gi, '$1$2=***')
      .replace(/\/bearer\/[^/\\?]+/gi, '/bearer/***')
      .replace(/\/api\/[^/]+\/auth\/[^/\\?]+/gi, '/api/***/auth/***');
  }

  // Public API methods
  getLogs(): DebugLog[] {
    return this.isDev ? [...this.logs] : [];
  }

  getLogsJsonl(): string {
    return this.getLogs().map(log => JSON.stringify(log)).join('\n');
  }

  downloadLogs(): void {
    if (!this.isDev) return;

    const logsJsonl = this.getLogsJsonl();
    const blob = new Blob([logsJsonl], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `homestead-debug-logs-${new Date().toISOString().split('T')[0]}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  clearLogs(): void {
    if (!this.isDev) return;
    
    this.logs = [];
    localStorage.removeItem(this.storageKey);
  }

  logEvent(source: string, message: string, data?: unknown): void {
    if (!this.isDev) return;
    this.addLog('info', source, message, data);
  }

  // Route tracking for SPA
  setDebugRoute(path: string): void {
    if (!this.isDev) return;
    this.addLog('info', 'route', `Route changed to ${path}`, { path });
  }
}

// Initialize singleton instance
const debugLogger = new DebugLogger();
interface WindowWithDebugLogger extends Window {
  __debugLogger?: DebugLogger;
}
(window as WindowWithDebugLogger).__debugLogger = debugLogger;

// Export the singleton instance and its methods
export const logger = debugLogger;
export const initDebugLogger = () => debugLogger; // For main.tsx compatibility
export const getLogsJsonl = () => debugLogger.getLogsJsonl();
export const downloadLogs = () => debugLogger.downloadLogs();
export const clearLogs = () => debugLogger.clearLogs();
export const logEvent = (source: string, message: string, data?: unknown) => debugLogger.logEvent(source, message, data);
export const setDebugRoute = (path: string) => debugLogger.setDebugRoute(path);

// Re-export log access for DebugPanel
export const getLogs = () => debugLogger.getLogs();