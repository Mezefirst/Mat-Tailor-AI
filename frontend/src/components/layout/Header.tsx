import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Atom } from '@phosphor-icons/react';
import { useTranslation, languageOptions } from '@/lib/i18n';

export function Header() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Atom size={32} className="text-primary" weight="duotone" />
              <h1 className="text-2xl font-bold text-foreground">{t.header.title}</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {t.header.subtitle}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.flag}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
