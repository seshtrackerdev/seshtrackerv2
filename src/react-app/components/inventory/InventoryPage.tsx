import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../contexts';
import { 
  InventoryItemCreate, 
  LegacyProductType as ProductType, 
  StrainType
} from '../../types';
import '../../styles/Dashboard.css';

const InventoryPage = () => {
  const { 
    inventoryItems, 
    loadInventory, 
    createInventoryItem, 
    deleteInventoryItem, 
    isLoading, 
    error 
  } = useInventory();
  
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItemCreate>>({
    name: '',
    type: 'Flower' as ProductType,
    strainType: 'Hybrid' as StrainType,
    initialQuantity: 0,
    currentQuantity: 0,
    unit: 'g',
    isFavorite: false
  });
  
  useEffect(() => {
    // Load inventory when component mounts
    loadInventory();
  }, [loadInventory]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    // Handle numeric conversions
    if (name === 'initialQuantity' || name === 'currentQuantity' || 
        name === 'price' || name === 'thcContent' || name === 'cbdContent') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type && formData.unit) {
      // Ensure current quantity is set to initial quantity if not explicitly modified
      if (formData.initialQuantity !== undefined && formData.currentQuantity === undefined) {
        formData.currentQuantity = formData.initialQuantity;
      }
      
      await createInventoryItem({
        ...formData,
        userId: '', // This will be set by the backend
        initialQuantity: formData.initialQuantity || 0,
        currentQuantity: formData.currentQuantity || 0,
        isFavorite: formData.isFavorite ?? false,
      } as InventoryItemCreate);
      
      setShowNewItemForm(false);
      setFormData({
        name: '',
        type: 'Flower' as ProductType,
        strainType: 'Hybrid' as StrainType,
        initialQuantity: 0,
        currentQuantity: 0,
        unit: 'g',
        isFavorite: false
      });
    }
  };
  
  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      await deleteInventoryItem(itemId);
    }
  };
  
  // Calculate type breakdown
  const typeBreakdown = () => {
    if (!inventoryItems.length) return { Flower: 0, Vape: 0, Concentrate: 0, Edible: 0, Other: 0 };
    
    const counts: Record<ProductType, number> = {
      Flower: 0,
      'Pre-roll': 0,
      Vape: 0,
      Concentrate: 0,
      Edible: 0,
      Tincture: 0,
      Topical: 0,
      Accessory: 0
    };
    
    inventoryItems.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    
    const total = inventoryItems.length;
    
    return Object.entries(counts).reduce((acc, [type, count]) => {
      if (count > 0) {
        acc[type as ProductType] = Math.round((count / total) * 100);
      }
      return acc;
    }, {} as Record<string, number>);
  };
  
  // Find top rated item
  const findTopRatedItem = () => {
    if (!inventoryItems.length) return null;
    
    return inventoryItems.reduce((highest, current) => {
      if (!highest) return current;
      const currentRating = current.thcContent || 0;
      const highestRating = highest.thcContent || 0;
      return currentRating > highestRating ? current : highest;
    }, null as (typeof inventoryItems[0] | null));
  };
  
  // Format THC/CBD content
  const formatContent = (content?: number) => {
    return content ? `${content}%` : 'N/A';
  };
  
  const topRatedItem = findTopRatedItem();
  const breakdown = typeBreakdown();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Inventory</h1>
        <p className="dashboard-welcome">Manage your cannabis collection</p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="page-actions">
        <button 
          className="action-button primary"
          onClick={() => setShowNewItemForm(!showNewItemForm)}
        >
          <span className="button-icon">➕</span>
          <span>{showNewItemForm ? 'Cancel' : 'Add Item'}</span>
        </button>
        <button className="action-button">
          <span className="button-icon">🔍</span>
          <span>Search</span>
        </button>
        <button className="action-button">
          <span className="button-icon">📋</span>
          <span>Shopping List</span>
        </button>
      </div>

      {showNewItemForm && (
        <div className="content-section">
          <h2 className="section-title">Add Inventory Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Product Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Flower">Flower</option>
                  <option value="Pre-roll">Pre-roll</option>
                  <option value="Vape">Vape</option>
                  <option value="Concentrate">Concentrate</option>
                  <option value="Edible">Edible</option>
                  <option value="Tincture">Tincture</option>
                  <option value="Topical">Topical</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </div>
              
              {(formData.type === 'Flower' || formData.type === 'Pre-roll' || formData.type === 'Vape') && (
                <div className="form-group">
                  <label htmlFor="strainType">Strain Type</label>
                  <select
                    id="strainType"
                    name="strainType"
                    value={formData.strainType || ''}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Select strain type</option>
                    <option value="Indica">Indica</option>
                    <option value="Sativa">Sativa</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CBD">CBD</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="initialQuantity">Initial Quantity</label>
                <input
                  type="number"
                  id="initialQuantity"
                  name="initialQuantity"
                  min="0"
                  step="0.01"
                  value={formData.initialQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="g">Grams (g)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="count">Count (units)</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thcContent">THC Content (%)</label>
                <input
                  type="number"
                  id="thcContent"
                  name="thcContent"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.thcContent || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cbdContent">CBD Content (%)</label>
                <input
                  type="number"
                  id="cbdContent"
                  name="cbdContent"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.cbdContent || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="purchaseDate">Purchase Date</label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isFavorite"
                name="isFavorite"
                checked={formData.isFavorite === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isFavorite: e.target.checked
                }))}
              />
              <label htmlFor="isFavorite">Mark as favorite</label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="action-button primary">
                Add to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory summary cards */}
      <div className="dashboard-grid">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Total Items</h3>
            <span className="material-icon">🌿</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">{inventoryItems.length}</p>
            <p className="summary-label">Items Tracked</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Type Breakdown</h3>
            <span className="material-icon">📊</span>
          </div>
          <div className="summary-card-content">
            <div className="type-breakdown">
              {Object.entries(breakdown).map(([type, percentage]) => (
                <div className="type-item" key={type}>
                  <span className="type-label">{type}</span>
                  <div className={`type-bar ${type.toLowerCase()}`} style={{ width: `${percentage}%`