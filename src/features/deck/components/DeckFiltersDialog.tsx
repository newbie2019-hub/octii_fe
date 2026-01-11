import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DeckFilterParams } from "../types/deck"
import { TagSelector } from "@/features/tag"

interface DeckFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: DeckFilterParams
  onApply: (filters: DeckFilterParams) => void
}

export function DeckFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
}: DeckFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<DeckFilterParams>(filters)

  // Convert comma-separated tag string to number array for TagSelector
  const selectedTagIds = useMemo(() => {
    if (!localFilters.tags) return []
    return localFilters.tags
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id))
  }, [localFilters.tags])

  // Handle tag selection change - convert back to comma-separated string
  const handleTagsChange = (tagIds: number[]) => {
    updateFilter("tags", tagIds.length > 0 ? tagIds.join(",") : undefined)
  }

  const handleApply = () => {
    // Clean up empty values
    const cleanedFilters: DeckFilterParams = {}

    if (localFilters.search?.trim()) {
      cleanedFilters.search = localFilters.search.trim()
    }
    if (localFilters.created_from) {
      cleanedFilters.created_from = localFilters.created_from
    }
    if (localFilters.created_to) {
      cleanedFilters.created_to = localFilters.created_to
    }
    if (
      localFilters.min_cards !== undefined &&
      localFilters.min_cards !== null
    ) {
      cleanedFilters.min_cards = localFilters.min_cards
    }
    if (
      localFilters.max_cards !== undefined &&
      localFilters.max_cards !== null
    ) {
      cleanedFilters.max_cards = localFilters.max_cards
    }
    if (localFilters.tags?.trim()) {
      cleanedFilters.tags = localFilters.tags.trim()
    }
    if (localFilters.studied !== undefined) {
      cleanedFilters.studied = localFilters.studied
    }
    if (localFilters.last_studied_from) {
      cleanedFilters.last_studied_from = localFilters.last_studied_from
    }
    if (localFilters.last_studied_to) {
      cleanedFilters.last_studied_to = localFilters.last_studied_to
    }

    onApply(cleanedFilters)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalFilters({})
  }

  const updateFilter = <K extends keyof DeckFilterParams>(
    key: K,
    value: DeckFilterParams[K],
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filter Decks</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your deck list
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Created Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Created Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                placeholder="From"
                value={
                  localFilters.created_from
                    ? new Date(localFilters.created_from)
                    : undefined
                }
                onChange={(date) =>
                  updateFilter(
                    "created_from",
                    date ? format(date, "yyyy-MM-dd") : undefined,
                  )
                }
              />
              <DatePicker
                placeholder="To"
                value={
                  localFilters.created_to
                    ? new Date(localFilters.created_to)
                    : undefined
                }
                onChange={(date) =>
                  updateFilter(
                    "created_to",
                    date ? format(date, "yyyy-MM-dd") : undefined,
                  )
                }
              />
            </div>
          </div>

          {/* Card Count Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Number of Cards</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                value={localFilters.min_cards ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "min_cards",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max"
                min={0}
                value={localFilters.max_cards ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "max_cards",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onChange={handleTagsChange}
              placeholder="Select tags to filter..."
              allowCreate={true}
              allowDelete={true}
            />
          </div>

          {/* Study Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Study Status</Label>
            <Select
              value={
                localFilters.studied === undefined
                  ? "all"
                  : localFilters.studied
                  ? "studied"
                  : "unstudied"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  updateFilter("studied", undefined)
                } else {
                  updateFilter("studied", value === "studied")
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All decks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All decks</SelectItem>
                <SelectItem value="studied">Studied</SelectItem>
                <SelectItem value="unstudied">Not studied yet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Last Studied Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Last Studied Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                placeholder="From"
                value={
                  localFilters.last_studied_from
                    ? new Date(localFilters.last_studied_from)
                    : undefined
                }
                onChange={(date) =>
                  updateFilter(
                    "last_studied_from",
                    date ? format(date, "yyyy-MM-dd") : undefined,
                  )
                }
              />
              <DatePicker
                placeholder="To"
                value={
                  localFilters.last_studied_to
                    ? new Date(localFilters.last_studied_to)
                    : undefined
                }
                onChange={(date) =>
                  updateFilter(
                    "last_studied_to",
                    date ? format(date, "yyyy-MM-dd") : undefined,
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="sm:mr-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Internal DatePicker component
function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  )
}
