// Language Settings Component
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Translate, Check } from '@phosphor-icons/react';
import { useTranslation, languageOptions } from '@/lib/i18n';
import { toast } from 'sonner';

export function LanguageSettings() {
  const { t, language, setLanguage } = useTranslation();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    toast.success(t.common.success, {
      description: `Language changed to ${languageOptions.find(l => l.value === newLanguage)?.label}`,
    });
  };

  const testLanguage = (lang: string) => {
    const testTranslation = languageOptions.find(l => l.value === lang);
    toast.info(t.common.info, {
      description: `Testing ${testTranslation?.label}: ${testTranslation?.flag}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Translate className="w-5 h-5" />
            {t.settings.language}
          </CardTitle>
          <CardDescription>
            {t.settings.selectLanguage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.settings.selectLanguage}
              </label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.settings.selectLanguage} />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.flag}</span>
                        <span>{option.label}</span>
                        {language === option.value && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Language Testing</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Test how the interface adapts to different languages. Click any language below to see a preview.
              </p>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={language === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => testLanguage(option.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                    {language === option.value && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Language Coverage</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Full Translation</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">🇺🇸 English</Badge>
                    <Badge variant="outline">🇸🇪 Svenska</Badge>
                    <Badge variant="outline">🇩🇪 Deutsch</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Translate className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Partial Translation</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">🇫🇷 Français</Badge>
                    <Badge variant="outline">🇪🇹 አማርኛ</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Regional Settings</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Language selection affects material databases and supplier information for your region.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Swedish:</span>
                  <span className="text-muted-foreground">European suppliers, metric units</span>
                </div>
                <div className="flex justify-between">
                  <span>German:</span>
                  <span className="text-muted-foreground">REACH compliance, DIN standards</span>
                </div>
                <div className="flex justify-between">
                  <span>French:</span>
                  <span className="text-muted-foreground">AFNOR standards, EU regulations</span>
                </div>
                <div className="flex justify-between">
                  <span>Amharic:</span>
                  <span className="text-muted-foreground">African suppliers, local materials</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
