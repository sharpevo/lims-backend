module.exports = {
    db: process.env.LIMS_DATABASE_ADDR || 'mongodb://localhost:27017/mean-backend',
    corsOrigin: ['http://lims.igenetech.cn', process.env.LIMS_CORS_ORIGIN || 'http://localhost:8000', 'http://59.108.63.4:8000'],
    frontendUrl: process.env.LIMS_FRONTEND_ADDR || 'http://localhost:8000',
    sessionSecret: process.env.LIMS_SESSION_SECRET || 'developmentSessionSecret',
    auditHost: "api.audit.lims.igenetech.cn",
    auditPath: "/audit",
}
