import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StudyConfigSchema,
  type StudyConfigValues,
} from "../schemas/studySessionSchema";
import { useDueCount } from "../hooks/useDueCount";
import { useTags } from "@/features/tag";
import type { StudySessionConfig } from "../types/study-session";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BookOpen, Timer, Tag as TagIcon, Sparkles, Info, ChevronsUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreStudyConfigProps {
  deckId: number;
  deckName: string;
  onStart: (config: StudySessionConfig) => void;
  onCancel: () => void;
}

export function PreStudyConfig({
  deckId,
  deckName,
  onStart,
  onCancel,
}: PreStudyConfigProps) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const { data: dueData, isLoading: dueLoading } = useDueCount(
    deckId,
    selectedTags.length > 0 ? selectedTags : undefined
  );
  const { data: tags, isLoading: tagsLoading } = useTags();

  // Get selected tag objects for display
  const selectedTagObjects = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag) => selectedTags.includes(tag.id));
  }, [tags, selectedTags]);

  const form = useForm<StudyConfigValues>({
    resolver: zodResolver(StudyConfigSchema),
    defaultValues: {
      maxCards: 20,
      selectedTags: [],
      showIntervals: true,
    },
    mode: "onTouched",
  });

  const maxCards = form.watch("maxCards");

  // Calculate estimated time based on new vs review cards
  const estimatedMinutes = useMemo(() => {
    if (!dueData) return Math.ceil((maxCards * 12) / 60);

    const AVG_SECONDS_PER_CARD = {
      new: 15,
      review: 10,
    };

    // Cards are served due-first, then new
    const dueToStudy = Math.min(dueData.due_count, maxCards);
    const newToStudy = Math.min(dueData.new_count, maxCards - dueToStudy);

    const seconds =
      dueToStudy * AVG_SECONDS_PER_CARD.review +
      newToStudy * AVG_SECONDS_PER_CARD.new;

    return Math.max(1, Math.ceil(seconds / 60));
  }, [dueData, maxCards]);

  // Determine if this is a new deck (all new cards)
  const isNewDeck = dueData && dueData.due_count === 0 && dueData.new_count > 0;
  const totalAvailable = dueData?.total_available || 0;

  // Suggest conservative limits for new decks
  const suggestedLimit = useMemo(() => {
    if (!isNewDeck || !dueData) return null;

    const newCount = dueData.new_count;
    if (newCount < 50) return 10;
    if (newCount < 200) return 15;
    if (newCount < 1000) return 20;
    return 20;
  }, [isNewDeck, dueData]);

  const handleSubmit = (values: StudyConfigValues) => {
    onStart({
      deckId,
      deckName,
      maxCards: values.maxCards,
      selectedTags,
      showIntervals: values.showIntervals,
    });
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Study Setup</h1>
        <p className="text-muted-foreground">{deckName}</p>
      </div>

      <Card className="p-6">
        {/* Cards Available Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">Cards Available</span>
          </div>

          {dueLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : dueData ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              {isNewDeck ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">This deck is new!</span>
                  </div>
                  <div className="border-t border-dashed pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Cards:</span>
                      <span className="font-medium">{dueData.new_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Cards:</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Cards:</span>
                    <span className="font-medium">{dueData.due_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Cards:</span>
                    <span className="font-medium">{dueData.new_count}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{dueData.total_available}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No cards available</p>
          )}

          {/* New Deck Tip */}
          {isNewDeck && suggestedLimit && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Start with {suggestedLimit} new cards per session
                to avoid overwhelming yourself.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Card Limit */}
            <FormField
              control={form.control}
              name="maxCards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <span>How many cards?</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => field.onChange(10)}
                          className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent ${
                            field.value === 10
                              ? "border-primary bg-accent"
                              : ""
                          }`}
                        >
                          Quick review (10 cards)
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(20)}
                          className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent ${
                            field.value === 20
                              ? "border-primary bg-accent"
                              : ""
                          }`}
                        >
                          Standard session (20 cards)
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(50)}
                          className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent ${
                            field.value === 50
                              ? "border-primary bg-accent"
                              : ""
                          }`}
                        >
                          Extended session (50 cards)
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Custom:
                        </span>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="w-24"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Filter by Tags (optional)
                </span>
              </div>
              {tagsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : tags && tags.length > 0 ? (
                <div className="space-y-2">
                  <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={tagPopoverOpen}
                        className="w-full justify-between h-auto min-h-10 py-2"
                        type="button"
                      >
                        {selectedTags.length === 0 ? (
                          <span className="text-muted-foreground">Select tags to filter...</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {tags.map((tag) => (
                              <CommandItem
                                key={tag.id}
                                value={tag.name}
                                onSelect={() => {
                                  toggleTag(tag.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {tag.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Tags Display */}
                  {selectedTagObjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTagObjects.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag.name}</span>
                          </button>
                        </Badge>
                      ))}
                      {selectedTags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTags([])}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags available
                </p>
              )}
            </div>

            {/* Study Preferences */}
            <FormField
              control={form.control}
              name="showIntervals"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer !mt-0">
                      Show interval previews
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {totalAvailable === 0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    All caught up!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    No cards available for review right now.
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={totalAvailable === 0}
                  >
                    🎓 Start Study
                  </Button>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Estimated time: ~{estimatedMinutes} min</span>
                  </div>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                {totalAvailable === 0 ? "Back to Deck" : "Cancel"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}



