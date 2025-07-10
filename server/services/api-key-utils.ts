
import { secretsManager } from "./secrets";

/**
 * Utility functions for API key management and rotation
 */

export interface APIKeyRotationConfig {
  service: 'openrouter' | 'anthropic';
  newKey: string;
  validateBeforeSwitch: boolean;
}

export class APIKeyManager {
  /**
   * Rotates API key for a service
   */
  public static async rotateAPIKey(config: APIKeyRotationConfig): Promise<boolean> {
    const { service, newKey, validateBeforeSwitch } = config;
    
    if (validateBeforeSwitch) {
      console.log(`🔄 Validating new ${service} API key before rotation...`);
      
      // Temporarily set the new key for validation
      const originalKey = process.env[service === 'openrouter' ? 'OPENROUTER_API_KEY' : 'ANTHROPIC_API_KEY'];
      process.env[service === 'openrouter' ? 'OPENROUTER_API_KEY' : 'ANTHROPIC_API_KEY'] = newKey;
      
      // Validate the new key
      await secretsManager.validateAllKeys();
      const isValid = secretsManager.getAPIKey(service) !== null;
      
      if (!isValid) {
        // Restore original key if validation fails
        process.env[service === 'openrouter' ? 'OPENROUTER_API_KEY' : 'ANTHROPIC_API_KEY'] = originalKey;
        await secretsManager.validateAllKeys();
        console.error(`❌ New ${service} API key validation failed, keeping original key`);
        return false;
      }
    } else {
      // Direct rotation without validation
      process.env[service === 'openrouter' ? 'OPENROUTER_API_KEY' : 'ANTHROPIC_API_KEY'] = newKey;
      await secretsManager.validateAllKeys();
    }
    
    console.log(`✅ Successfully rotated ${service} API key`);
    return true;
  }

  /**
   * Gets usage statistics for API services
   */
  public static getUsageStats(): Record<string, any> {
    return {
      validationStatus: secretsManager.getValidationStatus(),
      activeService: secretsManager.getBestAIConfig()?.service || 'none',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Tests connectivity to all configured services
   */
  public static async testConnectivity(): Promise<Record<string, boolean>> {
    console.log('🔍 Testing connectivity to all services...');
    await secretsManager.validateAllKeys();
    
    const status = secretsManager.getValidationStatus();
    return Object.fromEntries(
      Object.entries(status).map(([service, config]) => [service, config.isValid])
    );
  }

  /**
   * Forces revalidation of all API keys
   */
  public static async forceRevalidation(): Promise<void> {
    console.log('🔄 Forcing revalidation of all API keys...');
    await secretsManager.validateAllKeys();
  }
}

export default APIKeyManager;
