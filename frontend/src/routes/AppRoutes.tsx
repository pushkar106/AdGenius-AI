import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

import { LandingPage } from '../pages/marketing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';

import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CreateImagePage } from '../pages/dashboard/CreateImagePage';
import { CreateVideoPage } from '../pages/dashboard/CreateVideoPage';
import { AvatarStudioPage } from '../pages/dashboard/AvatarStudioPage';
import { ProductsPage } from '../pages/dashboard/ProductsPage';
import { AdvertisementsPage } from '../pages/dashboard/AdvertisementsPage';
import { MediaLibraryPage } from '../pages/dashboard/MediaLibraryPage';
import { CreditHistoryPage } from '../pages/dashboard/CreditHistoryPage';
import { PricingPage } from '../pages/dashboard/PricingPage';
import { SettingsPage } from '../pages/dashboard/SettingsPage';

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Marketing Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Authentication Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Authenticated Application Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai/images" element={<CreateImagePage />} />
        <Route path="/ai/videos" element={<CreateVideoPage />} />
        <Route path="/ai/avatar" element={<AvatarStudioPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/advertisements" element={<AdvertisementsPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />
        <Route path="/credits" element={<CreditHistoryPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Super Admin Section */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
