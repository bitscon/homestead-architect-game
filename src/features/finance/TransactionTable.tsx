import { useState } from 'react';
import { format } from 'date-fns';
import { Transaction, FinancialCategory } from './api';
import { Property } from '@/features/properties/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Edit } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: FinancialCategory[];
  properties?: Property[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onFilterChange?: (filters: { type?: string; property_id?: string }) => void;
}

export function TransactionTable({
  transactions,
  categories,
  properties = [],
  onEdit,
  onDelete,
  onFilterChange,
}: TransactionTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const handleFilterChange = (type: string, property: string) => {
    setTypeFilter(type);
    setPropertyFilter(property);
    
    onFilterChange?.({
      type: type !== 'all' ? (type as 'income' | 'expense') : undefined,
      property_id: property !== 'all' ? property : undefined,
    });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getPropertyName = (propertyId: string | null) => {
    if (!propertyId) return '-';
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={typeFilter}
          onValueChange={(value) => handleFilterChange(value, propertyFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expense Only</SelectItem>
          </SelectContent>
        </Select>

        {properties.length > 0 && (
          <Select
            value={propertyFilter}
            onValueChange={(value) => handleFilterChange(typeFilter, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No transactions yet. Add your first transaction to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                {properties.length > 0 && <TableHead>Property</TableHead>}
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={transaction.type === 'income' ? 'secondary' : 'outline'}
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-sm text-muted-foreground">{transaction.notes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                  {properties.length > 0 && (
                    <TableCell>{getPropertyName(transaction.property_id)}</TableCell>
                  )}
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-primary' : 'text-destructive'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
