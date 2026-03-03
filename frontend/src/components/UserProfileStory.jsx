import React, { useState, useMemo } from 'react';
import { Box, Typography, Chip, Button, IconButton } from '@mui/material';
import { 
  Sparkles, 
  MessageCircle, 
  ChevronRight,
  Wine,
  Cigarette,
  Baby,
  Star,
  Music,
} from 'lucide-react';

/**
 * UserProfileStory - Reusable profile content component
 * Used inside expanded UserCard2 for fullscreen profile view
 * Follows Layout V2 spec: No cards, no dividers, whitespace separation
 */
export default function UserProfileStory({ user, onStartConversation }) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [moreAboutExpanded, setMoreAboutExpanded] = useState(false);

  // Generate conversation starters based on interests
  const conversationStarters = useMemo(() => {
    if (!user?.interests?.length) return [];
    
    const starters = [];
    const interests = user.interests.slice(0, 3);
    
    interests.forEach(interest => {
      const interestName = typeof interest === 'string' ? interest : interest.label;
      starters.push({
        question: `What got you into ${interestName}?`,
        message: `Hey! I noticed you're into ${interestName} - what got you into it? 😊`,
      });
    });
    
    return starters;
  }, [user?.interests]);

  if (!user) return null;

  return (
    <Box sx={{ px: 3, pb: 6 }}>
      {/* Block 1: She's into (Vibe) */}
      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={18} color="#6C5CE7" /> {user.firstName}'s Vibe
        </Typography>
        
        {/* Interest chips */}
        {user.interests?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {user.interests.slice(0, 5).map((item, i) => (
              <Chip 
                key={i} 
                label={typeof item === 'string' ? item : item.label} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(108,92,231,0.1)', 
                  color: '#6C5CE7', 
                  fontSize: 12,
                  fontWeight: 500,
                  border: '1px solid rgba(108,92,231,0.2)',
                }} 
              />
            ))}
          </Box>
        )}
        
        {/* Profession */}
        {user.jobTitle && (
          <Typography sx={{ fontSize: 14, color: '#4B5563', mb: 1 }}>
            {user.jobTitle}
          </Typography>
        )}
        
        {/* City only */}
        {user.location && (
          <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
            {user.location}
          </Typography>
        )}
      </Box>

      {/* Block 2: About */}
      {user.bio && (
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', mb: 2 }}>
            About {user.firstName}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: 14, 
              color: '#4B5563', 
              lineHeight: 1.7,
              display: '-webkit-box',
              WebkitLineClamp: bioExpanded ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: bioExpanded ? 'visible' : 'hidden',
            }}
          >
            {user.bio}
          </Typography>
          {user.bio.length > 120 && (
            <Button
              variant="text"
              size="small"
              onClick={() => setBioExpanded(!bioExpanded)}
              sx={{ 
                mt: 0.5, 
                p: 0, 
                minWidth: 'auto',
                color: '#6C5CE7',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {bioExpanded ? 'Read less' : 'Read more'}
            </Button>
          )}
        </Box>
      )}

      {/* Block 3: Let's Talk About */}
      {conversationStarters.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageCircle size={18} color="#6C5CE7" /> Let's Talk About
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {conversationStarters.map((starter, i) => (
              <Box
                key={i}
                onClick={() => onStartConversation?.(starter.message)}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(108,92,231,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(108,92,231,0.12)',
                  },
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C5CE7' }}>
                  💬 {starter.question}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Block 4: Essentials (max 4 items) */}
      <Box sx={{ mb: 6 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', mb: 2 }}>
          Essentials
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {user.location && (
            <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
              Based in {user.location}
            </Typography>
          )}
          {user.languages?.length > 0 && (
            <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
              Speaks {(Array.isArray(user.languages) ? user.languages : [user.languages]).join(', ')}
            </Typography>
          )}
          {user.lookingFor && (
            <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
              Looking for {Array.isArray(user.lookingFor) ? user.lookingFor.join(', ').toLowerCase() : String(user.lookingFor).toLowerCase()}
            </Typography>
          )}
          {user.education && (
            <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
              {user.education}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Block 5: More About (Accordion) */}
      {(user.height || user.zodiac || user.drinking || user.smoking || user.children || user.religion || user.causes?.length > 0 || user.qualities?.length > 0) && (
        <Box sx={{ mb: 6 }}>
          <Box
            onClick={() => setMoreAboutExpanded(!moreAboutExpanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              py: 1,
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
              More About {user.firstName}
            </Typography>
            <ChevronRight 
              size={20} 
              color="#64748b" 
              style={{ 
                transform: moreAboutExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }} 
            />
          </Box>
          
          {moreAboutExpanded && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Physical */}
              {user.height && (
                <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
                  📏 {user.height} cm tall
                </Typography>
              )}
              {user.zodiac && (
                <Typography sx={{ fontSize: 14, color: '#4B5563' }}>
                  ✨ {user.zodiac}
                </Typography>
              )}
              
              {/* Lifestyle chips */}
              {(user.drinking || user.smoking || user.children || user.religion) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {user.drinking && (
                    <Chip icon={<Wine size={14} />} label={user.drinking} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} />
                  )}
                  {user.smoking && (
                    <Chip icon={<Cigarette size={14} />} label={user.smoking} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151' }} />
                  )}
                  {user.children && (
                    <Chip icon={<Baby size={14} />} label={user.children} size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af' }} />
                  )}
                  {user.religion && (
                    <Chip icon={<Star size={14} />} label={user.religion} size="small" sx={{ bgcolor: '#ede9fe', color: '#5b21b6' }} />
                  )}
                </Box>
              )}
              
              {/* Causes */}
              {user.causes?.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Causes & Communities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {user.causes.map((cause, i) => (
                      <Chip 
                        key={i} 
                        label={typeof cause === 'string' ? cause : cause.label} 
                        size="small" 
                        sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: 12 }} 
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Qualities */}
              {user.qualities?.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Qualities I Value</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {user.qualities.map((quality, i) => (
                      <Chip 
                        key={i} 
                        label={typeof quality === 'string' ? quality : quality.label} 
                        size="small" 
                        sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontSize: 12 }} 
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Spotify / Music */}
              {user.favoriteSongs?.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Music size={14} color="#1DB954" /> Favorite Music
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {user.favoriteSongs.slice(0, 4).map((song, i) => (
                      <Box key={i} sx={{ textAlign: 'center', minWidth: 60 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '8px',
                            bgcolor: '#f3f4f6',
                            backgroundImage: song.albumArt ? `url(${song.albumArt})` : 'none',
                            backgroundSize: 'cover',
                            mb: 0.5,
                          }}
                        />
                        <Typography sx={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 60 }}>
                          {song.title || song.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
