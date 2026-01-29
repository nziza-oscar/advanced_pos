'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Trash2,
  Edit2,
  Filter,
  Loader2
} from 'lucide-react';
import { useModalStore } from '@/lib/store/modal-store';
import { toast } from 'sonner';
import { AddStaffModal } from '@/components/staff/AddStaffModal';
import { EditStaffModal } from '@/components/staff/EditStaffModal';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

interface StaffMember {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier' | 'inventory_manager';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export default function StaffManagementPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  
  const { openModal, closeModal, type, data: modalData, isOpen } = useModalStore();

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [staffRes, statsRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/staff/stats')
      ]);
      
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffMembers(staffData.data || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || { total: 0, active: 0, newThisMonth: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    openModal('add-staff');
  };

  const handleEditStaff = (staff: StaffMember) => {
    openModal('edit-staff', { staff });
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    openModal('confirmation', {
      title: 'Delete Staff Member',
      message: `Are you sure you want to delete ${staff.full_name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/staff/${staff.id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            toast.success('Staff member deleted successfully');
            fetchStaffData();
          } else {
            const error = await response.json();
            toast.error(error.error || 'Failed to delete staff member');
          }
        } catch (error) {
          toast.error('Failed to delete staff member');
        }
      },
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'destructive'
    });
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    try {
      const response = await fetch(`/api/staff/${staff.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !staff.is_active })
      });
      
      if (response.ok) {
        toast.success(`Staff ${staff.is_active ? 'deactivated' : 'activated'} successfully`);
        fetchStaffData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredStaff = staffMembers.filter(staff => 
    staff.full_name.toLowerCase().includes(search.toLowerCase()) ||
    staff.email.toLowerCase().includes(search.toLowerCase()) ||
    staff.username.toLowerCase().includes(search.toLowerCase()) ||
    staff.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-50 text-purple-600';
      case 'manager': return 'bg-blue-50 text-blue-600';
      case 'cashier': return 'bg-emerald-50 text-emerald-600';
      case 'inventory_manager': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-medium">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Staff Management</h1>
            <p className="text-slate-400 font-medium mt-1">Manage permissions and team member access.</p>
          </div>
          <button 
            onClick={handleAddStaff}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-widest">Add New Staff</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-blue-50/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</p>
              <p className="text-xl font-bold text-slate-800">{stats.total} Members</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-blue-50/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
              <p className="text-xl font-bold text-slate-800">{stats.active} Active</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-blue-50/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New This Month</p>
              <p className="text-xl font-bold text-slate-800">{stats.newThisMonth} Hires</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-blue-50/50 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff by name, email, or role..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Login</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                          {staff.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{staff.full_name}</p>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                            <Mail className="w-3 h-3" />
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getRoleColor(staff.role)}`}>
                        {formatRole(staff.role)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">
                            {staff.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button 
                            onClick={() => handleToggleStatus(staff)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {staff.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-500">
                      {staff.last_login ? new Date(staff.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditStaff(staff)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(staff)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStaff.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400 font-medium">No staff members found</p>
                {search && (
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your search</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isOpen && type === 'add-staff' && (
        <AddStaffModal 
          onSuccess={() => {
            fetchStaffData();
            closeModal();
          }}
        />
      )}

      {isOpen && type === 'edit-staff' && modalData?.staff && (
        <EditStaffModal 
          staff={modalData.staff}
          onSuccess={() => {
            fetchStaffData();
            closeModal();
          }}
        />
      )}

      {isOpen && type === 'confirmation' && modalData && (
        <ConfirmationModal 
          isOpen={isOpen}
          onClose={closeModal}
          title={modalData.title || 'Confirm Action'}
          message={modalData.message || 'Are you sure?'}
          onConfirm={modalData.onConfirm}
          onCancel={modalData.onCancel}
          confirmText={modalData.confirmText}
          cancelText={modalData.cancelText}
          confirmVariant={modalData.confirmVariant}
        />
      )}
    </>
  );
}