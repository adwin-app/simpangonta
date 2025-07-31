import React, { useState, createContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserRole } from './types';
import { AppRoutes } from './constants';

import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageCompetitionsPage } from './pages/admin/ManageCompetitionsPage';
import { ManageJudgesPage } from './pages/admin/ManageJudgesPage';
import { ManageSchoolsPage } from './pages/admin/ManageSchoolsPage';
import { RegisterTeamPage } from './pages/admin/RegisterTeamPage';
import { AdminRecapPage } from './pages/admin/AdminRecapPage';
import { TeamListPage } from './pages/admin/TeamListPage';
import { JudgePortalPage } from './pages/judge/JudgePortalPage';
import { PublicLeaderboardPage } from './pages/public/PublicLeaderboardPage';
import { SchoolRegisterPage } from './pages/school/SchoolRegisterPage';
import { SchoolLoginPage } from './pages/school/SchoolLoginPage';
import { SchoolDashboardPage } from './pages/school/SchoolDashboardPage';


interface AuthContextType {
    role: UserRole | null;
    identifier: string | null; // admin name, judge id, or school id
    schoolName: string | null;
    assignedCompetitionId: string | null;
    assignedTeamType: 'Putra' | 'Putri' | null;
    login: (role: UserRole, identifier: string, details?: { assignedCompetitionId?: string; schoolName?: string; assignedTeamType?: 'Putra' | 'Putri' | null; }) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const auth = React.useContext(AuthContext);

    if (!auth?.role || !allowedRoles.includes(auth.role)) {
        // Redirect to an appropriate login page based on role
        const loginRoute = allowedRoles.includes(UserRole.ADMIN) ? AppRoutes.adminLogin : AppRoutes.login;
        return <Navigate to={loginRoute} replace />;
    }

    return <Outlet />;
};

const App: React.FC = () => {
    const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('simpan-gonta-role') as UserRole | null);
    const [identifier, setIdentifier] = useState<string | null>(() => localStorage.getItem('simpan-gonta-identifier'));
    const [schoolName, setSchoolName] = useState<string | null>(() => localStorage.getItem('simpan-gonta-schoolName'));
    const [assignedCompetitionId, setAssignedCompetitionId] = useState<string | null>(() => localStorage.getItem('simpan-gonta-assignedCompetitionId'));
    const [assignedTeamType, setAssignedTeamType] = useState<'Putra' | 'Putri' | null>(() => localStorage.getItem('simpan-gonta-assignedTeamType') as 'Putra' | 'Putri' | null);

    const login = useCallback((userRole: UserRole, userIdentifier: string, details?: { assignedCompetitionId?: string; schoolName?: string; assignedTeamType?: 'Putra' | 'Putri' | null; }) => {
        localStorage.setItem('simpan-gonta-role', userRole);
        localStorage.setItem('simpan-gonta-identifier', userIdentifier);
        setRole(userRole);
        setIdentifier(userIdentifier);
        
        if (details?.assignedCompetitionId) {
            localStorage.setItem('simpan-gonta-assignedCompetitionId', details.assignedCompetitionId);
            setAssignedCompetitionId(details.assignedCompetitionId);
        } else {
            localStorage.removeItem('simpan-gonta-assignedCompetitionId');
            setAssignedCompetitionId(null);
        }
        if (details?.schoolName) {
            localStorage.setItem('simpan-gonta-schoolName', details.schoolName);
            setSchoolName(details.schoolName);
        }
        if (details?.assignedTeamType) {
            localStorage.setItem('simpan-gonta-assignedTeamType', details.assignedTeamType);
            setAssignedTeamType(details.assignedTeamType);
        } else {
            localStorage.removeItem('simpan-gonta-assignedTeamType');
            setAssignedTeamType(null);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('simpan-gonta-role');
        localStorage.removeItem('simpan-gonta-identifier');
        localStorage.removeItem('simpan-gonta-assignedCompetitionId');
        localStorage.removeItem('simpan-gonta-schoolName');
        localStorage.removeItem('simpan-gonta-assignedTeamType');
        setRole(null);
        setIdentifier(null);
        setAssignedCompetitionId(null);
        setSchoolName(null);
        setAssignedTeamType(null);
    }, []);

    const authContextValue = useMemo(() => ({ role, identifier, assignedCompetitionId, assignedTeamType, schoolName, login, logout }), [role, identifier, assignedCompetitionId, assignedTeamType, schoolName, login, logout]);

    return (
        <AuthContext.Provider value={authContextValue}>
            <HashRouter>
                <Layout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path={AppRoutes.home} element={<PublicLeaderboardPage />} />
                        <Route path={AppRoutes.login} element={<LoginPage />} />
                        <Route path={AppRoutes.adminLogin} element={<AdminLoginPage />} />
                        <Route path={AppRoutes.publicLeaderboard} element={<PublicLeaderboardPage />} />
                        <Route path={AppRoutes.schoolRegister} element={<SchoolRegisterPage />} />
                        <Route path={AppRoutes.schoolLogin} element={<SchoolLoginPage />} />

                        {/* Admin Routes */}
                        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                            <Route path={AppRoutes.adminDashboard} element={<AdminDashboard />} />
                            <Route path={AppRoutes.adminManageCompetitions} element={<ManageCompetitionsPage />} />
                            <Route path={AppRoutes.adminManageJudges} element={<ManageJudgesPage />} />
                            <Route path={AppRoutes.adminManageSchools} element={<ManageSchoolsPage />} />
                            <Route path={AppRoutes.adminRegisterTeam} element={<RegisterTeamPage />} />
                            <Route path={AppRoutes.adminRecap} element={<AdminRecapPage />} />
                            <Route path={AppRoutes.adminTeamList} element={<TeamListPage />} />
                        </Route>

                        {/* Judge Routes */}
                        <Route element={<ProtectedRoute allowedRoles={[UserRole.JURI]} />}>
                            <Route path={AppRoutes.judgePortal} element={<JudgePortalPage />} />
                        </Route>

                         {/* School Routes */}
                        <Route element={<ProtectedRoute allowedRoles={[UserRole.SEKOLAH]} />}>
                            <Route path={AppRoutes.schoolDashboard} element={<SchoolDashboardPage />} />
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