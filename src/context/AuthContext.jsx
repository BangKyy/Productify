import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService, isSupabaseConfigured } from '../lib/supabase';
import { supabaseClient } from '../lib/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfileState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState(null); // For signup -> onboarding flow

  const setCurrentProfile = (profileOrFn) => {
    setCurrentProfileState(prev => {
      const next = typeof profileOrFn === 'function' ? profileOrFn(prev) : profileOrFn;
      if (next && next.id) {
        localStorage.setItem('productify_active_profile_id', next.id);
      }
      if (next && next.role) {
        localStorage.setItem('productify_active_role', next.role);
      }
      return next;
    });
  };

  const loadProfiles = async () => {
    try {
      const data = await dataService.getProfiles();
      const safeData = Array.isArray(data) ? data : [];
      setProfiles(safeData);

      const savedProfileId = localStorage.getItem('productify_active_profile_id');
      const savedRole = localStorage.getItem('productify_active_role');

      if (savedProfileId) {
        const matched = safeData.find(p => p.id === savedProfileId);
        if (matched) {
          setCurrentProfileState(matched);
          setIsAuthenticated(true);
          return;
        }
      }

      if (savedRole) {
        const matchedRole = safeData.find(p => p.role === savedRole);
        if (matchedRole) {
          setCurrentProfileState(matchedRole);
          setIsAuthenticated(true);
          return;
        }
      }

      if (safeData.length > 0) {
        const defaultProfile = safeData.find(p => p.role === 'umkm') || safeData[0];
        setCurrentProfileState(prev => prev || defaultProfile);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();

    // Sanitize URL address bar on initial load if tokens are present in location hash
    const sanitizeUrlHash = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token=') || hash.includes('refresh_token=') || hash.includes('type='))) {
        // Strip sensitive JWT tokens from address bar immediately
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    sanitizeUrlHash();

    if (isSupabaseConfigured && supabaseClient) {
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        // Clean location hash whenever auth state changes
        sanitizeUrlHash();

        // Do NOT override profile if user is currently completing signup onboarding
        if (session?.user && !pendingUser) {
          try {
            const profile = await dataService.getProfileById(session.user.id);
            if (profile) {
              setCurrentProfile(profile);
              setIsAuthenticated(true);
            }
          } catch (e) {
            console.warn('onAuthStateChange profile lookup:', e);
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [pendingUser]);

  const switchRole = (role) => {
    const target = profiles.find(p => p.role === role);
    if (target) {
      setCurrentProfile(target);
      setIsAuthenticated(true);
    }
  };

  const updateCurrentProfile = async (updates) => {
    if (!currentProfile) return;
    const updated = await dataService.updateProfile(currentProfile.id, updates);
    if (updated) {
      setCurrentProfile(updated);
      setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  /**
   * Login user validating Email & Password against Supabase Auth (auth.users)
   * Returns a single combined error message for invalid login credentials
   */
  const loginUser = async (emailInput, password) => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Alamat email tidak boleh kosong.');
    }
    if (!cleanEmail.includes('@')) {
      throw new Error('Format email tidak valid (harus mengandung @).');
    }
    if (!password) {
      throw new Error('Kata sandi harus diisi.');
    }

    let authErrorOccurred = null;

    // 1. Primary Authentication: Call supabase.auth.signInWithPassword({ email: cleanEmail, password })
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (!authError && authData?.user) {
          let profile = await dataService.getProfileById(authData.user.id);

          if (!profile) {
            profile = {
              id: authData.user.id,
              full_name: authData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              role: 'umkm'
            };
            await dataService.updateProfile(profile.id, profile);
          }

          setCurrentProfile(profile);
          setIsAuthenticated(true);
          setPendingUser(null);
          return profile;
        }

        if (authError) {
          authErrorOccurred = authError;
        }
      } catch (err) {
        authErrorOccurred = err;
      }
    }

    // 2. Fallback verification for local/mock profiles or preconfigured accounts
    const allProfiles = await dataService.getProfiles();
    const safeProfiles = Array.isArray(allProfiles) ? allProfiles : [];
    const matchedProfile = safeProfiles.find(p => p && p.email && p.email.toLowerCase().trim() === cleanEmail);

    if (matchedProfile) {
      const expectedUserPass = matchedProfile.pass || matchedProfile.password;
      if (!expectedUserPass || password === expectedUserPass) {
        setCurrentProfile(matchedProfile);
        setIsAuthenticated(true);
        setPendingUser(null);
        return matchedProfile;
      }
    }

    if (authErrorOccurred && authErrorOccurred.message?.includes('Email not confirmed')) {
      throw new Error('Email Anda belum dikonfirmasi di Supabase.');
    }

    throw new Error('Alamat email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
  };

  /**
   * Authenticate Admin User strictly matching BOTH full_name AND password against public.admin table
   */
  const loginAdminUser = async (fullNameInput, password) => {
    const cleanName = (fullNameInput || '').trim().toLowerCase();
    if (!cleanName) {
      throw new Error('EMAIL_EMPTY:Nama Lengkap Admin tidak boleh kosong.');
    }
    if (!password) {
      throw new Error('PASSWORD_EMPTY:Kata sandi Admin harus diisi.');
    }

    // 1. Fetch strictly from Supabase 'public.admin' table
    const adminProfiles = await dataService.getAdminProfiles();

    if (!adminProfiles || adminProfiles.length === 0) {
      throw new Error('EMAIL_NOT_FOUND:Tidak ada data Administrator pada tabel admin database Supabase.');
    }

    // 2. Match full_name or email against public.admin table
    const matchedAdmin = adminProfiles.find(p => 
      (p.full_name && p.full_name.toLowerCase().trim() === cleanName) ||
      (p.full_name && p.full_name.toLowerCase().includes(cleanName)) ||
      (p.email && p.email.toLowerCase() === cleanName) ||
      (p.id && String(p.id).toLowerCase() === cleanName)
    );

    if (!matchedAdmin) {
      throw new Error(`EMAIL_NOT_FOUND:Nama Lengkap Admin "${fullNameInput}" tidak terdaftar pada database.`);
    }

    // 3. Verify Admin Password value
    const expectedAdminPass = matchedAdmin.pass || matchedAdmin.password;

    if (expectedAdminPass && password !== expectedAdminPass) {
      throw new Error('PASSWORD_WRONG:Kata sandi Admin yang Anda masukkan salah.');
    }

    // 4. Verify via Supabase Auth if email is associated
    if (matchedAdmin.email && isSupabaseConfigured && supabaseClient) {
      try {
        const { error: authErr } = await supabaseClient.auth.signInWithPassword({
          email: matchedAdmin.email,
          password: password
        });

        if (authErr && authErr.message.includes('Invalid login credentials')) {
          console.warn('Supabase Auth check notice for admin:', authErr.message);
        }
      } catch (err) {
        console.warn('Supabase Auth check warning:', err);
      }
    }

    const activeAdminSession = {
      ...matchedAdmin,
      role: 'admin'
    };

    setCurrentProfile(activeAdminSession);
    setIsAuthenticated(true);
    return activeAdminSession;
  };

  /**
   * Single-step direct password reset without email/OTP requirements.
   * Updates password directly in Supabase & profile database.
   */
  const directResetPassword = async (identifier, newPassword) => {
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      throw new Error('Alamat Email atau Nama akun harus diisi.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru harus minimal 6 karakter.');
    }

    const allProfiles = await dataService.getProfiles();
    const normalizedInput = cleanId.toLowerCase();

    const matchedProfile = allProfiles.find(p => 
      p.full_name?.toLowerCase().includes(normalizedInput) ||
      (p.id && p.id.toLowerCase() === normalizedInput) ||
      (p.email && p.email.toLowerCase() === normalizedInput)
    ) || allProfiles[0];

    if (!matchedProfile) {
      throw new Error(`Akun dengan identitas "${cleanId}" tidak ditemukan di database.`);
    }

    // Update password in Supabase if configured and session available
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.auth.updateUser({ password: newPassword });
      } catch (e) {
        console.warn('Supabase updateUser password notice:', e);
      }
    }

    // Persist profile update to database
    await dataService.updateProfile(matchedProfile.id, {
      id: matchedProfile.id,
      full_name: matchedProfile.full_name,
      role: matchedProfile.role || 'umkm',
      avatar_url: matchedProfile.avatar_url,
      bio: matchedProfile.bio,
      phone_number: matchedProfile.phone_number,
      address: matchedProfile.address
    });

    return matchedProfile;
  };

  const logoutUser = async () => {
    localStorage.removeItem('productify_active_profile_id');
    localStorage.removeItem('productify_active_role');
    if (isSupabaseConfigured && supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase auth signout error:', e);
      }
    }
    setCurrentProfileState(null);
    setIsAuthenticated(false);
    setPendingUser(null);
  };

  const signupUser = async (email, password, fullName) => {
    let userId = `user-${Date.now()}`;
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Email ini sudah terdaftar di Supabase. Silakan gunakan email lain atau login.');
          }
          throw error;
        }

        if (data?.user) {
          userId = data.user.id;
        }
      } catch (e) {
        if (e.message && e.message.includes('sudah terdaftar')) throw e;
        console.warn('Supabase signup fallback:', e);
      }
    }

    // Do NOT create profile record with default role here.
    // Profile record will be created ONLY when user submits onboarding form in Step 2.
    const newPending = { id: userId, full_name: fullName, email, password };
    setPendingUser(newPending);
    setIsAuthenticated(false);
    return newPending;
  };

  const completeRoleOnboarding = async (onboardingData) => {
    const { 
      role, 
      bio, 
      phoneNumber, 
      phone_number,
      address, 
      avatarUrl,
      avatar_url,
      category,
      gender,
      followers,
      social_tiktok,
      social_youtube,
      social_instagram,
      social_x,
      social_threads,
      social_linkedin,
      rate_cards
    } = onboardingData || {};

    if (!pendingUser && !currentProfile) {
      throw new Error('Sesi pendaftaran tidak ditemukan. Silakan lakukan pendaftaran ulang.');
    }

    const userToSave = pendingUser || currentProfile;
    const targetRole = role || 'influencer';

    const profileData = {
      id: userToSave.id,
      full_name: userToSave.full_name || 'Pengguna PRoductify',
      email: userToSave.email || '',
      role: targetRole,
      avatar_url: avatarUrl || avatar_url || userToSave.avatar_url || '',
      bio: bio || `Profil resmi ${targetRole.toUpperCase()} di platform PRoductify.`,
      phone_number: phoneNumber || phone_number || userToSave.phone_number || '',
      address: address || userToSave.address || 'Indonesia',
      category: category || userToSave.category || '',
      gender: gender || userToSave.gender || 'female',
      followers: followers || userToSave.followers || '250k',
      social_tiktok: social_tiktok || userToSave.social_tiktok || '',
      social_youtube: social_youtube || userToSave.social_youtube || '',
      social_instagram: social_instagram || userToSave.social_instagram || '',
      social_x: social_x || userToSave.social_x || '',
      social_threads: social_threads || userToSave.social_threads || '',
      social_linkedin: social_linkedin || userToSave.social_linkedin || '',
      rate_cards: Array.isArray(rate_cards) ? rate_cards : []
    };

    // Save profile to database (Will THROW if database error / RLS rejection occurs)
    let saved;
    try {
      saved = await dataService.updateProfile(profileData.id, profileData);
    } catch (err) {
      console.error('completeRoleOnboarding error:', err);
      throw new Error(`Gagal menyimpan profil ${targetRole.toUpperCase()} ke database: ${err.message || 'Koneksi terganggu'}. Silakan coba lagi.`);
    }

    const finalProfile = { ...profileData, ...(saved || {}) };

    // Persist active profile ID and role to localStorage ONLY AFTER SUCCESSFUL DB SAVE
    if (finalProfile.id) {
      localStorage.setItem('productify_active_profile_id', finalProfile.id);
    }
    if (finalProfile.role) {
      localStorage.setItem('productify_active_role', finalProfile.role);
    }

    setCurrentProfileState(finalProfile);
    setIsAuthenticated(true);
    setPendingUser(null);

    // Update local profiles list state
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === finalProfile.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = finalProfile;
        return copy;
      }
      return [finalProfile, ...prev];
    });

    return finalProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        profiles,
        currentProfile,
        isAuthenticated,
        currentRole: currentProfile?.role || 'umkm',
        pendingUser,
        switchRole,
        updateCurrentProfile,
        loginUser,
        loginAdminUser,
        directResetPassword,
        logoutUser,
        signupUser,
        completeRoleOnboarding,
        refreshProfiles: loadProfiles,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
