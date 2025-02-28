// src/rtm/health.ts
import { RTMApiClient } from './api-client';

export async function checkRTMHealth(client: RTMApiClient): Promise<{ 
  healthy: boolean; 
  details: Record<string, any>;
}> {
  try {
    // Check if basic API endpoint is responsive
    const isHealthy = await client.healthCheck();
    
    // Get additional information if the service is healthy
    let details: Record<string, any> = {};
    
    if (isHealthy) {
      try {
        // Get the server time as additional validation
        const serverTime = await client.getTime();
        details.serverTime = serverTime;
      } catch (error) {
        // Not critical for health check, just log
        console.warn('Failed to get RTM server time:', error);
      }
    }
    
    return {
      healthy: isHealthy,
      details
    };
  } catch (error) {
    console.error('RTM health check failed with error:', error);
    return {
      healthy: false,
      details: { error: String(error) }
    };
  }
}