require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const { securityMiddleware, apiLimiter } = require('./src/middleware/security');
const pagesRouter = require('./src/routes/pages');
const apiRouter = require('./src/routes/api');
const pkg = require('./package.json');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(compression());
app.use(securityMiddleware);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with cache headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true
}));

// Rate limiting for API endpoints
app.use('/api', apiLimiter);

// Routes
app.use('/', pagesRouter);
app.use('/api', apiRouter);

// Health check — lo consultan el HEALTHCHECK de Docker, Dokploy y el smoke test.
// Debe ir antes del handler 404 y no depender de servicios externos.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: pkg.version,
    uptime: Math.round(process.uptime())
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Página no encontrada - Mecánica G3',
    description: 'La página que buscas no existe.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 0, msg: 'Ocurrió un error en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`G3Web server running on http://localhost:${PORT}`);
});
