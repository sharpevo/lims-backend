module.exports = {
    db: process.env.LIMS_DATABASE_ADDR || 'mongodb://localhost:27011/mean-backend',
    corsOrigin: ['http://lims.igenetech.cn', process.env.LIMS_CORS_ORIGIN || 'http://localhost:8000'],
    frontendUrl: process.env.LIMS_FRONTEND_ADDR || 'http://192.168.1.99:8000',
    sessionSecret: process.env.LIMS_SESSION_SECRET || 'developmentSessionSecret',
    auditHost: "audit.lims.igenetech.cn",
    auditPath: "/audit",
}
