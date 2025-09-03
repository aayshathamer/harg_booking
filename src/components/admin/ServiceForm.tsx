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
import { ServicesApiService } from "@/lib/servicesApi";
import { type Service } from "@/lib/servicesApi";

interface ServiceFormProps {
  serviceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceForm = ({ serviceId, onSuccess, onCancel }: ServiceFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState<Partial<Service>>({
    title: "",
    description: "",
    category: "Hotels & Stays",
    price: 0,
    rating: 0,
    image: "🏨",
    location: "",
    isPopular: false,
    isNew: false,
    isActive: true,
    features: []
  });

  const categories = [
    "Hotels & Stays",
    "Activities",
    "Event Tickets",
    "Transportation",
    "Food & Dining",
    "Shopping",
    "Tours",
    "Entertainment"
  ];

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setIsLoading(true);
      const serviceData = await ServicesApiService.getServiceById(serviceId!);
      if (serviceData) {
        setService(serviceData);
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (serviceId) {
        await ServicesApiService.updateService(serviceId, service);
      } else {
        await ServicesApiService.createService(service as Omit<Service, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    setService(prev => ({
      ...prev,
      features: [...(prev.features || []), ""]
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setService(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setService(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {serviceId ? "Edit Service" : "Create New Service"}
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
                value={service.title}
                onChange={(e) => setService(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={service.category} onValueChange={(value) => setService(prev => ({ ...prev, category: value }))}>
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
              value={service.description}
              onChange={(e) => setService(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={service.price}
                onChange={(e) => setService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={service.rating}
                onChange={(e) => setService(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image (Emoji)</Label>
              <Input
                id="image"
                value={service.image}
                onChange={(e) => setService(prev => ({ ...prev, image: e.target.value }))}
                placeholder="🏨"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={service.location}
              onChange={(e) => setService(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Hargeisa, Somalia"
            />
          </div>

          {/* Switches */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPopular"
                checked={service.isPopular}
                onCheckedChange={(checked) => setService(prev => ({ ...prev, isPopular: checked }))}
              />
              <Label htmlFor="isPopular">Popular</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isNew"
                checked={service.isNew}
                onCheckedChange={(checked) => setService(prev => ({ ...prev, isNew: checked }))}
              />
              <Label htmlFor="isNew">New</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={service.isActive}
                onCheckedChange={(checked) => setService(prev => ({ ...prev, isActive: checked }))}
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
            {service.features?.map((feature, index) => (
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

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (serviceId ? "Update Service" : "Create Service")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
