import { Competition, Team, Score, LeaderboardEntry, UserRole, DashboardStats, Criterion, User } from '../types';

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
     const response = await fetch(`/api/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
    });
    return handleResponse(response);
}

const deleteCompetition = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/competitions/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

const getTeams = async (): Promise<Team[]> => {
    const response = await fetch('/api/teams');
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

const getLeaderboard = async (type: 'Putra' | 'Putri'): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`/api/leaderboard?type=${type}`);
    return handleResponse(response);
};

const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await fetch('/api/stats');
    return handleResponse(response);
};

const resetData = async (): Promise<{ message: string }> => {
    const response = await fetch('/api/data/reset', { method: 'POST' });
    return handleResponse(response);
};

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
    const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    return handleResponse(response);
};

const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
    });
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
};