import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Upload,
  Loader2,
  X,
  Square,
  Circle,
  Trash2,
  Eye,
  EyeOff,
  Move,
  HelpCircle,
  Pencil,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { uploadService } from '@/common/services/uploadService';
import { toast } from 'sonner';
import type { OcclusionZone, OcclusionShape } from '@/features/card/types/card';

interface ImageOcclusionEditorProps {
  imageUrl: string | null;
  zones: OcclusionZone[];
  onImageChange: (url: string | null, filename: string | null) => void;
  onZonesChange: (zones: OcclusionZone[]) => void;
  disabled?: boolean;
}

type Tool = 'select' | 'rectangle' | 'ellipse' | 'freehand';

interface DragState {
  type: 'move' | 'resize';
  zoneId: string;
  startX: number;
  startY: number;
  originalZone: OcclusionZone;
  handle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
}

/**
 * ImageOcclusionEditor - Create image occlusion cards
 * Upload an image and draw shapes to hide parts of it
 * Supports rectangles, ellipses, and freehand drawing
 */
export function ImageOcclusionEditor({
  imageUrl,
  zones,
  onImageChange,
  onZonesChange,
  disabled = false,
}: ImageOcclusionEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('rectangle');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [previewZoneId, setPreviewZoneId] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    points?: { x: number; y: number }[];
  } | null>(null);

  // Drag/move/resize state
  const [dragState, setDragState] = useState<DragState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use local preview URL for display
  const displayUrl = localPreviewUrl || imageUrl;

  // Cleanup ref
  const localPreviewUrlRef = useRef<string | null>(null);
  localPreviewUrlRef.current = localPreviewUrl;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  // Clear local preview when parent resets imageUrl to null
  useEffect(() => {
    if (imageUrl === null && localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      setUploadedFilename(null);
    }
  }, [imageUrl, localPreviewUrl]);

  const generateId = () => `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const nextLabel = useMemo(() => {
    const usedLabels = zones.map(z => parseInt(z.label, 10)).filter(n => !isNaN(n));
    if (usedLabels.length === 0) return '1';
    return String(Math.max(...usedLabels) + 1);
  }, [zones]);

  // Get shape from tool
  const getShapeFromTool = (t: Tool): OcclusionShape => {
    switch (t) {
      case 'ellipse': return 'ellipse';
      case 'freehand': return 'freehand';
      default: return 'rectangle';
    }
  };

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(previewUrl);

      const response = await uploadService.uploadToTemp(file, 'image');
      setUploadedFilename(response.data.filename);
      onImageChange(response.data.url, response.data.filename);
      onZonesChange([]);
    } catch {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange, onZonesChange, localPreviewUrl]);

  const handleRemoveImage = useCallback(async () => {
    if (uploadedFilename) {
      try {
        await uploadService.deleteTempFile(uploadedFilename);
      } catch {
        // Ignore
      }
    }
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setUploadedFilename(null);
    onImageChange(null, null);
    onZonesChange([]);
  }, [uploadedFilename, localPreviewUrl, onImageChange, onZonesChange]);

  const getRelativePosition = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const pos = getRelativePosition(e);
    if (!pos) return;

    // If in select mode and not clicking a zone, clear selection
    if (tool === 'select') {
      // Selection handled by zone click
      return;
    }

    // Start drawing
    setIsDrawing(true);
    setDrawStart(pos);

    if (tool === 'freehand') {
      setCurrentShape({ x: pos.x, y: pos.y, width: 0, height: 0, points: [pos] });
    } else {
      setCurrentShape({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  }, [tool, disabled, getRelativePosition]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getRelativePosition(e);
    if (!pos) return;

    // Handle zone dragging/resizing
    if (dragState) {
      e.preventDefault();
      const deltaX = pos.x - dragState.startX;
      const deltaY = pos.y - dragState.startY;

      if (dragState.type === 'move') {
        const newX = Math.max(0, Math.min(100 - dragState.originalZone.width, dragState.originalZone.x + deltaX));
        const newY = Math.max(0, Math.min(100 - dragState.originalZone.height, dragState.originalZone.y + deltaY));

        onZonesChange(zones.map(z =>
          z.id === dragState.zoneId
            ? { ...z, x: newX, y: newY }
            : z
        ));
      } else if (dragState.type === 'resize' && dragState.handle) {
        const oz = dragState.originalZone;
        let newX = oz.x;
        let newY = oz.y;
        let newWidth = oz.width;
        let newHeight = oz.height;

        // Handle resize based on which handle is being dragged
        if (dragState.handle.includes('w')) {
          newX = Math.max(0, Math.min(oz.x + oz.width - 5, oz.x + deltaX));
          newWidth = oz.width - (newX - oz.x);
        }
        if (dragState.handle.includes('e')) {
          newWidth = Math.max(5, Math.min(100 - oz.x, oz.width + deltaX));
        }
        if (dragState.handle.includes('n')) {
          newY = Math.max(0, Math.min(oz.y + oz.height - 5, oz.y + deltaY));
          newHeight = oz.height - (newY - oz.y);
        }
        if (dragState.handle.includes('s')) {
          newHeight = Math.max(5, Math.min(100 - oz.y, oz.height + deltaY));
        }

        onZonesChange(zones.map(z =>
          z.id === dragState.zoneId
            ? { ...z, x: newX, y: newY, width: newWidth, height: newHeight }
            : z
        ));
      }
      return;
    }

    // Handle drawing
    if (!isDrawing || !drawStart) return;

    if (tool === 'freehand') {
      setCurrentShape(prev => {
        if (!prev) return prev;
        const points = [...(prev.points || []), pos];
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
          points,
        };
      });
    } else {
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      const width = Math.abs(pos.x - drawStart.x);
      const height = Math.abs(pos.y - drawStart.y);
      setCurrentShape({ x, y, width, height });
    }
  }, [dragState, isDrawing, drawStart, tool, getRelativePosition, zones, onZonesChange]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // End drag
    if (dragState) {
      setDragState(null);
      return;
    }

    // End drawing
    if (!isDrawing || !currentShape) {
      setIsDrawing(false);
      return;
    }

    // Only create zone if it has meaningful size
    const minSize = tool === 'freehand' ? 1 : 2;
    if (currentShape.width > minSize && currentShape.height > minSize) {
      const newZone: OcclusionZone = {
        id: generateId(),
        x: currentShape.x,
        y: currentShape.y,
        width: currentShape.width,
        height: currentShape.height,
        label: nextLabel,
        shape: getShapeFromTool(tool),
        ...(tool === 'freehand' && currentShape.points && { points: currentShape.points }),
      };
      onZonesChange([...zones, newZone]);
      setSelectedZoneId(newZone.id);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentShape(null);
  }, [dragState, isDrawing, currentShape, tool, zones, nextLabel, onZonesChange]);

  // Start moving a zone
  const handleZoneMouseDown = useCallback((e: React.MouseEvent, zone: OcclusionZone) => {
    if (tool !== 'select' || disabled) return;
    e.stopPropagation();

    const pos = getRelativePosition(e);
    if (!pos) return;

    setSelectedZoneId(zone.id);
    setDragState({
      type: 'move',
      zoneId: zone.id,
      startX: pos.x,
      startY: pos.y,
      originalZone: { ...zone },
    });
  }, [tool, disabled, getRelativePosition]);

  // Start resizing a zone
  const handleResizeMouseDown = useCallback((
    e: React.MouseEvent,
    zone: OcclusionZone,
    handle: DragState['handle']
  ) => {
    if (tool !== 'select' || disabled) return;
    e.stopPropagation();

    const pos = getRelativePosition(e);
    if (!pos) return;

    setDragState({
      type: 'resize',
      zoneId: zone.id,
      startX: pos.x,
      startY: pos.y,
      originalZone: { ...zone },
      handle,
    });
  }, [tool, disabled, getRelativePosition]);

  const deleteZone = useCallback((zoneId: string) => {
    onZonesChange(zones.filter(z => z.id !== zoneId));
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
    if (previewZoneId === zoneId) setPreviewZoneId(null);
  }, [zones, selectedZoneId, previewZoneId, onZonesChange]);

  const updateZoneLabel = useCallback((zoneId: string, label: string) => {
    onZonesChange(zones.map(z => z.id === zoneId ? { ...z, label } : z));
  }, [zones, onZonesChange]);

  const handleCanvasClick = useCallback(() => {
    if (tool === 'select') {
      setSelectedZoneId(null);
    }
  }, [tool]);

  // Render zone shape
  const renderZoneShape = (zone: OcclusionZone, isPreview = false, isCurrent = false) => {
    const shape = zone.shape || 'rectangle';
    const baseClasses = cn(
      'absolute transition-colors',
      isCurrent
        ? 'border-2 border-dashed border-primary bg-primary/30 pointer-events-none'
        : previewZoneId === zone.id
          ? 'bg-primary/90 border-2 border-primary'
          : 'bg-primary/60 border-2 border-primary hover:bg-primary/70',
      !isCurrent && selectedZoneId === zone.id && 'ring-2 ring-white ring-offset-2',
      !isCurrent && tool === 'select' && 'cursor-move'
    );

    const style: React.CSSProperties = {
      left: `${zone.x}%`,
      top: `${zone.y}%`,
      width: `${zone.width}%`,
      height: `${zone.height}%`,
    };

    if (shape === 'ellipse') {
      return (
        <div
          key={zone.id}
          className={baseClasses}
          style={{ ...style, borderRadius: '50%' }}
          onMouseDown={!isCurrent ? (e) => handleZoneMouseDown(e, zone) : undefined}
        >
          {!isCurrent && (
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md">
              {zone.label}
            </span>
          )}
          {!isCurrent && selectedZoneId === zone.id && tool === 'select' && (
            <ResizeHandles zone={zone} onResizeStart={handleResizeMouseDown} />
          )}
        </div>
      );
    }

    if (shape === 'freehand' && zone.points && zone.points.length > 2) {
      // SVG path for freehand
      const pathData = zone.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ') + ' Z';

      return (
        <svg
          key={zone.id}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={pathData}
            className={cn(
              isCurrent ? 'fill-primary/30 stroke-primary' : 'fill-primary/60 stroke-primary',
              previewZoneId === zone.id && 'fill-primary/90'
            )}
            strokeWidth="0.5"
            strokeDasharray={isCurrent ? '2,2' : undefined}
            style={{ pointerEvents: isCurrent ? 'none' : 'auto', cursor: tool === 'select' ? 'move' : 'default' }}
            onMouseDown={!isCurrent ? (e) => handleZoneMouseDown(e as unknown as React.MouseEvent, zone) : undefined}
          />
          {!isCurrent && (
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-bold text-[4px] drop-shadow-md pointer-events-none"
            >
              {zone.label}
            </text>
          )}
        </svg>
      );
    }

    // Rectangle (default)
    return (
      <div
        key={zone.id}
        className={baseClasses}
        style={style}
        onMouseDown={!isCurrent ? (e) => handleZoneMouseDown(e, zone) : undefined}
      >
        {!isCurrent && (
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md">
            {zone.label}
          </span>
        )}
        {!isCurrent && selectedZoneId === zone.id && tool === 'select' && (
          <ResizeHandles zone={zone} onResizeStart={handleResizeMouseDown} />
        )}
      </div>
    );
  };

  // Get cursor based on tool
  const getCursor = () => {
    if (dragState?.type === 'move') return 'grabbing';
    if (dragState?.type === 'resize') {
      const h = dragState.handle;
      if (h === 'nw' || h === 'se') return 'nwse-resize';
      if (h === 'ne' || h === 'sw') return 'nesw-resize';
      if (h === 'n' || h === 's') return 'ns-resize';
      if (h === 'e' || h === 'w') return 'ew-resize';
    }
    if (tool === 'select') return 'default';
    return 'crosshair';
  };

  if (!displayUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Image Occlusion</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload an image to hide parts of it for recall testing
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <HelpCircle className="h-3.5 w-3.5" />
                How it works
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm" align="end">
              <div className="space-y-3">
                <p className="font-medium">Image Occlusion Cards</p>
                <p className="text-muted-foreground">
                  Draw shapes over parts of an image you want to memorize. Each shape creates a card where that part is hidden.
                </p>
                <p className="text-muted-foreground">
                  Great for diagrams, maps, anatomy, and visual information.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <label
          className={cn(
            'flex flex-col items-center justify-center gap-4 p-12',
            'border-2 border-dashed rounded-lg cursor-pointer transition-all',
            'hover:border-primary/50 hover:bg-muted/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop an image here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or GIF (max 10MB)
                </p>
              </div>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Image Occlusion</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Draw shapes to mark areas to hide
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="h-8 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-1 p-1 bg-background rounded-md">
          {/* Select tool */}
          <button
            type="button"
            onClick={() => setTool('select')}
            disabled={disabled}
            title="Select & Move (V)"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all',
              tool === 'select'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Move className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Rectangle tool */}
          <button
            type="button"
            onClick={() => setTool('rectangle')}
            disabled={disabled}
            title="Rectangle (R)"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all',
              tool === 'rectangle'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Square className="h-3.5 w-3.5" />
          </button>

          {/* Ellipse tool */}
          <button
            type="button"
            onClick={() => setTool('ellipse')}
            disabled={disabled}
            title="Ellipse / Circle (E)"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all',
              tool === 'ellipse'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Circle className="h-3.5 w-3.5" />
          </button>

          {/* Freehand tool */}
          <button
            type="button"
            onClick={() => setTool('freehand')}
            disabled={disabled}
            title="Freehand (F)"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all',
              tool === 'freehand'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">
          {zones.length} zone{zones.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image Canvas */}
      <div
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden bg-muted/30 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ cursor: getCursor() }}
      >
        <img
          ref={imageRef}
          src={displayUrl}
          alt="Image for occlusion"
          className="w-full h-auto select-none pointer-events-none"
          draggable={false}
        />

        {/* Existing Zones */}
        {zones.map((zone) => renderZoneShape(zone))}

        {/* Current Drawing Shape */}
        {currentShape && currentShape.width > 0 && currentShape.height > 0 && (
          renderZoneShape({
            id: 'current',
            x: currentShape.x,
            y: currentShape.y,
            width: currentShape.width,
            height: currentShape.height,
            label: '',
            shape: getShapeFromTool(tool),
            points: currentShape.points,
          }, false, true)
        )}
      </div>

      {/* Zone List */}
      {zones.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Occlusion Zones</Label>
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer',
                    selectedZoneId === zone.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {/* Shape indicator */}
                    <div className="p-1.5 rounded bg-muted">
                      {zone.shape === 'ellipse' ? (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      ) : zone.shape === 'freehand' ? (
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Square className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      value={zone.label}
                      onChange={(e) => updateZoneLabel(zone.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 h-8 text-center text-sm font-medium"
                      disabled={disabled}
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(zone.x)}%, {Math.round(zone.y)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewZoneId(previewZoneId === zone.id ? null : zone.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {previewZoneId === zone.id ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteZone(zone.id);
                      }}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Instructions */}
      {zones.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Select a shape tool and draw on the image to create occlusion zones
        </p>
      )}
    </div>
  );
}

// Resize handles component
interface ResizeHandlesProps {
  zone: OcclusionZone;
  onResizeStart: (e: React.MouseEvent, zone: OcclusionZone, handle: DragState['handle']) => void;
}

function ResizeHandles({ zone, onResizeStart }: ResizeHandlesProps) {
  const handles: { position: DragState['handle']; style: React.CSSProperties; cursor: string }[] = [
    { position: 'nw', style: { top: -4, left: -4 }, cursor: 'nwse-resize' },
    { position: 'n', style: { top: -4, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { position: 'ne', style: { top: -4, right: -4 }, cursor: 'nesw-resize' },
    { position: 'w', style: { top: '50%', left: -4, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { position: 'e', style: { top: '50%', right: -4, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { position: 'sw', style: { bottom: -4, left: -4 }, cursor: 'nesw-resize' },
    { position: 's', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { position: 'se', style: { bottom: -4, right: -4 }, cursor: 'nwse-resize' },
  ];

  return (
    <>
      {handles.map(({ position, style, cursor }) => (
        <div
          key={position}
          className="absolute w-2 h-2 bg-white border-2 border-primary rounded-sm"
          style={{ ...style, cursor }}
          onMouseDown={(e) => onResizeStart(e, zone, position)}
        />
      ))}
    </>
  );
}

export default ImageOcclusionEditor;
