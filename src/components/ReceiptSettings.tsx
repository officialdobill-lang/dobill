import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataService, ShopDetails } from '@/services/dataService';
import { ReceiptTemplate, ReceiptElementBlock } from '@/types';
import { toast } from 'sonner';
// @ts-ignore
import Barcode from 'react-barcode/lib/react-barcode.js';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Copy, 
  Lock, 
  Barcode as BarcodeIcon, 
  Sparkles, 
  Eye, 
  QrCode, 
  Check, 
  Layout,
  GripVertical,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  PlusCircle,
  Move,
  Sliders,
  EyeOff
} from 'lucide-react';

export default function ReceiptSettings() {
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [shopDetails, setShopDetails] = useState<ShopDetails>({ name: 'DO BILL', address: 'BADA BAZAR, JHANSI', phone: '+91 9450000000' });
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ReceiptTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [upiId, setUpiId] = useState('');

  // Selected element ID in Canva Canvas
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sample data for previewing receipts
  const sampleItems = [
    { name: 'Designer Silk Saree', qty: 1, price: 2499, total: 2499, gst: 5 },
    { name: 'Cotton Printed Kurti', qty: 2, price: 650, total: 1300, gst: 5 },
  ];
  const sampleSubtotal = 3799;
  const sampleTax = 189.95;
  const sampleGrandTotal = 3988.95;

  const loadData = async () => {
    setLoading(true);
    try {
      const tpls = await DataService.getReceiptTemplates();
      setTemplates(tpls);
      const shop = await DataService.getShopDetails();
      setShopDetails(shop);
      const upi = await DataService.getUPIId();
      setUpiId(upi);
    } catch (e) {
      console.error('Error loading receipt templates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = DataService.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const getDefaultElementsOrder = (tpl: Partial<ReceiptTemplate>): ReceiptElementBlock[] => {
    return [
      { id: 'logo', type: 'logo', label: 'Shop Logo', align: 'center', visible: tpl.showLogo ?? true },
      { id: 'shop_info', type: 'shop_info', label: 'Shop Header Details', align: 'center', visible: true },
      { id: 'header_subtext', type: 'header_subtext', label: 'Subtext / GSTIN', align: 'center', text: tpl.headerSubtext || 'GSTIN: 07AAAAA0000A1Z5 | Reg. Retailer', visible: true },
      { id: 'header_title', type: 'header_title', label: 'Header Title Badge', align: 'center', text: tpl.headerTitle || 'TAX INVOICE', visible: true },
      { id: 'metadata', type: 'metadata', label: 'Invoice No, Date & Cashier Meta', align: 'left', visible: true },
      { id: 'items_table', type: 'items_table', label: 'Purchased Items Table', align: 'left', visible: true },
      { id: 'totals', type: 'totals', label: 'Subtotal & Totals Summary', align: 'right', visible: true },
      { id: 'barcode', type: 'barcode', label: 'Scannable Barcode Label', align: 'center', visible: tpl.showBarcode ?? true },
      { id: 'upi_qr', type: 'upi_qr', label: 'UPI QR Payment Code', align: 'center', visible: tpl.showUpiQr ?? true },
      { id: 'terms', type: 'terms', label: 'Terms & Conditions', align: 'left', text: tpl.termsText || '1. Goods once sold cannot be returned.', visible: tpl.showTerms ?? true },
      { id: 'footer_note', type: 'footer_note', label: 'Footer Thank You Message', align: 'center', text: tpl.footerNote || 'Thank you for shopping with us! Please visit again.', visible: tpl.showFooterNote ?? true },
    ];
  };

  const handleCreateNewTemplate = () => {
    const newId = `tpl_${Date.now()}`;
    const baseTpl: Partial<ReceiptTemplate> = {
      headerTitle: 'TAX INVOICE',
      headerSubtext: 'GSTIN: 07AAAAA0000A1Z5 | Reg. Retailer',
      footerNote: 'Thank you for shopping with us! Please visit again.',
      termsText: '1. Goods once sold cannot be returned.\n2. Subject to local jurisdiction.',
      showLogo: true,
      showBarcode: true,
      showUpiQr: true,
      showTerms: true,
      showFooterNote: true,
    };
    
    const newTemplate: ReceiptTemplate = {
      id: newId,
      name: `Custom Receipt ${templates.length + 1}`,
      type: 'barcode',
      isDefault: false,
      headerTitle: 'TAX INVOICE',
      headerSubtext: 'GSTIN: 07AAAAA0000A1Z5 | Reg. Retailer',
      addressOverride: '',
      phoneOverride: '',
      footerNote: 'Thank you for shopping with us! Please visit again.',
      termsText: '1. Goods once sold cannot be returned.\n2. Subject to local jurisdiction.',
      customPromoText: 'Follow us for latest updates!',
      pageSize: 'auto',
      showLogo: true,
      showBarcode: true,
      showUpiQr: true,
      showCashierName: true,
      showCustomerDetails: true,
      showTaxBreakdown: true,
      showItemDiscounts: true,
      showSavingsSummary: true,
      showTerms: true,
      showFooterNote: true,
      showBorderLines: true,
      elementsOrder: getDefaultElementsOrder(baseTpl),
      updatedAt: new Date().toISOString(),
    };
    setEditingTemplate(newTemplate);
    setSelectedElementId('header_title');
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (tpl: ReceiptTemplate) => {
    const elements = tpl.elementsOrder && tpl.elementsOrder.length > 0
      ? tpl.elementsOrder
      : getDefaultElementsOrder(tpl);

    setEditingTemplate({ 
      ...tpl, 
      pageSize: 'auto',
      elementsOrder: elements
    });
    setSelectedElementId(elements[0]?.id || null);
    setIsEditorOpen(true);
  };

  const handleDuplicateTemplate = async (tpl: ReceiptTemplate) => {
    const duplicated: ReceiptTemplate = {
      ...tpl,
      id: `tpl_${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isDefault: false,
      pageSize: 'auto',
      elementsOrder: tpl.elementsOrder ? [...tpl.elementsOrder] : getDefaultElementsOrder(tpl),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = [...templates, duplicated];
    setTemplates(updatedList);
    await DataService.saveReceiptTemplates(updatedList);
    toast.success(`Duplicated "${tpl.name}" successfully!`);
  };

  const handleSetDefault = async (targetId: string) => {
    const updatedList = templates.map(t => ({
      ...t,
      isDefault: t.id === targetId,
      updatedAt: new Date().toISOString(),
    }));
    setTemplates(updatedList);
    await DataService.saveReceiptTemplates(updatedList);
    toast.success('Active receipt template updated!');
  };

  const handleDeleteTemplate = async (targetId: string) => {
    if (templates.length <= 1) {
      toast.error('At least one receipt template must be kept.');
      return;
    }
    const target = templates.find(t => t.id === targetId);
    if (target?.isDefault) {
      toast.error('Cannot delete the active default template. Please set another default first.');
      return;
    }
    const updatedList = templates.filter(t => t.id !== targetId);
    setTemplates(updatedList);
    await DataService.saveReceiptTemplates(updatedList);
    toast.success('Receipt template deleted.');
  };

  const handleSaveEditor = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim()) {
      toast.error('Please enter a template name.');
      return;
    }

    // Ensure page size is auto
    const finalizedTemplate: ReceiptTemplate = {
      ...editingTemplate,
      pageSize: 'auto',
      updatedAt: new Date().toISOString(),
    };

    let updatedList: ReceiptTemplate[];
    const exists = templates.some(t => t.id === finalizedTemplate.id);
    if (exists) {
      updatedList = templates.map(t => t.id === finalizedTemplate.id ? finalizedTemplate : t);
    } else {
      if (templates.length === 0) finalizedTemplate.isDefault = true;
      updatedList = [...templates, finalizedTemplate];
    }

    setTemplates(updatedList);
    await DataService.saveReceiptTemplates(updatedList);
    setIsEditorOpen(false);
    setEditingTemplate(null);
    toast.success('Receipt template saved successfully!');
  };

  // Reorder elements
  const moveElement = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate || !editingTemplate.elementsOrder) return;
    const newElements = [...editingTemplate.elementsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newElements.length) return;

    const [moved] = newElements.splice(index, 1);
    newElements.splice(targetIndex, 0, moved);

    setEditingTemplate({
      ...editingTemplate,
      elementsOrder: newElements,
    });
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !editingTemplate || !editingTemplate.elementsOrder) return;
    if (draggedIndex === dropIndex) return;

    const newElements = [...editingTemplate.elementsOrder];
    const [draggedItem] = newElements.splice(draggedIndex, 1);
    newElements.splice(dropIndex, 0, draggedItem);

    setEditingTemplate({
      ...editingTemplate,
      elementsOrder: newElements,
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success(`Reordered "${draggedItem.label}"`);
  };

  // Add custom text or divider block
  const handleAddCustomBlock = (type: 'custom_text' | 'divider') => {
    if (!editingTemplate) return;
    const currentElements = editingTemplate.elementsOrder || getDefaultElementsOrder(editingTemplate);
    const newId = `custom_${type}_${Date.now()}`;
    const newBlock: ReceiptElementBlock = type === 'custom_text' ? {
      id: newId,
      type: 'custom_text',
      label: 'Custom Text Block',
      text: '⭐ Special Offer / Discount Note',
      align: 'center',
      fontSize: 'sm',
      fontWeight: 'bold',
      visible: true,
    } : {
      id: newId,
      type: 'divider',
      label: 'Divider Line',
      align: 'center',
      visible: true,
    };

    const updatedElements = [...currentElements, newBlock];
    setEditingTemplate({
      ...editingTemplate,
      elementsOrder: updatedElements,
    });
    setSelectedElementId(newId);
    toast.success(`Added ${type === 'custom_text' ? 'Custom Text' : 'Divider Line'} to receipt!`);
  };

  // Toggle or update element block property
  const updateElementBlock = (blockId: string, updates: Partial<ReceiptElementBlock>) => {
    if (!editingTemplate || !editingTemplate.elementsOrder) return;
    const updatedElements = editingTemplate.elementsOrder.map(blk => {
      if (blk.id === blockId) {
        return { ...blk, ...updates };
      }
      return blk;
    });

    // Sync template high level fields if updating header_title, footer_note, terms, etc.
    let syncUpdates: Partial<ReceiptTemplate> = { elementsOrder: updatedElements };
    const updatedBlock = updatedElements.find(b => b.id === blockId);
    if (updatedBlock) {
      if (blockId === 'header_title' && updatedBlock.text !== undefined) {
        syncUpdates.headerTitle = updatedBlock.text;
      }
      if (blockId === 'header_subtext' && updatedBlock.text !== undefined) {
        syncUpdates.headerSubtext = updatedBlock.text;
      }
      if (blockId === 'footer_note' && updatedBlock.text !== undefined) {
        syncUpdates.footerNote = updatedBlock.text;
      }
      if (blockId === 'terms' && updatedBlock.text !== undefined) {
        syncUpdates.termsText = updatedBlock.text;
      }
      if (blockId === 'logo') {
        syncUpdates.showLogo = updatedBlock.visible;
      }
      if (blockId === 'barcode') {
        syncUpdates.showBarcode = updatedBlock.visible;
      }
      if (blockId === 'upi_qr') {
        syncUpdates.showUpiQr = updatedBlock.visible;
      }
    }

    setEditingTemplate({
      ...editingTemplate,
      ...syncUpdates,
    });
  };

  // Delete custom block
  const handleDeleteBlock = (blockId: string) => {
    if (!editingTemplate || !editingTemplate.elementsOrder) return;
    const updated = editingTemplate.elementsOrder.filter(b => b.id !== blockId);
    setEditingTemplate({
      ...editingTemplate,
      elementsOrder: updated,
    });
    if (selectedElementId === blockId) setSelectedElementId(null);
    toast.success('Removed element block');
  };

  const selectedBlock = editingTemplate?.elementsOrder?.find(b => b.id === selectedElementId) || null;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-extrabold animate-pulse uppercase tracking-widest text-sm">
        Loading Receipt Templates...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 pointer-events-none blur-3xl"></div>
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-3">
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Canva Drag & Drop Receipt Editor
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-400 shrink-0" />
                Receipt Templates & Styles
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
                Create new receipts with <strong className="text-blue-300">Canva-style drag and drop</strong> layout editing. Click any element on the paper to customize font, alignment, and text.
              </CardDescription>
            </div>

            <Button
              onClick={handleCreateNewTemplate}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 h-12 px-6 rounded-2xl font-black uppercase tracking-wider text-xs gap-2 shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Create New Receipt Item
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Auto Page Size Locked Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs font-medium">
        <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl shrink-0 mt-0.5">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <p className="font-extrabold uppercase tracking-wide text-amber-800 text-[11px] mb-0.5">
            🔒 Page Size: AUTO Continuous Thermal Roll (Locked)
          </p>
          <p className="text-slate-600 text-xs leading-relaxed">
            Page size is locked to Automatic Roll so paper height dynamically scales with your items and elements layout. No manual page size configuration is needed or permitted, protecting against paper jams.
          </p>
        </div>
      </div>

      {/* Template Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map(tpl => (
          <Card 
            key={tpl.id} 
            className={`border transition-all duration-200 rounded-3xl overflow-hidden relative flex flex-col justify-between ${
              tpl.isDefault 
                ? 'border-blue-500/80 bg-blue-50/20 shadow-lg shadow-blue-500/5 ring-2 ring-blue-500/20' 
                : 'border-slate-200/80 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">{tpl.name}</h3>
                    {tpl.isDefault && (
                      <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider gap-1 px-2.5 py-0.5 rounded-lg">
                        <CheckCircle2 className="h-3 w-3" /> Active Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    {tpl.type === 'barcode' ? (
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <BarcodeIcon className="h-3.5 w-3.5" /> Barcode Receipt
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <FileText className="h-3.5 w-3.5" /> Simple Receipt
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5 text-slate-400" /> Auto Height
                    </span>
                  </div>
                </div>
              </div>

              {/* Elements Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Receipt Layout Elements</span>
                  <span>Header: {tpl.headerTitle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.showLogo && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-slate-600">Logo</Badge>}
                  {tpl.showBarcode && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-blue-600 border-blue-200">Barcode</Badge>}
                  {tpl.showUpiQr && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-emerald-600 border-emerald-200">UPI QR</Badge>}
                  {tpl.showTaxBreakdown && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-slate-600">Tax Table</Badge>}
                  {tpl.showTerms && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-slate-600">Terms</Badge>}
                  {tpl.showFooterNote && <Badge variant="outline" className="bg-white text-[9.5px] font-bold text-slate-600">Footer Note</Badge>}
                </div>
              </div>

              {tpl.footerNote && (
                <p className="text-[11px] text-slate-500 italic truncate bg-slate-50/50 p-2 rounded-xl">
                  "{tpl.footerNote}"
                </p>
              )}
            </CardContent>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!tpl.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefault(tpl.id)}
                    className="h-9 text-xs font-black bg-white hover:bg-blue-50 text-blue-600 border-blue-200 rounded-xl uppercase tracking-wider"
                  >
                    Set Active
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTemplate(tpl)}
                  className="h-9 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border-slate-200 rounded-xl gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5 text-blue-600" /> Canva Edit
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicateTemplate(tpl)}
                  title="Duplicate Template"
                  className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!tpl.isDefault && templates.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    title="Delete Template"
                    className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CANVA-STYLE FULL FEATURED EDITOR DIALOG */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-6xl lg:max-w-7xl p-0 overflow-hidden h-[95vh] flex flex-col rounded-3xl border-0 shadow-2xl">
          
          {/* Editor Header Bar */}
          <DialogHeader className="p-4 px-6 border-b shrink-0 bg-slate-900 text-white flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                  <span>{editingTemplate?.name || 'Receipt Template'}</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] font-black uppercase">
                    Canva Studio
                  </Badge>
                </DialogTitle>
                <div className="text-[11px] text-slate-400 font-medium">
                  Drag elements up/down to reorder. Click any element on the paper to edit inline.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-extrabold flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Page Size: <strong className="text-white">AUTO</strong></span>
              </div>
            </div>
          </DialogHeader>

          {editingTemplate && (
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
              
              {/* LEFT SIDE: Canva Toolbar & Element Layers List (4 cols) */}
              <div className="lg:col-span-4 border-r border-slate-200 bg-white p-5 space-y-5 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Basic Item Title */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Receipt Name
                    </Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      placeholder="Template Name"
                      className="h-10 text-xs font-bold bg-slate-50 rounded-xl"
                    />
                  </div>

                  {/* Add Elements Actions */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                      <span>Add Canvas Elements</span>
                      <Sparkles className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddCustomBlock('custom_text')}
                        className="h-9 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl gap-1.5 justify-start"
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-blue-600" /> + Custom Text
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddCustomBlock('divider')}
                        className="h-9 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl gap-1.5 justify-start"
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-500" /> + Line Divider
                      </Button>
                    </div>
                  </div>

                  {/* Layers Stack List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                      <span>Drag & Drop Layers Order</span>
                      <span className="text-[10px] text-slate-400 font-mono">({editingTemplate.elementsOrder?.length || 0} blocks)</span>
                    </div>

                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {editingTemplate.elementsOrder?.map((block, idx) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={e => handleDragStart(e, idx)}
                          onDragOver={e => handleDragOver(e, idx)}
                          onDrop={e => handleDrop(e, idx)}
                          onClick={() => setSelectedElementId(block.id)}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            selectedElementId === block.id 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                              : dragOverIndex === idx 
                                ? 'bg-blue-100 border-blue-400 border-dashed scale-[1.01]'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className={`h-4 w-4 shrink-0 cursor-grab active:cursor-grabbing ${selectedElementId === block.id ? 'text-blue-200' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <div className={`text-xs font-bold truncate ${selectedElementId === block.id ? 'text-white' : 'text-slate-800'}`}>
                                {block.label}
                              </div>
                              <div className={`text-[9.5px] truncate ${selectedElementId === block.id ? 'text-blue-200' : 'text-slate-400'}`}>
                                {block.type} • {block.visible ? 'Visible' : 'Hidden'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); moveElement(idx, 'up'); }}
                              disabled={idx === 0}
                              className={`p-1 rounded-lg ${selectedElementId === block.id ? 'hover:bg-blue-700 text-white' : 'hover:bg-slate-200 text-slate-600'} disabled:opacity-30`}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); moveElement(idx, 'down'); }}
                              disabled={idx === (editingTemplate.elementsOrder?.length || 0) - 1}
                              className={`p-1 rounded-lg ${selectedElementId === block.id ? 'hover:bg-blue-700 text-white' : 'hover:bg-slate-200 text-slate-600'} disabled:opacity-30`}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateElementBlock(block.id, { visible: !block.visible }); }}
                              className={`p-1 rounded-lg ${selectedElementId === block.id ? 'hover:bg-blue-700 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                            >
                              {block.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer lock note */}
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-medium">
                  <strong>Canva Engine Tip:</strong> Drag and drop any layer up or down in the list, or drag blocks directly on the right-hand receipt canvas.
                </div>
              </div>

              {/* CENTER: Interactive Canva Thermal Receipt Canvas (5 cols) */}
              <div className="lg:col-span-5 p-6 overflow-y-auto flex flex-col items-center justify-start bg-slate-200/80 relative">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" /> Canva Interactive Stage (Auto Roll)
                </div>

                {/* Thermal Receipt Paper Background */}
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-[340px] font-mono text-[11px] text-slate-800 space-y-2 relative transition-all">
                  
                  {/* Paper top tooth edge design */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-slate-300/40 to-transparent"></div>

                  {editingTemplate.elementsOrder?.map((block, idx) => {
                    if (!block.visible) return null;
                    const isSelected = selectedElementId === block.id;

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={e => handleDragStart(e, idx)}
                        onDragOver={e => handleDragOver(e, idx)}
                        onDrop={e => handleDrop(e, idx)}
                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(block.id); }}
                        className={`group relative p-2 rounded-xl transition-all cursor-pointer border-2 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-md' 
                            : 'border-transparent hover:border-blue-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Selected Canva Bounding Box Controls */}
                        {isSelected && (
                          <div className="absolute -top-3 right-2 bg-blue-600 text-white rounded-md px-2 py-0.5 text-[9px] font-black uppercase shadow-md flex items-center gap-1 z-20">
                            <Move className="h-2.5 w-2.5" /> {block.label}
                          </div>
                        )}

                        {/* Align class mapping */}
                        <div className={`
                          ${block.align === 'left' ? 'text-left' : block.align === 'right' ? 'text-right' : 'text-center'}
                          ${block.fontSize === 'xs' ? 'text-[9.5px]' : block.fontSize === 'lg' ? 'text-xs font-black' : block.fontSize === 'xl' ? 'text-sm font-black' : 'text-[10.5px]'}
                          ${block.fontWeight === 'extrabold' ? 'font-black' : block.fontWeight === 'bold' ? 'font-bold' : 'font-normal'}
                        `}>

                          {/* Block Renderer based on type */}
                          {block.type === 'logo' && (
                            <div className="flex justify-center py-1">
                              {shopDetails.logo ? (
                                <img src={shopDetails.logo} alt="Logo" className="h-8 object-contain" />
                              ) : (
                                <div className="border border-dashed border-slate-300 p-2 rounded-lg text-[9px] text-slate-400 font-bold uppercase">
                                  [ Shop Logo Placeholder ]
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'shop_info' && (
                            <div className="space-y-0.5">
                              <div className="font-black text-sm uppercase">{shopDetails.name || 'DO BILL STORE'}</div>
                              <div className="text-[10px] text-slate-600">{editingTemplate.addressOverride || shopDetails.address || 'MAIN BAZAR, JHANSI'}</div>
                              <div className="text-[10px] text-slate-600">PH: {editingTemplate.phoneOverride || shopDetails.phone || '+91 9450000000'}</div>
                            </div>
                          )}

                          {block.type === 'header_subtext' && (
                            <div className="text-[9.5px] font-bold text-slate-500 py-0.5">
                              {block.text || editingTemplate.headerSubtext || 'GSTIN: 07AAAAA0000A1Z5'}
                            </div>
                          )}

                          {block.type === 'header_title' && (
                            <div className="py-1">
                              <span className="font-black text-xs uppercase bg-slate-100 py-1 px-3 rounded inline-block border border-slate-200">
                                {block.text || editingTemplate.headerTitle || 'TAX INVOICE'}
                              </span>
                            </div>
                          )}

                          {block.type === 'metadata' && (
                            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-1.5 text-left">
                              <div className="flex justify-between">
                                <span>INV: #DB-2026-9041</span>
                                <span>DATE: 22-07-2026</span>
                              </div>
                              {editingTemplate.showCashierName && (
                                <div className="flex justify-between text-slate-600">
                                  <span>CASHIER: Main Terminal</span>
                                  <span>MODE: CASH</span>
                                </div>
                              )}
                              {editingTemplate.showCustomerDetails && (
                                <div className="text-slate-600 pt-0.5">
                                  CUST: Rahul Sharma (+91 9876543210)
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'items_table' && (
                            <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-left">
                              <div className="flex justify-between font-bold text-[9.5px] uppercase border-b border-slate-200 pb-0.5">
                                <span>ITEM</span>
                                <span>QTY x RATE</span>
                                <span>AMT</span>
                              </div>
                              {sampleItems.map((item, i) => (
                                <div key={i} className="flex justify-between text-[10px]">
                                  <span className="truncate max-w-[110px] font-bold">{item.name}</span>
                                  <span>{item.qty} x ₹{item.price}</span>
                                  <span className="font-black">₹{item.total}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {block.type === 'totals' && (
                            <div className="space-y-1 py-1 border-b border-dashed border-slate-300">
                              <div className="flex justify-between text-slate-600 text-[10px]">
                                <span>Subtotal:</span>
                                <span>₹{sampleSubtotal.toFixed(2)}</span>
                              </div>
                              {editingTemplate.showTaxBreakdown && (
                                <div className="flex justify-between text-slate-500 text-[9.5px]">
                                  <span>GST (5%):</span>
                                  <span>₹{sampleTax.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-200 text-slate-900">
                                <span>TOTAL:</span>
                                <span>₹{sampleGrandTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          {block.type === 'barcode' && (
                            <div className="flex flex-col items-center justify-center py-1">
                              <Barcode 
                                value="DB20269041" 
                                width={1.4}
                                height={32}
                                fontSize={9}
                                background="transparent"
                                margin={0}
                              />
                            </div>
                          )}

                          {block.type === 'upi_qr' && (
                            <div className="flex flex-col items-center text-center p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                              <div className="p-1 bg-white border rounded">
                                <QrCode className="h-9 w-9 text-slate-800" />
                              </div>
                              <span className="text-[8.5px] font-bold text-slate-600">Scan to pay via UPI ({upiId || 'shop@upi'})</span>
                            </div>
                          )}

                          {block.type === 'terms' && (
                            <div className="text-[9px] text-slate-500 py-1 whitespace-pre-line leading-tight">
                              {block.text || editingTemplate.termsText || 'Goods once sold cannot be returned.'}
                            </div>
                          )}

                          {block.type === 'footer_note' && (
                            <div className="text-[10px] font-bold text-center text-slate-700 py-1">
                              {block.text || editingTemplate.footerNote || 'Thank you for your visit!'}
                            </div>
                          )}

                          {block.type === 'custom_text' && (
                            <div className="text-[10px] font-bold py-1 bg-yellow-50/50 p-1.5 rounded border border-yellow-200/50">
                              {block.text || 'Custom text block'}
                            </div>
                          )}

                          {block.type === 'divider' && (
                            <div className="border-t-2 border-dashed border-slate-300 my-1"></div>
                          )}

                        </div>
                      </div>
                    );
                  })}

                  <div className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest pt-2 border-t border-slate-100">
                    CANVA REALTIME THERMAL RECEIPT • PAGE SIZE: AUTO
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Canva Block Inspector Controls (3 cols) */}
              <div className="lg:col-span-3 border-l border-slate-200 bg-white p-5 space-y-5 overflow-y-auto">
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  Element Inspector
                </div>

                {selectedBlock ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 space-y-1">
                      <div className="text-xs font-black text-blue-900">{selectedBlock.label}</div>
                      <div className="text-[10px] text-blue-600 font-mono">ID: {selectedBlock.id}</div>
                    </div>

                    {/* Visibility Switch */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <Label className="text-xs font-bold text-slate-700 cursor-pointer">Visible on Receipt</Label>
                      <Switch
                        checked={selectedBlock.visible}
                        onCheckedChange={v => updateElementBlock(selectedBlock.id, { visible: v })}
                      />
                    </div>

                    {/* Text Content Editing */}
                    {(selectedBlock.type === 'header_title' || 
                      selectedBlock.type === 'header_subtext' || 
                      selectedBlock.type === 'terms' || 
                      selectedBlock.type === 'footer_note' || 
                      selectedBlock.type === 'custom_text') && (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-extrabold uppercase text-slate-500">
                          Text Content
                        </Label>
                        <textarea
                          rows={3}
                          value={selectedBlock.text || ''}
                          onChange={e => updateElementBlock(selectedBlock.id, { text: e.target.value })}
                          placeholder="Type content..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50"
                        />
                      </div>
                    )}

                    {/* Text Alignment */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Text Alignment
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateElementBlock(selectedBlock.id, { align: 'left' })}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                            selectedBlock.align === 'left' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <AlignLeft className="h-3.5 w-3.5" /> Left
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElementBlock(selectedBlock.id, { align: 'center' })}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                            selectedBlock.align === 'center' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <AlignCenter className="h-3.5 w-3.5" /> Center
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElementBlock(selectedBlock.id, { align: 'right' })}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                            selectedBlock.align === 'right' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <AlignRight className="h-3.5 w-3.5" /> Right
                        </button>
                      </div>
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-extrabold uppercase text-slate-500">
                        Font Weight
                      </Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateElementBlock(selectedBlock.id, { fontWeight: 'normal' })}
                          className={`p-2 rounded-xl border text-xs font-bold ${
                            selectedBlock.fontWeight === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElementBlock(selectedBlock.id, { fontWeight: 'extrabold' })}
                          className={`p-2 rounded-xl border text-xs font-black ${
                            selectedBlock.fontWeight === 'extrabold' || selectedBlock.fontWeight === 'bold' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Bold
                        </button>
                      </div>
                    </div>

                    {/* Delete Custom Block if applicable */}
                    {(selectedBlock.type === 'custom_text' || selectedBlock.type === 'divider') && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteBlock(selectedBlock.id)}
                        className="w-full h-10 rounded-xl text-xs font-bold gap-2 mt-4"
                      >
                        <Trash2 className="h-4 w-4" /> Delete This Block
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Type className="h-8 w-8 mx-auto text-slate-300" />
                    <div className="text-xs font-bold">No Element Selected</div>
                    <div className="text-[10px] text-slate-400">Click any block on the paper or layers list to inspect and edit properties.</div>
                  </div>
                )}
              </div>

            </div>
          )}

          <DialogFooter className="p-4 px-6 bg-white border-t border-slate-200 sm:justify-between no-print shrink-0">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="font-bold text-slate-500 h-11 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEditor} 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-11 px-8 font-black uppercase tracking-wider rounded-xl"
            >
              <Check className="h-4 w-4" /> Save Receipt Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
