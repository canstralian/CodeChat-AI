
import { secretsManager } from "./secrets";

/**
 * Optimized utility functions for API key management and rotation
 */

export interface APIKeyRotationConfig {
  service: 'openrouter' | 'anthropic';
  newKey: string;
  validateBeforeSwitch: boolean;
  rollbackOnFailure: boolean;
}

export interface APIKeyRotationResult {
  success: boolean;
  error?: string;
  rollbackPerformed?: boolean;
  validationTime?: number;
}

export interface ConnectivityTestResult {
  service: string;
  isConnected: boolean;
  responseTime?: number;
  error?: string;
}

export class APIKeyManager {
  private static readonly VALIDATION_TIMEOUT = 10000;
  private static readonly MAX_RETRIES = 2;

  /**
   * Rotates API key for a service with enhanced error handling
   */
  public static async rotateAPIKey(config: APIKeyRotationConfig): Promise<APIKeyRotationResult> {
    const { service, newKey, validateBeforeSwitch, rollbackOnFailure = true } = config;
    const startTime = Date.now();
    
    // Input validation
    if (!newKey?.trim()) {
      return {
        success: false,
        error: `Invalid new key provided for ${service}`
      };
    }

    if (!['openrouter', 'anthropic'].includes(service)) {
      return {
        success: false,
        error: `Unsupported service: ${service}`
      };
    }

    const envVarName = service === 'openrouter' ? 'OPENROUTER_API_KEY' : 'ANTHROPIC_API_KEY';
    const originalKey = process.env[envVarName];
    
    try {
      if (validateBeforeSwitch) {
        console.log(`🔄 Validating new ${service} API key before rotation...`);
        
        // Temporarily set the new key for validation
        process.env[envVarName] = newKey;
        
        // Force configuration refresh
        secretsManager.forceRefresh();
        
        // Validate with timeout
        const validationPromise = secretsManager.validateAllKeys();
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Validation timeout')), this.VALIDATION_TIMEOUT);
        });
        
        await Promise.race([validationPromise, timeoutPromise]);
        
        const isValid = secretsManager.getAPIKey(service) !== null;
        
        if (!isValid) {
          throw new Error(`New ${service} API key validation failed`);
        }
      } else {
        // Direct rotation without validation
        process.env[envVarName] = newKey;
        secretsManager.forceRefresh();
      }
      
      const validationTime = Date.now() - startTime;
      console.log(`✅ Successfully rotated ${service} API key in ${validationTime}ms`);
      
      return {
        success: true,
        validationTime
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ API key rotation failed for ${service}:`, errorMessage);
      
      let rollbackPerformed = false;
      
      if (rollbackOnFailure) {
        try {
          // Restore original key
          if (originalKey !== undefined) {
            process.env[envVarName] = originalKey;
          } else {
            delete process.env[envVarName];
          }
          
          secretsManager.forceRefresh();
          await secretsManager.validateAllKeys();
          rollbackPerformed = true;
          
          console.log(`🔄 Successfully rolled back ${service} API key`);
        } catch (rollbackError) {
          console.error(`❌ Failed to rollback ${service} API key:`, rollbackError);
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        rollbackPerformed
      };
    }
  }

  /**
   * Gets comprehensive usage statistics for API services
   */
  public static getUsageStats(): Record<string, any> {
    const validationStatus = secretsManager.getValidationStatus();
    const bestConfig = secretsManager.getBestAIConfig();
    
    return {
      validationStatus,
      activeService: bestConfig?.service || 'none',
      hasValidService: bestConfig !== null,
      servicesCount: Object.keys(validationStatus).length,
      validServicesCount: Object.values(validationStatus).filter(s => s.isValid).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Tests connectivity to all configured services with detailed results
   */
  public static async testConnectivity(): Promise<ConnectivityTestResult[]> {
    console.log('🔍 Testing connectivity to all services...');
    
    const startTime = Date.now();
    await secretsManager.validateAllKeys();
    const totalTime = Date.now() - startTime;
    
    const status = secretsManager.getValidationStatus();
    const results: ConnectivityTestResult[] = [];
    
    for (const [service, config] of Object.entries(status)) {
      results.push({
        service,
        isConnected: config.isValid,
        responseTime: service === 'database' ? 0 : totalTime / Object.keys(status).length,
        error: config.isValid ? undefined : 'Validation failed'
      });
    }
    
    return results;
  }

  /**
   * Forces revalidation of all API keys with retry logic
   */
  public static async forceRevalidation(retries: number = this.MAX_RETRIES): Promise<boolean> {
    console.log('🔄 Forcing revalidation of all API keys...');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await secretsManager.validateAllKeys();
        const status = secretsManager.getValidationStatus();
        const hasValidServices = Object.values(status).some(s => s.isValid);
        
        if (hasValidServices) {
          console.log(`✅ Revalidation successful on attempt ${attempt}`);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Revalidation attempt ${attempt} failed:`, error);
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ All revalidation attempts failed');
    return false;
  }

  /**
   * Validates service configuration before rotation
   */
  public static validateRotationConfig(config: APIKeyRotationConfig): { isValid: boolean; error?: string } {
    if (!config.service || !['openrouter', 'anthropic'].includes(config.service)) {
      return { isValid: false, error: 'Invalid service specified' };
    }
    
    if (!config.newKey || config.newKey.trim().length === 0) {
      return { isValid: false, error: 'New key is required' };
    }
    
    if (config.newKey.length < 10) {
      return { isValid: false, error: 'New key appears to be too short' };
    }
    
    return { isValid: true };
  }
}

export default APIKeyManager;
