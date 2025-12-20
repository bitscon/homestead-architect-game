// DEV-only Debug Logger
// This file provides comprehensive logging for development environment
// Includes console patching, error tracking, network telemetry, and persistent storage

export interface DebugLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: any;
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
  } = {} as any;
  private isDev = import.meta.env.DEV;

  constructor() {
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

  private addLog(level: DebugLog['level'], source: string, message: string, data?: any): void {
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

    this.origConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    console.log = (...args: any[]) => {
      this.addLog('info', 'console', args.join(' '), args);
      this.origConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      this.addLog('warn', 'console', args.join(' '), args);
      this.origConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.addLog('error', 'console', args.join(' '), args);
      this.origConsole.error(...args);
    };

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

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._debugMethod = method;
      (this as any)._debugUrl = typeof url === 'string' ? url : url.toString();
      (this as any)._debugStartTime = Date.now();
      
      return origXHROpen.apply(this, [method, url, ...args] as any);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | BodyInit | null) {
      const xhr = this;
      const method = (xhr as any)._debugMethod;
      const url = (xhr as any)._debugUrl;
      const startTime = (xhr as any)._debugStartTime;

      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const duration = Date.now() - startTime;
          const logger = (window as any).__debugLogger;
          
          if (logger) {
            logger.addLog('info', 'xhr', `${method} ${url} ${xhr.status}`, {
              method,
              url: logger.redactUrl(url),
              status: xhr.status,
              duration,
              type: xhr.status >= 400 ? 'error' : 'success'
            });
          }
        }
        
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.apply(this, arguments as any);
        }
      };

      return origXHRSend.apply(this, arguments as any);
    };
  }

  private redactUrl(url: string): string {
    // Redact sensitive information from URLs
    return url
      .replace(/([?&])(key|token|password|secret|authorization)=([^&]*)/gi, '$1$2=***')
      .replace(/\/bearer\/[^\/\?]+/gi, '/bearer/***')
      .replace(/\/api\/[^\/]+\/auth\/[^\/\?]+/gi, '/api/***/auth/***');
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

  logEvent(source: string, message: string, data?: any): void {
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
(window as any).__debugLogger = debugLogger;

// Export the singleton instance and its methods
export const logger = debugLogger;
export const initDebugLogger = () => debugLogger; // For main.tsx compatibility
export const getLogsJsonl = () => debugLogger.getLogsJsonl();
export const downloadLogs = () => debugLogger.downloadLogs();
export const clearLogs = () => debugLogger.clearLogs();
export const logEvent = (source: string, message: string, data?: any) => debugLogger.logEvent(source, message, data);
export const setDebugRoute = (path: string) => debugLogger.setDebugRoute(path);

// Re-export log access for DebugPanel
export const getLogs = () => debugLogger.getLogs();