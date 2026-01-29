'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Copy,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';

type Barcode = {
  id: string;
  barcode_id: number;
  barcode: string;
  status: 'available' | 'used' | 'void';
  created_at: string;
};

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function BarcodeGenPage() {
  const router = useRouter();
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Selection
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);

  const fetchBarcodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/barcodes?${params}`);
      const data = await response.json();

      if (data.success) {
        setBarcodes(data.data);
        setPagination(data.pagination);
        // Reset selection when data changes
        setSelectedBarcodes([]);
        setSelectAll(false);
      } else {
        toast.error('Failed to fetch barcodes');
      }
    } catch (error) {
      toast.error('Error fetching barcodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarcodes();
  }, [pagination.page, statusFilter]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/barcodes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: generateCount })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Generated ${generateCount} barcode(s) successfully`);
        setGenerateOpen(false);
        setGenerateCount(10);
        fetchBarcodes(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to generate barcodes');
      }
    } catch (error) {
      toast.error('Error generating barcodes');
    } finally {
      setGenerating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBarcodes();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Used</Badge>;
      case 'void':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Void</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectBarcode = (id: string) => {
    setSelectedBarcodes(prev =>
      prev.includes(id)
        ? prev.filter(barcodeId => barcodeId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(barcodes.map(b => b.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDownloadImages = async () => {
    if (selectedBarcodes.length === 0) {
      toast.error('Please select barcodes to download');
      return;
    }

    try {
      setDownloading(true);
      toast.loading(`Generating ${selectedBarcodes.length} barcode${selectedBarcodes.length > 1 ? 's' : ''}...`);
      
      const format = selectedBarcodes.length === 1 ? 'png' : 'pdf';
      
      const response = await fetch('/api/barcodes/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          barcodeIds: selectedBarcodes,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate download');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      if (format === 'png') {
        const singleBarcode = barcodes.find(b => b.id === selectedBarcodes[0]);
        a.download = `barcode-${singleBarcode?.barcode || 'single'}.png`;
      } else {
        a.download = `barcodes-batch-${new Date().toISOString().split('T')[0]}.pdf`;
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success(`Downloaded ${selectedBarcodes.length} barcode${selectedBarcodes.length > 1 ? 's' : ''} as ${format.toUpperCase()}`);
      
      // Clear selection after download
      setSelectedBarcodes([]);
      setSelectAll(false);
      
    } catch (error) {
      toast.dismiss();
      toast.error('Error downloading barcode images');
    } finally {
      setDownloading(false);
    }
  };

  const previewBarcode = (barcode: Barcode) => {
    // Create a canvas for barcode generation
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    
    JsBarcode(canvas, barcode.barcode, {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 20,
      background: "#ffffff",
      lineColor: "#000000",
      margin: 10
    });
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Barcode Preview: ${barcode.barcode}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              text-align: center;
              background: #f5f5f5;
            }
            .preview-container {
              max-width: 500px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .barcode-image {
              border: 1px solid #ddd;
              padding: 20px;
              background: white;
              margin: 20px 0;
              display: inline-block;
            }
            .barcode-info {
              margin: 20px 0;
              text-align: left;
              display: block;
            }
            .barcode-info div {
              margin: 5px 0;
            }
            .print-btn {
              padding: 12px 24px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            .print-btn:hover {
              background: #0056b3;
            }
            @media print {
              body { background: white; }
              .preview-container { box-shadow: none; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2>Barcode Preview</h2>
            <div class="barcode-image">
              <img src="${canvas.toDataURL()}" style="max-width: 100%;" />
            </div>
            <div class="barcode-info">
              <div><strong>Status:</strong> ${barcode.status}</div>
              <button onclick="window.print()" class="print-btn">
              <svg style="width:16px;height:16px;margin-right:8px;vertical-align:-2px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
              </svg>
              Print
            </button>
            </div>
            
          </div>
        </body>
        </html>
      `);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcode Generator</h1>
          <p className="text-muted-foreground">
            Generate and manage unique barcodes for your products
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedBarcodes.length > 0 && (
            <Button 
              onClick={handleDownloadImages} 
              variant="default"
              disabled={downloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {selectedBarcodes.length} as {selectedBarcodes.length === 1 ? 'PNG' : 'PDF'}
              {downloading && '...'}
            </Button>
          )}
          
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Barcodes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Barcodes</DialogTitle>
                <DialogDescription>
                  Create new unique barcodes. Maximum 50 per request.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Label htmlFor="count">Number of barcodes to generate (1-50)</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Each barcode will have a unique sequential ID (10-digit format)
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Barcode List</CardTitle>
              <CardDescription>
                Total {pagination.total} barcodes • Page {pagination.page} of {pagination.totalPages}
                {selectedBarcodes.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {selectedBarcodes.length} selected
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search barcodes..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : barcodes.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-muted-foreground">No barcodes found</div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setGenerateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Barcode
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                      className='border border-gray-600'
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Barcode ID</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barcodes.map((barcode) => (
                    <TableRow key={barcode.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                        className='border border-gray-600'
                          checked={selectedBarcodes.includes(barcode.id)}
                          onCheckedChange={() => handleSelectBarcode(barcode.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        #{barcode.barcode_id}
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {barcode.barcode}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(barcode.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(barcode.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewBarcode(barcode)}
                            title="Preview barcode"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(barcode.barcode)}
                            title="Copy barcode"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}