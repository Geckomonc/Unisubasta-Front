import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { BidPage } from '@/features/bid/pages/BidPage'
import { MyAuctionsPage } from '@/features/auctions/pages/MyAuctionsPage'
import { NewProductPage } from '@/features/auctions/pages/NewProductPage'
import { EditAuctionPage } from '@/features/auctions/pages/EditAuctionPage'
import { ProductDetailPage } from '@/features/auctions/pages/ProductDetailPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { ChatsPage } from '@/features/chat/pages/ChatsPage'
import { ChatRoomPage } from '@/features/chat/pages/ChatRoomPage'
import { ROUTES } from './paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.bid} element={<BidPage />} />

          <Route path={ROUTES.myAuctions} element={<MyAuctionsPage />} />
          <Route path={ROUTES.newProduct} element={<NewProductPage />} />
          <Route path={ROUTES.editAuction()} element={<EditAuctionPage />} />

          <Route path={ROUTES.productDetail()} element={<ProductDetailPage />} />

          <Route path={ROUTES.chats} element={<ChatsPage />} />
          <Route path={ROUTES.chat()} element={<ChatRoomPage />} />

          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
