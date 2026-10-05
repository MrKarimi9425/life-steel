import { Navigate, Outlet, Route, Routes } from 'react-router'
import { PasswordSignInPage, useAuthStore } from '@/features/auth'
import { RequiredPasswordChangePage } from '@/features/account-settings'
import { DashboardPage } from '@/features/dashboard'
import { AdminsPage } from '@/features/admins'
import { InterfacePhrasesPage, LanguagesPage } from '@/features/languages'
import {
    AttributesPage,
    CategoriesPage,
    ProductsPage,
} from '@/features/catalog'
import { ArticlesPage, BlogCategoriesPage, BlogTagsPage } from '@/features/blog'
import {
    AboutPage,
    BannerSectionPage,
    BannersPage,
    ContactsPage,
    MessagesPage,
    HomeLayoutPage,
    HomePageSettingsPage,
} from '@/features/site-content'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardRouteFrame } from '@/components/layouts/DashboardLayout'

function OwnerRoute() {
    const isOwner = useAuthStore((state) => state.principal?.isOwner)
    return isOwner ? <Outlet /> : <Navigate replace to="/" />
}

export function AppRouter() {
    return (
        <Routes>
            <Route path="/sign-in" element={<PasswordSignInPage />} />
            <Route
                path="/sign-in/password"
                element={<Navigate replace to="/sign-in" />}
            />
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/change-password"
                    element={<RequiredPasswordChangePage />}
                />
                <Route element={<DashboardRouteFrame />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route
                        path="product-categories"
                        element={<CategoriesPage />}
                    />
                    <Route
                        path="product-attributes"
                        element={<AttributesPage />}
                    />
                    <Route path="blog/articles" element={<ArticlesPage />} />
                    <Route
                        path="blog/categories"
                        element={<BlogCategoriesPage />}
                    />
                    <Route path="blog/tags" element={<BlogTagsPage />} />
                    <Route path="site/about" element={<AboutPage />} />
                    <Route path="site/banners" element={<BannersPage />} />
                    <Route
                        path="site/banners/:sectionId"
                        element={<BannerSectionPage />}
                    />
                    <Route
                        path="site/home-layout"
                        element={<HomeLayoutPage />}
                    />
                    <Route
                        path="site/home-settings"
                        element={<HomePageSettingsPage />}
                    />
                    <Route path="site/contacts" element={<ContactsPage />} />
                    <Route path="site/messages" element={<MessagesPage />} />
                    <Route path="languages" element={<LanguagesPage />} />
                    <Route
                        path="interface-phrases"
                        element={<InterfacePhrasesPage />}
                    />
                    <Route element={<OwnerRoute />}>
                        <Route path="admins" element={<AdminsPage />} />
                    </Route>
                </Route>
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
    )
}
