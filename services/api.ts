import { Competition, Team, Score, LeaderboardEntry, UserRole, DashboardStats, Criterion, User, School } from '../types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try {
            errorJson = JSON.parse(errorText);
        } catch(e) {
            // not a json error
        }
        const message = errorJson?.error || errorText || 'An unknown error occurred';
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${message}`);
    }
    return response.json();
};

// Competition API
const getCompetitions = async (): Promise<Competition[]> => {
    const response = await fetch('/api/competitions');
    return handleResponse(response);
};

const addCompetition = async (name: string, criteria: {name: string}[]): Promise<Competition> => {
    const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, criteria }),
    });
    return handleResponse(response);
};

const updateCompetition = async (id: string, updatedData: { name: string, criteria: Criterion[] }): Promise<Competition> => {
     const response = await fetch(`/api/competitions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
    });
    return handleResponse(response);
}

const deleteCompetition = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/competitions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    return handleResponse(response);
};

// Team API
const getTeams = async (schoolId?: string): Promise<Team[]> => {
    const url = schoolId ? `/api/teams?schoolId=${schoolId}` : '/api/teams';
    const response = await fetch(url);
    return handleResponse(response);
};

const addTeam = async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
    });
    return handleResponse(response);
};

// Score API
const getScores = async (competitionId: string, judgeId: string): Promise<Score[]> => {
    const response = await fetch(`/api/scores?competitionId=${competitionId}&judgeId=${judgeId}`);
    return handleResponse(response);
};

const addScore = async (scoreData: Omit<Score, 'id'>): Promise<Score> => {
    const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
    });
    return handleResponse(response);
};

// Misc API
const getLeaderboard = async (type: 'Putra' | 'Putri'): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`/api/leaderboard?type=${type}`);
    return handleResponse(response);
};

const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await fetch('/api/stats');
    return handleResponse(response);
};

const resetData = async (mode?: 'clean'): Promise<{ message: string }> => {
    const url = mode === 'clean' ? '/api/data/reset?mode=clean' : '/api/data/reset';
    const response = await fetch(url, { method: 'POST' });
    return handleResponse(response);
};

// Judge Auth & Management API
const judgeLogin = async (credentials: {username: string, password: string}): Promise<User> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

const getUsers = async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    return handleResponse(response);
};

const addUser = async (userData: any): Promise<User> => {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

const updateUser = async (id: string, updateData: any): Promise<User> => {
    const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
    });
    return handleResponse(response);
};

const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    return handleResponse(response);
};

// School Auth & Management API
const schoolRegister = async (data: any): Promise<School> => {
    const response = await fetch('/api/schools/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

const schoolLogin = async (credentials: any): Promise<School & { role: UserRole }> => {
    const response = await fetch('/api/schools/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

const getSchools = async (): Promise<School[]> => {
    const response = await fetch('/api/admin/schools');
    return handleResponse(response);
};


export const apiService = {
    getCompetitions,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    getTeams,
    addTeam,
    getScores,
    addScore,
    getLeaderboard,
    getDashboardStats,
    resetData,
    judgeLogin,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    schoolRegister,
    schoolLogin,
    getSchools,
};