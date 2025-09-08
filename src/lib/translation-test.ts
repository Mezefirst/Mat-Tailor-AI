// Language testing utilities
import { translations, Language } from '@/lib/i18n';

// Test function to verify translations are working
export function testTranslations() {
  const testKeys = [
    'tabs.overview',
    'tabs.newMaterial', 
    'common.search',
    'header.title',
    'settings.language'
  ];
  
  const results: Record<Language, Record<string, string>> = {} as any;
  
  Object.entries(translations).forEach(([lang, t]) => {
    results[lang as Language] = {};
    testKeys.forEach(key => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], t as any);
      results[lang as Language][key] = value || 'MISSING';
    });
  });
  
  return results;
}

// Console demo function
export function demoLanguageSwitch() {
  console.log('=== MatTailor AI Language Demo ===');
  
  const testResult = testTranslations();
  
  Object.entries(testResult).forEach(([lang, translations]) => {
    console.log(`\n${lang.toUpperCase()}:`);
    Object.entries(translations).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  });
  
  console.log('\n=== Available Languages ===');
  console.log('English (en) - Full support');
  console.log('Svenska (sv) - Full support');
  console.log('Deutsch (de) - Full support');
  console.log('Français (fr) - Full support');
  console.log('አማርኛ (am) - Full support');
}
