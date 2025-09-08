/**
 * PWA service for managing Progressive Web App functionality
 * Handles service worker registration, offline detection, and app installation
 */

interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  
  constructor() {
    this.init();
  }
  
  /**
   * Initialize PWA service
   */
  private async init(): Promise<void> {
    // Check if already installed
    this.checkIfInstalled();
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Listen for install prompt
    this.listenForInstallPrompt();
    
    // Listen for online/offline changes
    this.listenForConnectionChanges();
    
    // Listen for app installed event
    this.listenForAppInstalled();
  }
  
  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        
        // Listen for updates
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorkerRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
        
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
  
  /**
   * Check if app is already installed
   */
  private checkIfInstalled(): void {
    // Check if running in standalone mode (installed PWA)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     (navigator as any).standalone === true;
  }
  
  /**
   * Listen for beforeinstallprompt event
   */
  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.showInstallBanner();
    });
  }
  
  /**
   * Listen for connection changes
   */
  private listenForConnectionChanges(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification('Connection restored', 'You\'re back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('Working offline', 'Some features may be limited', 'warning');
    });
  }
  
  /**
   * Listen for app installed event
   */
  private listenForAppInstalled(): void {
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallBanner();
      this.showNotification('App installed!', 'MatTailor AI has been added to your device', 'success');
    });
  }
  
  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    
    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }
  
  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return !this.isInstalled && this.deferredPrompt !== null;
  }
  
  /**
   * Check if app is installed
   */
  isAppInstalled(): boolean {
    return this.isInstalled;
  }
  
  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }
  
  /**
   * Show install banner
   */
  private showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:w-96';
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <h3 class="font-medium">Install MatTailor AI</h3>
          <p class="text-sm opacity-90">Get instant access and work offline</p>
        </div>
        <button id="install-button" class="bg-white text-primary px-3 py-1 rounded text-sm font-medium">
          Install
        </button>
        <button id="dismiss-button" class="text-primary-foreground opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    `;
    
    // Add event listeners
    banner.querySelector('#install-button')?.addEventListener('click', () => {
      this.showInstallPrompt();
    });
    
    banner.querySelector('#dismiss-button')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
    
    document.body.appendChild(banner);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallBanner();
    }, 10000);
  }
  
  /**
   * Hide install banner
   */
  private hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }
  
  /**
   * Show update available notification
   */
  private showUpdateAvailableNotification(): void {
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.className = 'fixed top-4 right-4 bg-accent text-accent-foreground p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <h3 class="font-medium">Update Available</h3>
          <p class="text-sm opacity-90">A new version is ready to install</p>
        </div>
        <button id="update-button" class="bg-white text-accent px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
        <button id="dismiss-update-button" class="text-accent-foreground opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    `;
    
    // Add event listeners
    notification.querySelector('#update-button')?.addEventListener('click', () => {
      this.activateUpdate();
    });
    
    notification.querySelector('#dismiss-update-button')?.addEventListener('click', () => {
      notification.remove();
    });
    
    document.body.appendChild(notification);
  }
  
  /**
   * Activate service worker update
   */
  private async activateUpdate(): Promise<void> {
    if (this.serviceWorkerRegistration?.waiting) {
      this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
  
  /**
   * Show notification to user
   */
  private showNotification(title: string, message: string, type: 'success' | 'warning' | 'error'): void {
    // Use existing toast system if available
    if ((window as any).showToast) {
      (window as any).showToast(title, message, type);
      return;
    }
    
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
      <h3 class="font-medium">${title}</h3>
      <p class="text-sm">${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  /**
   * Cache material data for offline access
   */
  async cacheMaterial(material: any): Promise<void> {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.active?.postMessage({
        type: 'CACHE_MATERIAL',
        material
      });
    }
  }
  
  /**
   * Request persistent storage
   */
  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        console.log('Persistent storage:', granted ? 'granted' : 'denied');
        return granted;
      } catch (error) {
        console.error('Error requesting persistent storage:', error);
        return false;
      }
    }
    return false;
  }
  
  /**
   * Get storage estimate
   */
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        return await navigator.storage.estimate();
      } catch (error) {
        console.error('Error getting storage estimate:', error);
        return null;
      }
    }
    return null;
  }
}

// Create singleton instance
export const pwaService = new PWAService();
