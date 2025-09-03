import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, XIcon } from "lucide-react";
import { DealsApiService } from "@/lib/dealsApi";
import { type Deal } from "@/lib/dealsApi";

interface DealFormProps {
  dealId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DealForm = ({ dealId, onSuccess, onCancel }: DealFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deal, setDeal] = useState<Partial<Deal>>({
    title: "",
    location: "",
    price: 0,
    originalPrice: 0,
    rating: 0,
    reviewsCount: 0,
    image: "🏷️",
    category: "Hotels",
    discountPercentage: 0,
    discountLabel: "0% OFF",
    timeLeft: "1 week left",
    description: "",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isHot: false,
    isAiRecommended: false,
    isActive: true,
    features: [],
    terms: [],
    includedServices: [],
    excludedServices: []
  });

  const categories = [
    "Hotels",
    "Cars", 
    "Activities",
    "Events",
    "Food",
    "Shopping",
    "Transportation",
    "Entertainment"
  ];

  useEffect(() => {
    if (dealId) {
      loadDeal();
    }
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setIsLoading(true);
      const dealData = await DealsApiService.getDealById(dealId!);
      if (dealData) {
        setDeal(dealData);
      }
    } catch (error) {
      console.error('Error loading deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (dealId) {
        await DealsApiService.updateDeal(dealId, deal);
      } else {
        await DealsApiService.createDeal(deal as Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    setDeal(prev => ({
      ...prev,
      features: [...(prev.features || []), ""]
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setDeal(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setDeal(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  const addTerm = () => {
    setDeal(prev => ({
      ...prev,
      terms: [...(prev.terms || []), ""]
    }));
  };

  const updateTerm = (index: number, value: string) => {
    setDeal(prev => ({
      ...prev,
      terms: prev.terms?.map((t, i) => i === index ? value : t)
    }));
  };

  const removeTerm = (index: number) => {
    setDeal(prev => ({
      ...prev,
      terms: prev.terms?.filter((_, i) => i !== index)
    }));
  };

  const addIncludedService = () => {
    setDeal(prev => ({
      ...prev,
      includedServices: [...(prev.includedServices || []), ""]
    }));
  };

  const updateIncludedService = (index: number, value: string) => {
    setDeal(prev => ({
      ...prev,
      includedServices: prev.includedServices?.map((s, i) => i === index ? value : s)
    }));
  };

  const removeIncludedService = (index: number) => {
    setDeal(prev => ({
      ...prev,
      includedServices: prev.includedServices?.filter((_, i) => i !== index)
    }));
  };

  const addExcludedService = () => {
    setDeal(prev => ({
      ...prev,
      excludedServices: [...(prev.excludedServices || []), ""]
    }));
  };

  const updateExcludedService = (index: number, value: string) => {
    setDeal(prev => ({
      ...prev,
      excludedServices: prev.excludedServices?.map((s, i) => i === index ? value : s)
    }));
  };

  const removeExcludedService = (index: number) => {
    setDeal(prev => ({
      ...prev,
      excludedServices: prev.excludedServices?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {dealId ? "Edit Deal" : "Create New Deal"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={deal.title}
                onChange={(e) => setDeal(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={deal.location}
                onChange={(e) => setDeal(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={deal.price}
                onChange={(e) => setDeal(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price ($)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={deal.originalPrice}
                onChange={(e) => setDeal(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                value={deal.discountPercentage}
                onChange={(e) => {
                  const discount = parseInt(e.target.value) || 0;
                  setDeal(prev => ({ 
                    ...prev, 
                    discountPercentage: discount,
                    discountLabel: `${discount}% OFF`
                  }));
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={deal.rating}
                onChange={(e) => setDeal(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewsCount">Reviews Count</Label>
              <Input
                id="reviewsCount"
                type="number"
                value={deal.reviewsCount}
                onChange={(e) => setDeal(prev => ({ ...prev, reviewsCount: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={deal.category} onValueChange={(value) => setDeal(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={deal.description}
              onChange={(e) => setDeal(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image (Emoji)</Label>
              <Input
                id="image"
                value={deal.image}
                onChange={(e) => setDeal(prev => ({ ...prev, image: e.target.value }))}
                placeholder="🏷️"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLeft">Time Left</Label>
              <Input
                id="timeLeft"
                value={deal.timeLeft}
                onChange={(e) => setDeal(prev => ({ ...prev, timeLeft: e.target.value }))}
                placeholder="1 week left"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="date"
              value={deal.validUntil}
              onChange={(e) => setDeal(prev => ({ ...prev, validUntil: e.target.value }))}
              required
            />
          </div>

          {/* Switches */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isHot"
                checked={deal.isHot}
                onCheckedChange={(checked) => setDeal(prev => ({ ...prev, isHot: checked }))}
              />
              <Label htmlFor="isHot">Hot Deal</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isAiRecommended"
                checked={deal.isAiRecommended}
                onCheckedChange={(checked) => setDeal(prev => ({ ...prev, isAiRecommended: checked }))}
              />
              <Label htmlFor="isAiRecommended">AI Recommended</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={deal.isActive}
                onCheckedChange={(checked) => setDeal(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
            {deal.features?.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="Feature name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Terms & Conditions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTerm}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Term
              </Button>
            </div>
            {deal.terms?.map((term, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={term}
                  onChange={(e) => updateTerm(index, e.target.value)}
                  placeholder="Term text"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTerm(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Included Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Included Services</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIncludedService}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            {deal.includedServices?.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={service}
                  onChange={(e) => updateIncludedService(index, e.target.value)}
                  placeholder="Service name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIncludedService(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Excluded Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Excluded Services</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExcludedService}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            {deal.excludedServices?.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={service}
                  onChange={(e) => updateExcludedService(index, e.target.value)}
                  placeholder="Service name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeExcludedService(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (dealId ? "Update Deal" : "Create Deal")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DealForm;
