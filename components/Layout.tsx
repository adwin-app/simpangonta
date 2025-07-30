


import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { AppColors, AppRoutes, ScoutBadgeIcon, MenuIcon, CloseIcon, BuildingOfficeIcon } from '../constants';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate(AppRoutes.home);
    };
    
    const baseLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const inactiveLinkClasses = `text-white hover:bg-green-700 hover:text-white`;
    const activeLinkClasses = `bg-green-900 text-white`;

    const getLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? `${baseLinkClasses} ${activeLinkClasses}` : `${baseLinkClasses} ${inactiveLinkClasses}`;
    
    const adminLinks = (
        <>
            <NavLink to={AppRoutes.adminDashboard} className={getLinkClass}>Dashboard</NavLink>
            <NavLink to={AppRoutes.adminRegisterTeam} className={getLinkClass}>Pendaftaran</NavLink>
            <NavLink to={AppRoutes.adminTeamList} className={getLinkClass}>Daftar Regu</NavLink>
            <NavLink to={AppRoutes.adminManageCompetitions} className={getLinkClass}>Kelola Lomba</NavLink>
            <NavLink to={AppRoutes.adminManageJudges} className={getLinkClass}>Kelola Juri</NavLink>
            <NavLink to={AppRoutes.adminManageSchools} className={getLinkClass}>Kelola Sekolah</NavLink>
            <NavLink to={AppRoutes.adminRecap} className={getLinkClass}>Rekap Juara</NavLink>
        </>
    );

    const judgeLinks = (
        <NavLink to={AppRoutes.judgePortal} className={getLinkClass}>Input Nilai</NavLink>
    );
    
    const schoolLinks = (
         <NavLink to={AppRoutes.schoolDashboard} className={getLinkClass}>Dashboard Sekolah</NavLink>
    );
    
    const publicLinks = (
      <div className="flex items-center space-x-2">
        <NavLink to={AppRoutes.schoolLogin} className={getLinkClass}>Login/Daftar Sekolah</NavLink>
        <NavLink to={AppRoutes.login} className={getLinkClass}>Login Juri</NavLink>
        <NavLink to={AppRoutes.adminLogin} className={getLinkClass}>Login Panitia</NavLink>
      </div>
    );

    const navLinks = (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            {!auth?.role && publicLinks}
            {auth?.role === UserRole.ADMIN && adminLinks}
            {auth?.role === UserRole.JURI && judgeLinks}
            {auth?.role === UserRole.SEKOLAH && schoolLinks}
            {auth?.role && (
                <button onClick={handleLogout} className={`${baseLinkClasses} ${inactiveLinkClasses} flex items-center mt-2 md:mt-0`}>
                    Logout
                </button>
            )}
        </div>
    );

    return (
        <nav style={{ backgroundColor: AppColors.primary }} className="shadow-lg no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <NavLink to={AppRoutes.home} className="flex-shrink-0 flex items-center text-white">
                            <ScoutBadgeIcon className="h-10 w-10 mr-2" />
                            <span className="font-bold text-xl tracking-tight">SIMPAN GONTA</span>
                        </NavLink>
                    </div>
                    <div className="hidden md:block">
                        {navLinks}
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none">
                            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks}
                </div>
            )}
        </nav>
    );
};


export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen" style={{ backgroundColor: AppColors.background }}>
            <Header />
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};