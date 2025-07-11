
/**
 * Optimized centralized secrets management service
 * Enhanced performance, stability, and resource management
 */

interface APIConfig {
  key: string;
  isValid: boolean;
  lastValidated: Date;
  priority: number;
  validationInProgress: boolean;
}

interface SecretsConfig {
  openrouter: APIConfig;
  anthropic: APIConfig;
  database: APIConfig;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  duration: number;
}

type ServiceName = keyof SecretsConfig;

class SecretsManager {
  private static instance: SecretsManager;
  private config: SecretsConfig;
  private validationInterval: NodeJS.Timeout | null = null;
  private validationCache: Map<string, ValidationResult> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute cache
  private readonly VALIDATION_TIMEOUT = 8000; // 8 seconds
  private readonly MIN_VALIDATION_INTERVAL = 180000; // 3 minutes minimum

  private constructor() {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    this.config = {
      openrouter: {
        key: process.env.OPENROUTER_API_KEY || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 1,
        validationInProgress: false
      },
      anthropic: {
        key: process.env.ANTHROPIC_API_KEY || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 2,
        validationInProgress: false
      },
      database: {
        key: process.env.DATABASE_URL || '',
        isValid: false,
        lastValidated: new Date(0),
        priority: 3,
        validationInProgress: false
      }
    };
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  private getCacheKey(service: ServiceName, key: string): string {
    return `${service}:${key.slice(0, 8)}`;
  }

  private isValidationCached(service: ServiceName, key: string): ValidationResult | null {
    const cacheKey = this.getCacheKey(service, key);
    const cached = this.validationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.duration < this.CACHE_TTL) {
      return cached;
    }
    
    return null;
  }

  private setCacheResult(service: ServiceName, key: string, result: ValidationResult): void {
    const cacheKey = this.getCacheKey(service, key);
    this.validationCache.set(cacheKey, { ...result, duration: Date.now() });
  }

  private async validateWithTimeout<T>(
    validateFn: () => Promise<T>,
    timeout: number = this.VALIDATION_TIMEOUT
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), timeout);
    });

    return Promise.race([validateFn(), timeoutPromise]);
  }

  private async validateOpenRouterKey(key: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    if (!key?.trim()) {
      return { isValid: false, error: 'Empty key', duration: Date.now() - startTime };
    }

    try {
      const result = await this.validateWithTimeout(async () => {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'http://localhost:5000',
            'User-Agent': 'CodeChat/1.0'
          },
          signal: AbortSignal.timeout(this.VALIDATION_TIMEOUT)
        });
        return response.ok;
      });

      return { isValid: result, duration: Date.now() - startTime };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { isValid: false, error: errorMessage, duration: Date.now() - startTime };
    }
  }

  private async validateAnthropicKey(key: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    if (!key?.trim()) {
      return { isValid: false, error: 'Empty key', duration: Date.now() - startTime };
    }

    try {
      const result = await this.validateWithTimeout(async () => {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'User-Agent': 'CodeChat/1.0'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          }),
          signal: AbortSignal.timeout(this.VALIDATION_TIMEOUT)
        });
        return response.status !== 401;
      });

      return { isValid: result, duration: Date.now() - startTime };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { isValid: false, error: errorMessage, duration: Date.now() - startTime };
    }
  }

  private async validateDatabaseKey(key: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    if (!key) {
      return { isValid: false, error: 'Empty key', duration: Date.now() - startTime };
    }

    const isValid = key.startsWith('postgres://') || key.startsWith('postgresql://');
    return { isValid, duration: Date.now() - startTime };
  }

  private async validateSingleKey(service: ServiceName): Promise<void> {
    const serviceConfig = this.config[service];
    
    if (serviceConfig.validationInProgress) {
      console.log(`⏳ Validation already in progress for ${service.toUpperCase()}`);
      return;
    }

    const cached = this.isValidationCached(service, serviceConfig.key);
    if (cached) {
      serviceConfig.isValid = cached.isValid;
      serviceConfig.lastValidated = new Date();
      return;
    }

    serviceConfig.validationInProgress = true;

    try {
      let result: ValidationResult;
      
      switch (service) {
        case 'openrouter':
          result = await this.validateOpenRouterKey(serviceConfig.key);
          break;
        case 'anthropic':
          result = await this.validateAnthropicKey(serviceConfig.key);
          break;
        case 'database':
          result = await this.validateDatabaseKey(serviceConfig.key);
          break;
        default:
          result = { isValid: false, error: 'Unknown service', duration: 0 };
      }

      serviceConfig.isValid = result.isValid;
      serviceConfig.lastValidated = new Date();
      
      this.setCacheResult(service, serviceConfig.key, result);

      const status = result.isValid ? '✅' : '⚠️';
      const message = result.error ? ` (${result.error})` : '';
      console.log(`${status} ${service.toUpperCase()} validation completed in ${result.duration}ms${message}`);
      
    } catch (error) {
      console.error(`❌ Critical error validating ${service}:`, error);
      serviceConfig.isValid = false;
    } finally {
      serviceConfig.validationInProgress = false;
    }
  }

  public async validateAllKeys(): Promise<void> {
    const services: ServiceName[] = ['openrouter', 'anthropic', 'database'];
    
    // Validate in parallel for better performance
    const validationPromises = services.map(service => this.validateSingleKey(service));
    await Promise.allSettled(validationPromises);
  }

  public getBestAIConfig(): { service: 'openrouter' | 'anthropic'; config: APIConfig } | null {
    const aiServices = [
      { name: 'openrouter' as const, config: this.config.openrouter },
      { name: 'anthropic' as const, config: this.config.anthropic }
    ];

    const validServices = aiServices
      .filter(s => s.config.isValid && s.config.key && !s.config.validationInProgress)
      .sort((a, b) => a.config.priority - b.config.priority);

    return validServices.length > 0 
      ? { service: validServices[0].name, config: validServices[0].config }
      : null;
  }

  public getAPIKey(service: ServiceName): string | null {
    const config = this.config[service];
    if (!config.isValid || !config.key) {
      return null;
    }
    return config.key;
  }

  public startPeriodicValidation(intervalMs: number = this.MIN_VALIDATION_INTERVAL): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    // Ensure minimum interval to prevent excessive API calls
    const safeInterval = Math.max(intervalMs, this.MIN_VALIDATION_INTERVAL);
    
    this.validationInterval = setInterval(async () => {
      console.log('🔄 Performing periodic API key validation...');
      await this.validateAllKeys();
    }, safeInterval);
  }

  public stopPeriodicValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  public getValidationStatus(): Record<string, { isValid: boolean; lastValidated: Date; validationInProgress: boolean }> {
    return Object.fromEntries(
      Object.entries(this.config).map(([key, config]) => [
        key,
        { 
          isValid: config.isValid, 
          lastValidated: config.lastValidated,
          validationInProgress: config.validationInProgress
        }
      ])
    );
  }

  public forceRefresh(): void {
    this.validationCache.clear();
    this.initializeConfig();
  }

  public cleanup(): void {
    this.stopPeriodicValidation();
    this.validationCache.clear();
  }
}

export const secretsManager = SecretsManager.getInstance();
export default secretsManager;
