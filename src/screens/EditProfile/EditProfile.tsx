import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopNav from '../../components/TopNav';
import { CameraAlt, ArrowBack } from '@mui/icons-material';
import { useAccount } from '../../contexts/AccountContext';
import { updateProfileService } from '../../services';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setAvatarPreview(user.avatarUrl || null);
  }, [user, navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('O nome não pode estar vazio.');
      return;
    }

    if (trimmedName.length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: { name?: string; avatarUrl?: string } = {};

      if (trimmedName !== user.name) {
        payload.name = trimmedName;
      }

      if (avatarBase64) {
        payload.avatarUrl = avatarBase64;
      }

      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração foi feita.');
        setIsSaving(false);
        return;
      }

      await updateProfileService(user.id, payload);
      await refreshUser();
      toast.success('Perfil atualizado com sucesso!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div className="edit-profile-screen">
      <TopNav />
      <div className="edit-profile-container">
        <div className="edit-profile-back">
          <button type="button" className="btn-back" onClick={() => navigate('/profile')}>
            <ArrowBack />
            <span>Voltar ao perfil</span>
          </button>
        </div>

        <div className="edit-profile-card">
          <h1 className="edit-profile-title">Editar Perfil</h1>

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="avatar-section">
              <div className="avatar-wrapper" onClick={handleAvatarClick}>
                <div className="avatar-display">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={name} className="avatar-image" />
                  ) : (
                    <span className="avatar-initial">{initial}</span>
                  )}
                </div>
                <div className="avatar-overlay">
                  <CameraAlt className="avatar-overlay-icon" />
                  <span>Alterar foto</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="file-input-hidden"
              />
              <p className="avatar-hint">Clique na foto para alterar</p>
            </div>

            <div className="form-fields">
              <div className="form-field">
                <label htmlFor="edit-name">Nome</label>
                <input
                  type="text"
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-email">E-mail</label>
                <input
                  type="email"
                  id="edit-email"
                  value={user?.email || ''}
                  disabled
                  className="field-disabled"
                />
                <p className="field-hint">O e-mail não pode ser alterado.</p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/profile')}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
