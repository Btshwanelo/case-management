import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useExecuteRequest1Mutation,
  useExecuteRequest2Mutation,
  useExecuteRequest3Mutation,
  useExecuteRequest4Mutation,
} from '@/services/apiService';
import { useSearchParams } from 'react-router-dom';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  permissions?: Record<string, boolean>;
  createdOn?: string;
  lastLogin?: string;
  lastLogon?: string; // API response field
  contactPersonId?: string;
  externalLogonNames?: string;
}

interface UsersManagementProps {
  setNextStep?: (step: string) => void;
  userDetails: any;
}

const UsersManagement = ({ setNextStep, userDetails }: UsersManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'view', 'edit'
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [modalFormData, setModalFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    permissions: Record<string, boolean>;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'User',
    status: 'Active',
    permissions: {},
  });

  const [getNavList, getNavListProps] = useExecuteRequest1Mutation();
  const [createContactPerson, { isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] = useExecuteRequest2Mutation();
  const [updateContactPerson] = useExecuteRequest3Mutation();
  const [getContactPersonList, getContactPersonListProps] = useExecuteRequest4Mutation();
  // Helper function to format last login date
  const formatLastLogin = (lastLogon: string): string => {
    if (!lastLogon || lastLogon === '0001-01-01T00:00:00' || lastLogon.startsWith('0001-01-01')) {
      return 'Never';
    }
    try {
      const date = new Date(lastLogon);
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Never';
    }
  };

  // Helper function to parse externalLogonNames and create permissions object
  const parsePermissions = (externalLogonNames: string, navItems: any[] = []): Record<string, boolean> => {
    const permissions: Record<string, boolean> = {};

    if (!externalLogonNames || !navItems || navItems.length === 0) {
      return permissions;
    }

    // Split the comma-separated string and trim each item
    const enabledPermissions = externalLogonNames.split(',').map((name) => name.trim());

    // Map each nav item to check if it's enabled
    navItems.forEach((item) => {
      permissions[item.name] = enabledPermissions.includes(item.name);
    });

    return permissions;
  };

  const handleCreateContactPerson = (formData: typeof modalFormData) => {
    // Get nav items from API response
    const navItems = getNavListProps?.data?.ExternalLogonNavItems || [];

    // Map selected permissions to ExternalogNav array
    const ExternalogNav = navItems
      .filter((navItem: any) => formData.permissions[navItem.name] === true)
      .map((navItem: any) => ({
        Title: navItem.name,
        ExternalNavItemId: navItem.externalNavItemId,
        Allowed: true,
      }));

    createContactPerson({
      body: {
        EntityName: 'Supplier',
        RequestName: 'CreateContactPerson',
        inputParamters: {
          ContactPerson: {
            SupplierId: userDetails.supplierId,
            Contacts: [
              {
                FirstName: formData.firstName.trim(),
                LastName: formData.lastName.trim(),
                Mobile: '', // Mobile is optional, can be added to form later if needed
                Email: formData.email.trim(),
              },
            ],
            ExternalogNav: ExternalogNav,
          },
        },
      },
    });
  };

  const handleUpdateContactPerson = () => {
    updateContactPerson({
      body: {
        entityName: 'ExternalLogonNav',
        requestName: 'UpdateExternalLogNav',
        inputParamters: {
          ExternalLogonNav: {
            Name: 'Event',
            ContactPersonId: '75810573-17dd-4635-97e5-3f6d7dcc9fe2',
            ExternalLogonNavId: '93C3CCF4-BC44-491C-B879-1C781A818CE7',
            ExternalNavStatusId: 1141,
          },
        },
      },
    });
  };

  useEffect(() => {
    getContactPersonList({
      body: {
        entityName: 'Supplier',
        requestName: 'ContactPersonListing',
        inputParamters: {
          SupplierId: userDetails.supplierId,
        },
      },
    });

    getNavList({
      body: {
        entityName: 'ExternalNavItem',
        requestName: 'ExternalLogonNavListing',
      },
    });
  }, []);

  // Transform API data when it's available
  useEffect(() => {
    if (getContactPersonListProps?.data?.ContactPerson && getNavListProps?.data?.ExternalLogonNavItems) {
      const contactPersons = getContactPersonListProps.data.ContactPerson;
      const navItems = getNavListProps.data.ExternalLogonNavItems || [];

      setUsers(contactPersons);
    }
  }, [getContactPersonListProps?.data, getNavListProps?.data]);

  // Handle create contact person success/error
  useEffect(() => {
    if (isCreateSuccess) {
      showSuccessToast('Contact person created successfully');
      // Refresh the contact person list
      getContactPersonList({
        body: {
          entityName: 'Supplier',
          requestName: 'ContactPersonListing',
          inputParamters: {
            SupplierId: userDetails.supplierId,
          },
        },
      });
    }
    if (isCreateError) {
      const errorMessage = (createError as any)?.data?.clientMessage || 'Failed to create contact person';
      showErrorToast(errorMessage);
    }
  }, [isCreateSuccess, isCreateError, createError]);

  const openModal = (mode: 'add' | 'view' | 'edit', user: User | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (mode === 'add') {
      // Initialize permissions based on nav items
      const initialPermissions: Record<string, boolean> = {};
      if (getNavListProps?.data?.ExternalLogonNavItems) {
        getNavListProps.data.ExternalLogonNavItems.forEach((item: any) => {
          initialPermissions[item.name] = false;
        });
      }
      setModalFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'User',
        status: 'Active',
        permissions: initialPermissions,
      });
    } else if (user) {
      // Parse name into firstName and lastName
      const nameParts = (user.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setModalFormData({
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        role: user.role || 'User',
        status: user.status || 'Active',
        permissions: { ...(user.permissions || {}) },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handlePermissionToggle = (permission: string) => {
    if (modalMode === 'view') return;

    setModalFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  useEffect(() => {
    const currentStep = searchParams.get('s');
    if (currentStep !== 'users') {
      setSearchParams({ ...Object.fromEntries(searchParams), s: 'users' });
    }
  }, []);

  const handleSaveUser = () => {
    if (modalMode === 'add') {
      // Validate required fields
      if (!modalFormData.firstName.trim() || !modalFormData.lastName.trim() || !modalFormData.email.trim()) {
        alert('Please fill in all required fields (First Name, Last Name, and Email)');
        return;
      }

      // Check if at least one permission is selected
      const hasPermissions = Object.values(modalFormData.permissions).some((value) => value === true);
      if (!hasPermissions) {
        alert('Please select at least one permission');
        return;
      }

      // Call API to create contact person
      handleCreateContactPerson(modalFormData);
      closeModal();
    } else if (modalMode === 'edit') {
      // TODO: Implement update contact person API call
      if (selectedUser && selectedUser.id) {
        setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? { ...user, ...modalFormData } : user)));
      }
      closeModal();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 px-3 py-1 text-sm font-medium'
      : 'bg-red-100 text-red-800 px-3 py-1 text-sm font-medium';
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      Admin: 'bg-purple-100 text-purple-800',
      Manager: 'bg-blue-100 text-blue-800',
      User: 'bg-gray-100 text-gray-800',
    };
    return `${classes[role] || classes['User']} px-3 py-1 text-sm font-medium`;
  };

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-medium">Users Management</h2>
            <p className="text-sm text-gray-500">Manage user access and permissions</p>
          </div>
          <Button
            onClick={() => openModal('add')}
            className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
          >
            <Plus size={20} />
            Create New User
          </Button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              <p className="text-sm text-gray-500">View and manage user accounts</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {getContactPersonListProps.isLoading || getNavListProps.isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No users found. Click "Create New User" to add one.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.id || user.email || `user-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogon ? formatLastLogin(user.lastLogon) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant={'outline'} onClick={() => openModal('view', user)} className="text-gray-600 ">
                            View
                          </Button>
                          <Button variant={'default'} onClick={() => openModal('edit', user)} className="">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalMode === 'add' ? 'Add New User' : modalMode === 'edit' ? 'Edit User' : 'User Details'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {modalMode === 'add' ? 'Create a new contact person and assign permissions' : 'View or edit user information'}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  {/* <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        className=""
                        value={modalFormData.firstName}
                        onChange={(e) => setModalFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        disabled={modalMode === 'view'}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        className=""
                        value={modalFormData.lastName}
                        onChange={(e) => setModalFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        disabled={modalMode === 'view'}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        className=""
                        value={modalFormData.email}
                        onChange={(e) => setModalFormData((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={modalMode === 'view'}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Page Access Permissions</h3>
                    <span className="text-xs text-gray-500 rounded-lg bg-gray-100 px-3 py-1">
                      {Object.values(modalFormData.permissions).filter(Boolean).length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getNavListProps?.data?.ExternalLogonNavItems.map((permission: any) => {
                      const isEnabled = modalFormData.permissions[permission.name] === true;
                      return (
                        <div
                          key={permission.name}
                          className={`
                            relative p-4 border transition-all duration-200 cursor-pointer
                            ${isEnabled ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                            ${modalMode === 'view' ? 'cursor-default' : ''}
                          `}
                          onClick={() => modalMode !== 'view' && handlePermissionToggle(permission.name)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className={`text-sm font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {permission.name}
                                </h4>
                              </div>
                              {permission.navigate && <p className="text-xs text-gray-500 truncate">{permission.navigate}</p>}
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <Checkbox
                                checked={isEnabled}
                                onCheckedChange={() => modalMode !== 'view' && handlePermissionToggle(permission.name)}
                                disabled={modalMode === 'view'}
                                className="rounded-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white">
                  <Button variant="outline" onClick={closeModal} className="">
                    Cancel
                  </Button>
                  <Button variant={'default'} onClick={handleSaveUser} className="">
                    {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
