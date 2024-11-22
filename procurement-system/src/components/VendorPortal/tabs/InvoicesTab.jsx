import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  AlertCircle,
  Clock,
  Package,
  CheckCircle,
  FilePlus
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { baseURL } from '../../../utils/endpoint';
import CreateInvoiceModal from '../CreateInvoiceModal';

const InvoicesTab = ({ vendorDetails }) => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);

  useEffect(() => {
    if (vendorDetails?._id) {
      fetchVendorGRNs();
    }
  }, [vendorDetails]);

  const fetchVendorGRNs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/grn/vendor/${vendorDetails._id}`);
      setGrns(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch GRNs');
      console.error('GRN fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: AlertCircle },
      completed: { color: 'blue', icon: Package }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
        bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  const handleViewGRN =(grn) =>{
    console.log("grn selected for view",grn);
    
  }
  const filteredGRNs = grns.filter(grn => {
    const matchesSearch = 
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.poReference?.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || grn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (grn) => {
    setSelectedGRN(grn);
    setIsCreateInvoiceModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Invoices & GRNs</h2>
          </div>
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search GRNs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-red-500 py-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">GRN Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">PO Reference</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Receipt Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGRNs.map((grn) => (
                    <tr key={grn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{grn.grnNumber}</td>
                      <td className="px-4 py-3">{grn.poReference?.poNumber || 'N/A'}</td>
                      <td className="px-4 py-3">{format(new Date(grn.receiptDate), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(grn.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {grn.items.length} items
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewGRN(grn)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {grn.status === 'approved' && (
                            <button
                              onClick={() => handleCreateInvoice(grn)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 font-medium rounded-md border border-green-600 hover:bg-green-50"
                            >
                              <FilePlus className="h-4 w-4" />
                              Create Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredGRNs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No GRNs found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => {
          setIsCreateInvoiceModalOpen(false);
          setSelectedGRN(null);
        }}
        grnData={selectedGRN}
      />
    </>
  );
};

export default InvoicesTab;