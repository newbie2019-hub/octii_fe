import { useState, useCallback } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Predefined color palette for quick selection
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#A855F7', // Violet
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, className, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const handleColorChange = useCallback(
    (color: string) => {
      // Ensure the color is uppercase for consistency
      onChange(color.toUpperCase());
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (color: string) => {
      onChange(color);
    },
    [onChange]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Preset Colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => handlePresetClick(color)}
            className={cn(
              'size-8 rounded-full transition-all border-2 border-transparent',
              'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              value?.toUpperCase() === color.toUpperCase() &&
                'ring-2 ring-offset-2 ring-primary scale-110'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Custom Color Picker */}
      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-10 gap-2 px-3 font-normal"
            >
              <div
                className="size-5 rounded-md border border-border shadow-sm"
                style={{ backgroundColor: value || '#3B82F6' }}
              />
              <span className="text-muted-foreground">Custom color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              {/* Color Picker Area */}
              <HexColorPicker
                color={value || '#3B82F6'}
                onChange={handleColorChange}
                className="!w-full"
              />

              {/* Hex Input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">#</span>
                <HexColorInput
                  color={value || '#3B82F6'}
                  onChange={handleColorChange}
                  prefixed={false}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring uppercase font-mono"
                  placeholder="3B82F6"
                />
              </div>

              {/* Current Color Preview */}
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                <div
                  className="size-10 rounded-md border border-border shadow-sm"
                  style={{ backgroundColor: value || '#3B82F6' }}
                />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Selected</span>
                  <span className="text-sm font-mono font-medium">
                    {(value || '#3B82F6').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

