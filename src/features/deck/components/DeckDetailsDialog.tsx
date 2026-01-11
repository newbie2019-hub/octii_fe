import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Deck } from '../types/deck';
import { CardList } from '@/features/card';
import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  Folder,
  BookOpen,
  Sparkles,
  Clock,
  GraduationCap,
  AlertCircle,
  Pause,
  RotateCcw,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface DeckDetailsDialogProps {
  deck: Deck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeckDetailsDialog({ deck, open, onOpenChange }: DeckDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!deck) return null;

  const stats = deck.statistics;
  const hasStats = stats !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{deck.name}</DialogTitle>
          {deck.description && (
            <DialogDescription>{deck.description}</DialogDescription>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="cards">
              Cards ({deck.cards_count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Tags */}
            {deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deck.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-normal gap-1.5">
                <BookOpen className="h-3 w-3" />
                {deck.cards_count} {deck.cards_count === 1 ? 'card' : 'cards'}
              </Badge>
              {deck.children_count > 0 && (
                <Badge variant="outline" className="font-normal gap-1.5">
                  <Folder className="h-3 w-3" />
                  {deck.children_count} {deck.children_count === 1 ? 'subdeck' : 'subdecks'}
                </Badge>
              )}
              {deck.has_been_studied ? (
                <Badge variant="outline" className="font-normal text-green-600 border-green-200 bg-green-50">
                  Studied
                </Badge>
              ) : (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  Not studied yet
                </Badge>
              )}
            </div>

            <Separator />

            {/* Mastery overview */}
            {hasStats && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Overall Mastery</span>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(stats.mastery_percentage)}%
                  </span>
                </div>
                <Progress value={stats.mastery_percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Average retention: {Math.round(stats.average_retention * 100)}%</span>
                  <span>{stats.mastered_count} cards mastered</span>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(deck.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(deck.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {deck.last_studied_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Last studied</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(deck.last_studied_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4 mt-4">
            {hasStats ? (
              <>
                {/* Card state breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard
                    icon={<Sparkles className="h-4 w-4 text-blue-500" />}
                    label="New"
                    value={stats.new_count}
                    color="blue"
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
                    label="Learning"
                    value={stats.learning_count}
                    color="orange"
                  />
                  <StatCard
                    icon={<Clock className="h-4 w-4 text-amber-500" />}
                    label="Review"
                    value={stats.review_count}
                    color="amber"
                  />
                  <StatCard
                    icon={<RotateCcw className="h-4 w-4 text-rose-500" />}
                    label="Relearning"
                    value={stats.relearning_count}
                    color="rose"
                  />
                  <StatCard
                    icon={<GraduationCap className="h-4 w-4 text-green-500" />}
                    label="Mastered"
                    value={stats.mastered_count}
                    color="green"
                  />
                  <StatCard
                    icon={<Pause className="h-4 w-4 text-slate-500" />}
                    label="Suspended"
                    value={stats.suspended_count}
                    color="slate"
                  />
                </div>

                <Separator />

                {/* Leeches warning */}
                {stats.leech_count > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">
                        {stats.leech_count} {stats.leech_count === 1 ? 'leech' : 'leeches'} detected
                      </p>
                      <p className="text-sm text-red-600">
                        Cards that are difficult to remember and need attention
                      </p>
                    </div>
                  </div>
                )}

                {/* Today's activity */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Today's Activity</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{stats.daily_new_count}</p>
                      <p className="text-xs text-muted-foreground">New cards studied</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.daily_review_count}</p>
                      <p className="text-xs text-muted-foreground">Reviews completed</p>
                    </div>
                  </div>
                </div>

                {/* Last calculated */}
                <p className="text-xs text-muted-foreground text-center">
                  Statistics last updated{' '}
                  {formatDistanceToNow(new Date(stats.last_calculated_at), { addSuffix: true })}
                </p>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No statistics available</p>
                <p className="text-sm">Start studying this deck to see your progress</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cards" className="mt-4 max-h-[60vh] overflow-y-auto">
            <CardList deckId={deck.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    orange: 'bg-orange-50 border-orange-100',
    amber: 'bg-amber-50 border-amber-100',
    rose: 'bg-rose-50 border-rose-100',
    green: 'bg-green-50 border-green-100',
    slate: 'bg-slate-50 border-slate-100',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color] || 'bg-muted/30'}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
