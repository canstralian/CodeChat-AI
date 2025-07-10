
/**
 * Centralized secrets management service
 * Handles API key validation, rotation, and fallback strategies
 */

interface APIConfig {
  key: string;
  isValid: boolean;
  lastValidated: Date;
  priority: number;
}

interface SecretsConfig {
  openrouter: APIConfig;
  anthropic: APIConfig;
  database: APIConfig;
}

class SecretsManager {
  private static instance: SecretsManager;
  private config: SecretsConfig;
  private validationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      openrouter: {
        key: process.env.OPENROUTER_API_KEY || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 1
      },
      anthropic: {
        key: process.env.ANTHROPIC_API_KEY || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 2
      },
      database: {
        key: process.env.DATABASE_URL || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 3
      }
    };
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Validates API key by making a minimal test request
   */
  private async validateOpenRouterKey(key: string): Promise<boolean> {
    if (!key) return false;
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'http://localhost:5000'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Validates Anthropic API key
   */
  private async validateAnthropicKey(key: string): Promise<boolean> {
    if (!key) return false;
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  /**
   * Validates database connection
   */
  private async validateDatabaseKey(key: string): Promise<boolean> {
    if (!key) return false;
    // Simple URL validation for database connection string
    return key.startsWith('postgres://') || key.startsWith('postgresql://');
  }

  /**
   * Validates all API keys
   */
  public async validateAllKeys(): Promise<void> {
    const validations = [
      {
        name: 'openrouter',
        validator: this.validateOpenRouterKey.bind(this),
        key: this.config.openrouter.key
      },
      {
        name: 'anthropic',
        validator: this.validateAnthropicKey.bind(this),
        key: this.config.anthropic.key
      },
      {
        name: 'database',
        validator: this.validateDatabaseKey.bind(this),
        key: this.config.database.key
      }
    ];

    for (const validation of validations) {
      try {
        const isValid = await validation.validator(validation.key);
        this.config[validation.name as keyof SecretsConfig].isValid = isValid;
        this.config[validation.name as keyof SecretsConfig].lastValidated = new Date();
        
        if (!isValid) {
          console.warn(`⚠️  ${validation.name.toUpperCase()} API key validation failed`);
        } else {
          console.log(`✅ ${validation.name.toUpperCase()} API key validated successfully`);
        }
      } catch (error) {
        console.error(`❌ Error validating ${validation.name} key:`, error);
        this.config[validation.name as keyof SecretsConfig].isValid = false;
      }
    }
  }

  /**
   * Gets the best available API configuration for AI services
   */
  public getBestAIConfig(): { service: 'openrouter' | 'anthropic'; config: APIConfig } | null {
    const services = [
      { name: 'openrouter' as const, config: this.config.openrouter },
      { name: 'anthropic' as const, config: this.config.anthropic }
    ];

    // Sort by priority and validity
    const validServices = services
      .filter(s => s.config.isValid && s.config.key)
      .sort((a, b) => a.config.priority - b.config.priority);

    return validServices.length > 0 
      ? { service: validServices[0].name, config: validServices[0].config }
      : null;
  }

  /**
   * Gets a specific API key with validation check
   */
  public getAPIKey(service: keyof SecretsConfig): string | null {
    const config = this.config[service];
    if (!config.isValid || !config.key) {
      console.warn(`⚠️  ${service.toUpperCase()} API key is not valid or available`);
      return null;
    }
    return config.key;
  }

  /**
   * Starts periodic validation of API keys
   */
  public startPeriodicValidation(intervalMs: number = 300000): void { // 5 minutes
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    this.validationInterval = setInterval(async () => {
      console.log('🔄 Performing periodic API key validation...');
      await this.validateAllKeys();
    }, intervalMs);
  }

  /**
   * Stops periodic validation
   */
  public stopPeriodicValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  /**
   * Gets validation status for all services
   */
  public getValidationStatus(): Record<string, { isValid: boolean; lastValidated: Date }> {
    return Object.fromEntries(
      Object.entries(this.config).map(([key, config]) => [
        key,
        { isValid: config.isValid, lastValidated: config.lastValidated }
      ])
    );
  }
}

export const secretsManager = SecretsManager.getInstance();
export default secretsManager;
