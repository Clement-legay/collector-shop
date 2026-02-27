import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom Metrics ────────────────────────────────────────────
const errorRate = new Rate('errors');
const catalogLatency = new Trend('catalog_latency', true);
const authLatency = new Trend('auth_latency', true);

const fraudLatency = new Trend('fraud_latency', true);
const successfulRequests = new Counter('successful_requests');

// ─── Configuration ─────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://collector.local/api';

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    // Scénario progressif : montée en charge → pic → descente
    stages: [
        { duration: '30s', target: 10 },  // Ramp-up : 0 → 10 utilisateurs en 30s
        { duration: '1m', target: 10 },  // Sustain : 10 utilisateurs pendant 1 min
        { duration: '30s', target: 25 },  // Ramp-up : 10 → 25 utilisateurs en 30s
        { duration: '1m', target: 25 },  // Sustain : 25 utilisateurs pendant 1 min
        { duration: '30s', target: 50 },  // Ramp-up : 25 → 50 utilisateurs en 30s
        { duration: '1m', target: 50 },  // Peak : 50 utilisateurs pendant 1 min
        { duration: '30s', target: 0 },   // Ramp-down : 50 → 0 en 30s
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],    // 95% des requêtes < 2s
        http_req_failed: ['rate<0.05'],       // Moins de 5% d'erreurs
        errors: ['rate<0.1'],                 // Moins de 10% d'erreurs custom
        catalog_latency: ['p(95)<1500'],      // Catalogue < 1.5s au p95
        auth_latency: ['p(95)<1000'],         // Auth < 1s au p95
    },
};

// ─── Données de test ───────────────────────────────────────────
const TEST_USERS = [
    { email: 'joe@collect.com', password: 'Collect0r!2026' },
    { email: 'tony@stark.com', password: 'Collect0r!2026' },
];

// ─── Scénario principal ────────────────────────────────────────
export default function () {
    // 1. Page d'accueil / Frontend
    group('Frontend', () => {
        const res = http.get(`${BASE_URL.replace('/api', '/')}`);
        check(res, {
            'Frontend returns 200': (r) => r.status === 200,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.5);

    // 2. Catalogue (GET /articles)
    group('Catalogue - Liste', () => {
        const res = http.get(`${BASE_URL}/articles`);
        catalogLatency.add(res.timings.duration);
        check(res, {
            'Catalogue returns 200': (r) => r.status === 200,
            'Catalogue has articles': (r) => JSON.parse(r.body).length > 0,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.3);

    // 3. Catalogue avec recherche
    group('Catalogue - Recherche', () => {
        const res = http.get(`${BASE_URL}/articles?search=pokemon`);
        catalogLatency.add(res.timings.duration);
        check(res, {
            'Search returns 200': (r) => r.status === 200,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.3);

    // 4. Catalogue avec filtre prix
    group('Catalogue - Filtre prix', () => {
        const res = http.get(`${BASE_URL}/articles?minPrice=10&maxPrice=500`);
        catalogLatency.add(res.timings.duration);
        check(res, {
            'Price filter returns 200': (r) => r.status === 200,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.3);

    // 5. Détail d'un article
    group('Article - Détail', () => {
        const listRes = http.get(`${BASE_URL}/articles`);
        if (listRes.status === 200) {
            const articles = JSON.parse(listRes.body);
            if (articles.length > 0) {
                const randomArticle = articles[Math.floor(Math.random() * articles.length)];
                const res = http.get(`${BASE_URL}/articles/${randomArticle.id}`);
                catalogLatency.add(res.timings.duration);
                check(res, {
                    'Article detail returns 200': (r) => r.status === 200,
                }) || errorRate.add(1);
                successfulRequests.add(res.status === 200 ? 1 : 0);
            }
        }
    });

    sleep(0.5);

    // 6. Authentification
    group('Auth - Login', () => {
        const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
        const payload = JSON.stringify(user);
        const params = { headers: { 'Content-Type': 'application/json' } };

        const res = http.post(`${BASE_URL}/users/login`, payload, params);
        authLatency.add(res.timings.duration);
        check(res, {
            'Login returns 200': (r) => r.status === 200 || r.status === 201,
            'Login returns token': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.token || body.access_token;
                } catch {
                    return false;
                }
            },
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 || res.status === 201 ? 1 : 0);
    });

    sleep(0.5);

    // 7. Fraud Alerts
    group('Fraud - Alerts', () => {
        const res = http.get(`${BASE_URL}/fraud/alerts`);
        fraudLatency.add(res.timings.duration);
        check(res, {
            'Fraud alerts returns 200': (r) => r.status === 200,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.3);

    // 8. Fraud Stats
    group('Fraud - Stats', () => {
        const res = http.get(`${BASE_URL}/fraud/stats`);
        fraudLatency.add(res.timings.duration);
        check(res, {
            'Fraud stats returns 200': (r) => r.status === 200,
        }) || errorRate.add(1);
        successfulRequests.add(res.status === 200 ? 1 : 0);
    });

    sleep(0.5);
}

// ─── Résumé ────────────────────────────────────────────────────
export function handleSummary(data) {
    const metrics = data.metrics;

    // Helper function to safely get a value and format it
    const safeGet = (metric, property, decimals = 2) => {
        if (metric && metric.values && metric.values[property] !== undefined) {
            return Number(metric.values[property]).toFixed(decimals);
        }
        return (0).toFixed(decimals);
    };

    const durationInSeconds = (data.state.testRunDurationMs || 0) / 1000;
    const totalRequests = metrics.http_reqs ? metrics.http_reqs.values.count : 0;

    const summary = {
        timestamp: new Date().toISOString(),
        totalRequests: totalRequests,
        failedRequests: metrics.http_req_failed ? metrics.http_req_failed.values.passes : 0,
        requestsPerSecond: durationInSeconds > 0 ? (totalRequests / durationInSeconds).toFixed(2) : "0.00",
        avgDuration: safeGet(metrics.http_req_duration, 'avg'),
        p95Duration: safeGet(metrics.http_req_duration, 'p(95)'),
        p99Duration: safeGet(metrics.http_req_duration, 'p(99)'),
        maxDuration: safeGet(metrics.http_req_duration, 'max'),
        errorRate: metrics.errors ? (metrics.errors.values.rate * 100).toFixed(2) + '%' : '0.00%',
        droppedIterations: metrics.dropped_iterations ? metrics.dropped_iterations.values.count : 0,
        successfulRequests: metrics.successful_requests ? metrics.successful_requests.values.count : 0,
    };

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  📊 RÉSUMÉ DU TEST DE CHARGE - Collector.shop');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Timestamp:               ${summary.timestamp}`);
    console.log(`  Requêtes / Seconde (RPS): ${summary.requestsPerSecond} req/s`);
    console.log(`  Total Requêtes:          ${summary.totalRequests}`);
    console.log(`  Succès:                  ${summary.successfulRequests}`);
    console.log(`  Échecs:                  ${summary.failedRequests}`);
    console.log(`  Itérations Perdues:      ${summary.droppedIterations}`);
    console.log(`  Taux d'erreur:           ${summary.errorRate}`);
    console.log('  ─────────────────────────────────────────────────');
    console.log(`  Latence moyenne:         ${summary.avgDuration} ms`);
    console.log(`  Latence P95:             ${summary.p95Duration} ms`);
    console.log(`  Latence P99:             ${summary.p99Duration} ms`);
    console.log(`  Latence Max:             ${summary.maxDuration} ms`);
    console.log('═══════════════════════════════════════════════════\n');
}
