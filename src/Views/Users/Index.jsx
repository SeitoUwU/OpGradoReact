import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Mail, Building2, Hash, Shield, Save, Edit2, UserMinus, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../AuthContext/AuthContextV2';
import { authAPI, usersAPI } from '../../services/apiV2.js';
import Button from '../../components/Button';
import Card, { CardHeader, CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import EmptyState from '../../components/EmptyState';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    phone: '',
    identificationType: 'cedula',
    identificationNumber: '',
    company: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const roleOptions = [
    { value: 'client', label: 'Cliente' },
    { value: 'admin', label: 'Administrador' }
  ];

  const identificationTypes = [
    { value: 'cedula', label: 'Cédula de Ciudadanía' },
    { value: 'nit', label: 'NIT' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'extranjeria', label: 'Cédula de Extranjería' }
  ];

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newUser.firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!newUser.lastName.trim()) errors.lastName = 'El apellido es requerido';
    if (!newUser.email.trim()) errors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) errors.email = 'Correo inválido';
    if (!newUser.password) errors.password = 'La contraseña es requerida';
    else if (newUser.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    if (!['admin', 'client'].includes(newUser.role)) errors.role = 'El rol debe ser admin o client';
    if (!newUser.identificationNumber.trim()) errors.identificationNumber = 'El número de identificación es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const userData = {
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };

      // Agregar campos opcionales solo si tienen valor
      if (newUser.phone) userData.phone = newUser.phone;
      if (newUser.identificationType) userData.identificationType = newUser.identificationType;
      if (newUser.identificationNumber) userData.identificationNumber = newUser.identificationNumber;
      if (newUser.company) userData.company = newUser.company;
      if (newUser.address) userData.address = newUser.address;

      await authAPI.adminCreateUser(userData);
      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      phone: '',
      identificationType: 'cedula',
      identificationNumber: '',
      company: '',
      address: ''
    });
    setFormErrors({});
  };

  const handleUserClick = (usr) => {
    setSelectedUser(usr);
    setEditingUser(false);
    setShowDetailModal(true);
  };

  const handleEditUser = () => {
    setEditingUser(true);
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      await usersAPI.update(selectedUser.id, {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        phone: selectedUser.phone,
        company: selectedUser.company,
        address: selectedUser.address
      });
      toast.success('Usuario actualizado exitosamente');
      setEditingUser(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!confirm(`¿Estás seguro de dar de baja a ${selectedUser.firstName} ${selectedUser.lastName}?\n\nEsto liberará todos sus tanques asignados.`)) {
      return;
    }

    try {
      setSaving(true);
      await usersAPI.delete(selectedUser.id);
      toast.success('Usuario dado de baja exitosamente. Sus tanques han sido liberados.');
      setShowDetailModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Error al dar de baja usuario');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role?.toLowerCase() !== 'admin') {
    return <EmptyState preset="error" title="Acceso Denegado" icon={Shield} />;
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl"><Users className="text-white" size={32} /></div>
            Gestión de Usuarios
          </h1>
          <Button variant="primary" icon={<UserPlus size={20} />} onClick={() => setShowCreateModal(true)}>Crear Usuario</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((usr) => (
              <Card key={usr.id} gradient hover onClick={() => handleUserClick(usr)} className="cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${usr.role?.toLowerCase() === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                      <Shield className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{usr.firstName} {usr.lastName}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={usr.role?.toLowerCase() === 'admin' ? 'danger' : 'info'} size="sm">{usr.role}</Badge>
                        {usr.isActive === false && (
                          <Badge variant="secondary" size="sm">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <p className="text-sm">{usr.email}</p>
                  </div>
                  {usr.identificationNumber && (
                    <div className="flex items-center gap-2 mt-2">
                      <Hash size={16} className="text-gray-400" />
                      <p className="text-sm">{usr.identificationType?.toUpperCase()}: {usr.identificationNumber}</p>
                    </div>
                  )}
                  {usr.company && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 size={16} className="text-gray-400" />
                      <p className="text-sm">{usr.company}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Crear Usuario" size="lg">
        <div className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} error={formErrors.firstName} required />
            <Input label="Apellido" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} error={formErrors.lastName} required />
            <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} error={formErrors.email} required />
            <Input label="Teléfono" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} error={formErrors.phone} />
            <Select label="Tipo de Documento" value={newUser.identificationType} onChange={(v) => setNewUser({...newUser, identificationType: v})} options={identificationTypes} required />
            <Input label="Número de Documento" value={newUser.identificationNumber} onChange={(e) => setNewUser({...newUser, identificationNumber: e.target.value})} error={formErrors.identificationNumber} required />
            <Input label="Empresa" value={newUser.company} onChange={(e) => setNewUser({...newUser, company: e.target.value})} placeholder="Opcional" />
            <Select label="Rol" value={newUser.role} onChange={(v) => setNewUser({...newUser, role: v})} options={roleOptions} required />
            <Input label="Contraseña" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} error={formErrors.password} required />
            <Input label="Confirmar Contraseña" type="password" value={newUser.confirmPassword} onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} error={formErrors.confirmPassword} required />
          </div>
          <Input label="Dirección" value={newUser.address} onChange={(e) => setNewUser({...newUser, address: e.target.value})} placeholder="Opcional" />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => { setShowCreateModal(false); resetForm(); }} disabled={saving}>Cancelar</Button>
            <Button variant="primary" icon={<Save size={20} />} onClick={handleCreateUser} loading={saving}>Crear Usuario</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle/Edición Usuario */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Detalle del Usuario'}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header con info básica */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${selectedUser.role?.toLowerCase() === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                  <Shield className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedUser.role?.toLowerCase() === 'admin' ? 'danger' : 'info'}>{selectedUser.role}</Badge>
                    <Badge variant={selectedUser.isActive !== false ? 'success' : 'secondary'}>
                      {selectedUser.isActive !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del usuario */}
            {!editingUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-gray-400" />
                      <p className="text-sm font-semibold">{selectedUser.email}</p>
                    </div>
                  </div>

                  {selectedUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone size={16} className="text-gray-400" />
                        <p className="text-sm font-semibold">{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.identificationNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Identificación</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash size={16} className="text-gray-400" />
                        <p className="text-sm font-semibold">
                          {selectedUser.identificationType?.toUpperCase()}: {selectedUser.identificationNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedUser.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresa</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={16} className="text-gray-400" />
                        <p className="text-sm font-semibold">{selectedUser.company}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedUser.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={16} className="text-gray-400" />
                      <p className="text-sm font-semibold">{selectedUser.address}</p>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="primary"
                    icon={<Edit2 size={18} />}
                    onClick={handleEditUser}
                    className="flex-1"
                  >
                    Editar Usuario
                  </Button>
                  {selectedUser.isActive !== false && selectedUser.role?.toLowerCase() !== 'admin' && (
                    <Button
                      variant="danger"
                      icon={<UserMinus size={18} />}
                      onClick={handleDeactivateUser}
                      loading={saving}
                      className="flex-1"
                    >
                      Dar de Baja
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    required
                  />
                  <Input
                    label="Apellido"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    required
                  />
                  <Input
                    label="Teléfono"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  />
                  <Input
                    label="Empresa"
                    value={selectedUser.company || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, company: e.target.value})}
                  />
                </div>

                <Input
                  label="Dirección"
                  value={selectedUser.address || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Nota:</strong> El email, rol y tipo de identificación no se pueden modificar.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingUser(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Save size={18} />}
                    onClick={handleSaveUser}
                    loading={saving}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserManagement;
