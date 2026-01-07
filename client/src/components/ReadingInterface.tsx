import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Settings, Moon, Sun, Palette } from 'lucide-react';
import { Document } from '@/types';

interface ReadingInterfaceProps {
  document: Document;
  onBack: () => void;
}

type DocumentType = Document;

type FontFamily = 'serif' | 'sans-serif';
type Theme = 'light' | 'dark' | 'sepia';

export default function ReadingInterface({ document, onBack }: ReadingInterfaceProps) {
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [theme, setTheme] = useState<Theme>('light');
  const [showSettings, setShowSettings] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auto-detect theme based on time
  useEffect(() => {
    const hour = new Date().getHours();
    const autoTheme = hour >= 20 || hour < 6 ? 'dark' : 'light';
    setTheme(autoTheme);
  }, []);

  // Handle scroll for zen mode and progress
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const docHeight = target.scrollHeight - target.clientHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrolled);
    };

    const contentArea = globalThis.document?.getElementById('reading-content');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
      return () => contentArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-[#121212]',
          text: 'text-[#e0e0e0]',
          header: 'bg-[#1e1e1e] border-b border-[#333]',
        };
      case 'sepia':
        return {
          bg: 'bg-[#F8F1E3]',
          text: 'text-[#3e3e3e]',
          header: 'bg-[#f0e8d8] border-b border-[#ddd]',
        };
      default:
        return {
          bg: 'bg-white',
          text: 'text-[#333]',
          header: 'bg-gray-50 border-b border-gray-200',
        };
    }
  };

  const getFontFamily = () => {
    return fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`flex flex-col h-screen ${themeStyles.bg} ${themeStyles.text}`}>
      {/* Header */}
      <div
        className={`${themeStyles.header} ${isZenMode ? 'translate-y-full' : 'translate-y-0'} transition-transform duration-300 sticky top-0 z-40 px-6 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg truncate">{document.title}</h1>
            <p className="text-xs opacity-60">
              {document.readingTime} min read • {Math.round(document.readingProgress || 0)}% complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className={`mx-6 mt-4 p-4 space-y-4 ${theme === 'dark' ? 'bg-[#1e1e1e]' : theme === 'sepia' ? 'bg-[#f0e8d8]' : 'bg-gray-50'}`}>
          {/* Font Selection */}
          <div>
            <label className="text-sm font-medium block mb-2">Font</label>
            <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as FontFamily)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                <SelectItem value="sans-serif">Sans-serif (Inter)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium block mb-2">Font Size: {fontSize}px</label>
            <Slider
              value={[fontSize]}
              onValueChange={([v]) => setFontSize(v)}
              min={14}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Line Height */}
          <div>
            <label className="text-sm font-medium block mb-2">Line Height: {lineHeight.toFixed(1)}</label>
            <Slider
              value={[lineHeight * 10]}
              onValueChange={([v]) => setLineHeight(v / 10)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium block mb-2">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'sepia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('sepia')}
                className="flex-1"
              >
                <Palette className="w-4 h-4 mr-2" />
                Sepia
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          {/* Zen Mode */}
          <div>
            <Button
              variant={isZenMode ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setIsZenMode(!isZenMode)}
            >
              {isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
            </Button>
          </div>
        </Card>
      )}

      {/* Reading Content */}
      <div
        id="reading-content"
        className="flex-1 overflow-y-auto px-6 py-8"
      >
        <div
          className={`max-w-2xl mx-auto prose prose-base ${getFontFamily()}`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            color: themeStyles.text,
          }}
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 w-full">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reading Time Indicator */}
      <div className={`${themeStyles.header} px-6 py-3 text-center text-sm`}>
        {Math.max(0, Math.ceil((document.readingTime || 5) * (1 - scrollProgress / 100)))} min remaining
      </div>
    </div>
  );
}
