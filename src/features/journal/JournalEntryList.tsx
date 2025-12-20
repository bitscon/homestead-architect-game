import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JournalEntry } from './api';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  selectedEntry: JournalEntry | null;
}

export const JournalEntryList = ({
  entries,
  onEdit,
  onDelete,
  selectedEntry,
}: JournalEntryListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = entry.title.toLowerCase().includes(query);
    const matchesTags =
      entry.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
    return matchesTitle || matchesTags;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No entries match your search'
                : 'No journal entries yet. Create your first one!'}
            </p>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                selectedEntry?.id === entry.id
                  ? 'ring-2 ring-primary border-primary'
                  : ''
              }`}
              onClick={() => onEdit(entry)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {entry.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {format(new Date(entry.date), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {entry.content}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          'Are you sure you want to delete this entry?'
                        )
                      ) {
                        onDelete(entry.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
