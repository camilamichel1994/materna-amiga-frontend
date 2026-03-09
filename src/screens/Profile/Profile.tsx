import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../../components/TopNav';
import { LocationOn, Star, Edit, Inventory, Favorite } from '@mui/icons-material';
import { getProfileService, getMeService, ProfileResponse, Review } from '../../services';
import './Profile.css';

const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      let profileData: ProfileResponse;
      
      if (id) {
        profileData = await getProfileService(id);
      } else {
        const me = await getMeService();
        profileData = await getProfileService(me.id);
      }
      setProfile(profileData);
      setReviews(profileData.reviews || []);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number): React.ReactElement[] => {
    const stars: React.ReactElement[] = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star filled" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="star empty" />);
    }
    return stars;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="profile-screen">
        <TopNav />
        <div className="sk-profile">
          <div className="sk sk-circle sk-profile-avatar" />
          <div className="sk sk-text-lg" style={{ width: 160 }} />
          <div className="sk sk-text" style={{ width: 120 }} />
          <div className="sk-profile-stats">
            <div className="sk sk-profile-stat" />
            <div className="sk sk-profile-stat" />
            <div className="sk sk-profile-stat" />
          </div>
          <div className="sk-profile-items">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk sk-profile-item" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-screen">
        <TopNav />
        <div style={{ textAlign: 'center', padding: '40px' }}>Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      <TopNav />
      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name || ''} />
              ) : (
                (profile.name || '?').charAt(0)
              )}
            </div>
            <h1 className="profile-name">{profile.name || 'Usuário'}</h1>
            <div className="profile-info">
              {profile.location && (
                <div className="profile-location">
                  <LocationOn className="location-icon" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.baby_age_range && (
                <div className="profile-baby-age">Bebê: {profile.baby_age_range}</div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Star />
            </div>
            <div className="stat-value">{profile.rating?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">Avaliação</div>
            {profile.rating && (
              <div className="rating">
                {renderStars(profile.rating)}
              </div>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Favorite />
            </div>
            <div className="stat-value">{profile.total_sales || 0}</div>
            <div className="stat-label">Vendas</div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-action">
            <Edit />
            <span>Editar perfil</span>
          </button>
          <button className="btn btn-action" onClick={() => navigate('/my-listings')}>
            <Inventory />
            <span>Meus anúncios</span>
          </button>
        </div>

        {reviews.length > 0 && (
          <div className="reviews-section">
            <h2 className="section-title">Avaliações ({reviews.length})</h2>
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-name">{review.user.name}</div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <div className="review-comment">{review.comment}</div>
                  )}
                  <div className="review-date">{formatDate(review.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

