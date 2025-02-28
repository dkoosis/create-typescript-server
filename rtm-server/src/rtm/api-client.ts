// src/rtm/api-client.ts
import crypto from 'crypto';
import fetch from 'node-fetch';

export class RTMApiClient {
  private readonly apiKey: string;
  private readonly sharedSecret: string;
  private readonly baseUrl = 'https://api.rememberthemilk.com/services/rest/';
  
  constructor(apiKey: string, sharedSecret: string) {
    this.apiKey = apiKey;
    this.sharedSecret = sharedSecret;
  }
  
  /**
   * Signs a request according to RTM's signing rules
   * @param params The parameters to sign
   * @returns The signature for the request
   */
  private sign(params: Record<string, string>): string {
    // 1. Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // 2. Concatenate key/value pairs
    let signatureBase = this.sharedSecret;
    for (const key of sortedKeys) {
      signatureBase += key + params[key];
    }
    
    // 3. Calculate MD5
    return crypto.createHash('md5').update(signatureBase).digest('hex');
  }
  
  /**
   * Makes a request to the RTM API
   * @param method The API method to call
   * @param params Additional parameters
   * @returns The API response
   */
  async request<T = any>(method: string, params: Record<string, string> = {}): Promise<T> {
    // Build parameters with required fields
    const requestParams: Record<string, string> = {
      method,
      api_key: this.apiKey,
      format: 'json',
      ...params
    };
    
    // Sign the request if needed (not required for test methods, but we'll do it anyway)
    const signature = this.sign(requestParams);
    requestParams.api_sig = signature;
    
    // Build query string
    const queryString = Object.entries(requestParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Make the request
    const response = await fetch(`${this.baseUrl}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`RTM API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API error
    if (data.rsp?.stat === 'fail') {
      throw new Error(`RTM API error: ${data.rsp.err?.code} ${data.rsp.err?.msg}`);
    }
    
    return data.rsp as T;
  }
  
  /**
   * Simple health check using rtm.test.echo
   * This doesn't require authentication
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Use rtm.test.echo as a simple health check
      const response = await this.request('rtm.test.echo', { foo: 'bar' });
      return response?.stat === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
  
  /**
   * Get the current time from RTM
   * This doesn't require authentication
   */
  async getTime(): Promise<string> {
    const response = await this.request<{ time: { time: string } }>('rtm.time.parse', { 
      time: 'now' 
    });
    return response.time.time;
  }
}