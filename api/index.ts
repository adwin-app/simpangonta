import type { VercelRequest, VercelResponse } from '@vercel/node';

import adminJudgeReportHandler from './handlers/adminJudgeReport';
import adminSchoolsHandler from './handlers/adminSchools';
import authLoginHandler from './handlers/authLogin';
import competitionsHandler from './handlers/competitions';
import dataResetHandler from './handlers/dataReset';
import leaderboardHandler from './handlers/leaderboard';
import schoolLoginHandler from './handlers/schoolLogin';
import schoolRegisterHandler from './handlers/schoolRegister';
import scoresHandler from './handlers/scores';
import statsHandler from './handlers/stats';
import teamsHandler from './handlers/teams';
import usersHandler from './handlers/users';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.split('?')[0];

    if (path === '/api/admin/judge-report') {
        return adminJudgeReportHandler(req, res);
    }
    if (path === '/api/admin/schools') {
        return adminSchoolsHandler(req, res);
    }
    if (path === '/api/auth/login') {
        return authLoginHandler(req, res);
    }
    if (path === '/api/competitions') {
        return competitionsHandler(req, res);
    }
    if (path === '/api/data/reset') {
        return dataResetHandler(req, res);
    }
    if (path === '/api/leaderboard') {
        return leaderboardHandler(req, res);
    }
    if (path === '/api/schools/login') {
        return schoolLoginHandler(req, res);
    }
    if (path === '/api/schools/register') {
        return schoolRegisterHandler(req, res);
    }
    if (path === '/api/scores') {
        return scoresHandler(req, res);
    }
    if (path === '/api/stats') {
        return statsHandler(req, res);
    }
    if (path === '/api/teams') {
        return teamsHandler(req, res);
    }
    if (path === '/api/users') {
        return usersHandler(req, res);
    }

    // Fallback for any routes not found
    return res.status(404).json({ error: 'Endpoint not found' });
}
