import React, { useState, createContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserRole } from './types';
import { AppRoutes } from './constants';

import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageCompetitionsPage } from './pages/admin/ManageCompetitionsPage';
import { RegisterTeamPage } from './pages/admin/RegisterTeamPage';
import { AdminRecapPage } from './pages/admin/AdminRecapPage';
import { TeamListPage } from './pages/admin/TeamListPage';
import { JudgePortalPage } from './pages/judge/JudgePortalPage';
import { PublicLeaderboardPage } from './pages/public/PublicLeaderboardPage';

interface AuthContextType {
    role: UserRole | null;
    identifier: string | null;
    login: (role: UserRole, identifier: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const auth = React.useContext(AuthContext);

    if (!auth?.role || !allowedRoles.includes(auth.role)) {
        return <Navigate to={AppRoutes.login} replace />;
    }

    return <Outlet />;
};

const App: React.FC = () => {
    const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('simpan-gonta-role') as UserRole | null);
    const [identifier, setIdentifier] = useState<string | null>(() => localStorage.getItem('simpan-gonta-identifier'));

    const login = useCallback((userRole: UserRole, userIdentifier: string) => {
        localStorage.setItem('simpan-gonta-role', userRole);
        localStorage.setItem('simpan-gonta-identifier', userIdentifier);
        setRole(userRole);
        setIdentifier(userIdentifier);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('simpan-gonta-role');
        localStorage.removeItem('simpan-gonta-identifier');
        setRole(null);
        setIdentifier(null);
    }, []);

    const authContextValue = useMemo(() => ({ role, identifier, login, logout }), [role, identifier, login, logout]);

    return (
        <AuthContext.Provider value={authContextValue}>
            <HashRouter>
                <Layout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path={AppRoutes.home} element={<HomePage />} />
                        <Route path={AppRoutes.login} element={<LoginPage />} />
                        <Route path={AppRoutes.publicLeaderboard} element={<PublicLeaderboardPage />} />

                        {/* Admin Routes */}
                        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                            <Route path={AppRoutes.adminDashboard} element={<AdminDashboard />} />
                            <Route path={AppRoutes.adminManageCompetitions} element={<ManageCompetitionsPage />} />
                            <Route path={AppRoutes.adminRegisterTeam} element={<RegisterTeamPage />} />
                            <Route path={AppRoutes.adminRecap} element={<AdminRecapPage />} />
                            <Route path={AppRoutes.adminTeamList} element={<TeamListPage />} />
                        </Route>

                        {/* Judge Routes */}
                        <Route element={<ProtectedRoute allowedRoles={[UserRole.JURI]} />}>
                            <Route path={AppRoutes.judgePortal} element={<JudgePortalPage />} />
                        </Route>
                        
                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to={AppRoutes.home} />} />
                    </Routes>
                </Layout>
            </HashRouter>
        </AuthContext.Provider>
    );
};

export default App;
