import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Mail, Building2, Hash, Shield, Save } from 'lucide-react';
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
              <Card key={usr.id} gradient>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${usr.role?.toLowerCase() === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                      <Shield className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{usr.firstName} {usr.lastName}</h3>
                      <Badge variant={usr.role?.toLowerCase() === 'admin' ? 'danger' : 'info'} size="sm">{usr.role}</Badge>
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
    </>
  );
};

export default UserManagement;
