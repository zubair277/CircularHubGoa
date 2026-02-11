import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Calendar, SlidersHorizontal, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  CommandSeparator,
} from "@/components/ui/command";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface SearchFilters {
  query: string;
  categories: string[];
  quantityRange: [number, number];
  dateRange: { from?: Date; to?: Date };
  listingType: string[];
  availability: string[];
}

interface AdvancedSearchProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const CATEGORIES = [
  { id: "organic", label: "Organic Waste" },
  { id: "glass", label: "Glass" },
  { id: "plastic", label: "Plastic" },
  { id: "metal", label: "Metal" },
  { id: "paper", label: "Paper/Cardboard" },
  { id: "textile", label: "Textile" },
  { id: "electronics", label: "Electronics" },
  { id: "wood", label: "Wood" },
  { id: "other", label: "Other" },
];

const LISTING_TYPES = [
  { id: "offer", label: "Offer" },
  { id: "request", label: "Request" },
];

const AVAILABILITY = [
  { id: "one-time", label: "One-time" },
  { id: "recurring", label: "Recurring" },
];

export default function AdvancedSearch({ onFilterChange, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters?.query || "",
    categories: initialFilters?.categories || [],
    quantityRange: initialFilters?.quantityRange || [0, 1000],
    dateRange: initialFilters?.dateRange || {},
    listingType: initialFilters?.listingType || [],
    availability: initialFilters?.availability || [],
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  // Save search preferences (debounced to prevent excessive writes)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("searchPreferences", JSON.stringify(filters));
    }, 1000); // 1 second debounce for saving preferences

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Update parent component when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]); // Removed onFilterChange from dependencies to prevent infinite loop

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, query: value }));
  };

  const handleSearchSubmit = () => {
    if (filters.query.trim()) {
      // Add to search history
      const newHistory = [filters.query, ...searchHistory.filter((h) => h !== filters.query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
    setShowHistory(false);
  };

  const handleHistorySelect = (query: string) => {
    handleSearchChange(query);
    setShowHistory(false);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleListingTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      listingType: prev.listingType.includes(type)
        ? prev.listingType.filter((t) => t !== type)
        : [...prev.listingType, type],
    }));
  };

  const handleAvailabilityToggle = (avail: string) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(avail)
        ? prev.availability.filter((a) => a !== avail)
        : [...prev.availability, avail],
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      categories: [],
      quantityRange: [0, 1000],
      dateRange: {},
      listingType: [],
      availability: [],
    });
  };

  const hasActiveFilters = filters.categories.length > 0 ||
    filters.listingType.length > 0 ||
    filters.availability.length > 0 ||
    filters.dateRange.from ||
    filters.quantityRange[0] !== 0 ||
    filters.quantityRange[1] !== 1000;

  const activeFilterCount = filters.categories.length +
    filters.listingType.length +
    filters.availability.length +
    (filters.dateRange.from ? 1 : 0) +
    ((filters.quantityRange[0] !== 0 || filters.quantityRange[1] !== 1000) ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar with History */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search listings, materials, businesses..."
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            className="pl-10 pr-10"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-md">
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>Recent Searches</span>
                </div>
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySelect(query)}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center" variant="default">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="end">
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Quantity Range: {filters.quantityRange[0]} - {filters.quantityRange[1]} units
                </Label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={filters.quantityRange}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, quantityRange: value as [number, number] }))
                  }
                  className="mt-2"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(filters.dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                      onSelect={(range) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateRange: { from: range?.from, to: range?.to },
                        }))
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Listing Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Listing Type</Label>
                <div className="flex gap-2">
                  {LISTING_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={filters.listingType.includes(type.id)}
                        onCheckedChange={() => handleListingTypeToggle(type.id)}
                      />
                      <label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Availability</Label>
                <div className="flex gap-2">
                  {AVAILABILITY.map((avail) => (
                    <div key={avail.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`avail-${avail.id}`}
                        checked={filters.availability.includes(avail.id)}
                        onCheckedChange={() => handleAvailabilityToggle(avail.id)}
                      />
                      <label htmlFor={`avail-${avail.id}`} className="text-sm cursor-pointer">
                        {avail.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((catId) => (
            <Badge key={catId} variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.id === catId)?.label}
              <button
                onClick={() => handleCategoryToggle(catId)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.listingType.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {LISTING_TYPES.find((t) => t.id === type)?.label}
              <button
                onClick={() => handleListingTypeToggle(type)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.availability.map((avail) => (
            <Badge key={avail} variant="secondary" className="gap-1">
              {AVAILABILITY.find((a) => a.id === avail)?.label}
              <button
                onClick={() => handleAvailabilityToggle(avail)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.quantityRange[0] !== 0 || filters.quantityRange[1] !== 1000) && (
            <Badge variant="secondary" className="gap-1">
              Quantity: {filters.quantityRange[0]}-{filters.quantityRange[1]}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, quantityRange: [0, 1000] }))
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange.from && (
            <Badge variant="secondary" className="gap-1">
              {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, dateRange: {} }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
