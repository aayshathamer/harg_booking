import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Package,
  Star,
  Flame,
  Brain,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import { DealsApiService } from "@/lib/dealsApi";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Deal } from "@/lib/dealsApi";

// Define categories for filtering
const categories = [
  "All Categories",
  "Accommodation",
  "Transportation", 
  "Food & Dining",
  "Activities & Tours",
  "Shopping",
  "Entertainment",
  "Wellness & Spa",
  "Business Services"
];

const AdminDeals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("name");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDeal, setViewDeal] = useState<Deal | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const navigate = useNavigate();

  // Load deals from database
  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dealsData = await DealsApiService.getAllDeals();
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again.');
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = (deal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deal.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.title || '').localeCompare(b.title || '');
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "price":
        return (a.price || 0) - (b.price || 0);
      case "category":
        return (a.category || '').localeCompare(b.category || '');
      case "discount":
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      default:
        return 0;
    }
  });

  const handleEditDeal = (dealId: string) => {
    navigate(`/admin/deals/edit/${dealId}`);
  };

  const handleViewDeal = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      setViewDeal(deal);
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      try {
        await DealsApiService.deleteDeal(dealId);
        console.log('Deal deleted from database');
        
        await loadDeals();
        // Show success message (you can implement a toast or modal here)
        console.log('Deal deleted successfully');
      } catch (error) {
        console.error('Error deleting deal:', error);
        // Show error message (you can implement a toast or modal here)
        console.log('Failed to delete deal. Please try again.');
      }
    }
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    if (!price || !originalPrice) return 0;
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals Management</h1>
          <p className="text-gray-600">Manage all deals and special offers</p>
        </div>
        <Button onClick={() => navigate('/admin/deals/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
            <p className="text-xs text-muted-foreground">
               {deals.length === 0 ? 'No deals yet' : 'Active deals'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Deals</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.filter(d => d.isHot).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Marked as hot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommended</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.filter(d => d.isAiRecommended).length}
            </div>
            <p className="text-xs text-muted-foreground">
              AI picks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">
              Deal categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deals ({sortedDeals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading deals...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Deals</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={loadDeals} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{deal.image || '📦'}</div>
                          <div>
                            <div className="font-medium">{deal.title || 'Untitled Deal'}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {deal.description || 'No description available'}
                            </div>
                            <div className="text-xs text-gray-400">{deal.location || 'Location not specified'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deal.category || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">{deal.price || '$0'}</div>
                          <div className="text-sm text-gray-500 line-through">
                            {deal.originalPrice || '$0'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {deal.originalPrice && deal.price ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100) : 0}% off
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {getDiscountPercentage(deal.price || 0, deal.originalPrice || 0)}% off
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{deal.rating || 0}</span>
                          <span className="text-gray-500">({deal.reviewsCount || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {deal.isHot && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Flame className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                          {deal.isAiRecommended && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Brain className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}

                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDeal(deal.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditDeal(deal.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            {sortedDeals.length === 0 && !isLoading && !error && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "All Categories" 
                    ? "Try adjusting your search terms or filters"
                    : "No deals have been created yet. Click 'Add New Deal' to get started!"
                  }
                </p>
                {!searchTerm && selectedCategory === "All Categories" && (
                  <Button onClick={() => navigate('/admin/deals/new')} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Deal
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    {/* View Deal Modal */}
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{viewDeal?.image}</span>
            <span>{viewDeal?.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        {viewDeal && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{viewDeal.location}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Category</Label>
                <Badge variant="outline">{viewDeal.category}</Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Price</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{viewDeal.price}</span>
                  <span className="text-lg text-gray-500 line-through">{viewDeal.originalPrice}</span>
                  <Badge className="bg-red-100 text-red-800">{viewDeal.discount}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Rating</Label>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{viewDeal.rating}</span>
                  <span className="text-gray-500">({viewDeal.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Valid Until</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{viewDeal.validUntil?.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Time Left</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{viewDeal.timeLeft}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-gray-700">{viewDeal.description}</p>
            </div>

            {/* Features */}
            {viewDeal.features && viewDeal.features.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Features</Label>
                <div className="flex flex-wrap gap-2">
                  {viewDeal.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">{feature}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            {viewDeal.terms && viewDeal.terms.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Terms & Conditions</Label>
                <div className="space-y-1">
                  {viewDeal.terms.map((term, index) => (
                    <div key={index} className="text-sm text-gray-600">• {term}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Services */}
            {viewDeal.includedServices && viewDeal.includedServices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Included Services</Label>
                <div className="flex flex-wrap gap-2">
                  {viewDeal.includedServices.map((service, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                      ✓ {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Excluded Services */}
            {viewDeal.excludedServices && viewDeal.excludedServices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Excluded Services</Label>
                <div className="flex flex-wrap gap-2">
                  {viewDeal.excludedServices.map((service, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                      ✗ {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleEditDeal(viewDeal.id);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default AdminDeals;
