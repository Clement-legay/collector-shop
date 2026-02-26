const fs = require('fs');

const createDashboard = (serviceName, title, businessPanels) => {
    const shortName = serviceName.replace('-service', '');
    const prefix = serviceName === 'fraud-detection-service' ? 'fraud-detection' : shortName;

    const panels = [
        {
            "title": `${title} - Service Uptime`,
            "type": "timeseries",
            "gridPos": { "x": 0, "y": 0, "w": 24, "h": 5 },
            "targets": [
                { "expr": `sum(up{job=\"kubernetes-service-endpoints\", namespace=\"collector\", service=\"${serviceName}\"})`, "legendFormat": "Endpoints UP" }
            ],
            "options": {
                "legend": { "calcs": [], "displayMode": "list", "placement": "bottom" }
            },
            "fieldConfig": {
                "defaults": { "unit": "none", "custom": { "fillOpacity": 15, "lineWidth": 2, "gradientMode": "opacity" } }
            }
        },
        {
            "title": "HTTP P95 Latency by Route (Seconds)",
            "type": "timeseries",
            "gridPos": { "x": 0, "y": 5, "w": 12, "h": 8 },
            "targets": [
                { "expr": `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service=\"${serviceName}\"}[5m])) by (le, method, path))`, "legendFormat": "{{method}} {{path}}" }
            ],
            "fieldConfig": {
                "defaults": { "unit": "s", "custom": { "fillOpacity": 10, "lineWidth": 2, "spanNulls": true } }
            }
        },
        {
            "title": "HTTP P99 Latency by Route (Seconds)",
            "type": "timeseries",
            "gridPos": { "x": 12, "y": 5, "w": 12, "h": 8 },
            "targets": [
                { "expr": `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service=\"${serviceName}\"}[5m])) by (le, method, path))`, "legendFormat": "{{method}} {{path}}" }
            ],
            "fieldConfig": {
                "defaults": { "unit": "s", "custom": { "fillOpacity": 10, "lineWidth": 2, "spanNulls": true } }
            }
        },
        {
            "title": "HTTP Error Rate (%)",
            "type": "timeseries",
            "gridPos": { "x": 0, "y": 13, "w": 24, "h": 6 },
            "targets": [
                { "expr": `sum(rate(http_request_duration_seconds_count{service=\"${serviceName}\", status=~\"5..|4..\"}[5m])) / sum(rate(http_request_duration_seconds_count{service=\"${serviceName}\"}[5m])) * 100`, "legendFormat": "Error Rate" }
            ],
            "fieldConfig": {
                "defaults": { "unit": "percent", "custom": { "fillOpacity": 20, "lineWidth": 2 } }
            }
        },
        ...businessPanels
    ];

    return {
        "title": title,
        "schemaVersion": 36,
        "refresh": "5s",
        "panels": panels
    };
};

const userBusiness = [
    {
        "title": "Total Users Registered",
        "type": "stat",
        "gridPos": { "x": 0, "y": 19, "w": 12, "h": 6 },
        "targets": [{ "expr": "sum(users_registered_total)" }]
    },
    {
        "title": "Registration Logs (Emails)",
        "type": "table",
        "gridPos": { "x": 12, "y": 19, "w": 12, "h": 6 },
        "targets": [{ "expr": "max_over_time(users_registered_total[24h]) > 0", "format": "table", "instant": true }]
    }
];

const articleBusiness = [
    {
        "title": "Total Articles Created",
        "type": "stat",
        "gridPos": { "x": 0, "y": 19, "w": 24, "h": 6 },
        "targets": [{ "expr": "sum(articles_created_total)" }]
    }
];

const paymentBusiness = [
    {
        "title": "Total Payments Completed",
        "type": "stat",
        "gridPos": { "x": 0, "y": 19, "w": 24, "h": 6 },
        "targets": [{ "expr": "sum(payments_completed_total)" }]
    }
];

const fraudBusiness = [
    {
        "title": "Fraud Alerts by Severity",
        "type": "timeseries",
        "gridPos": { "x": 0, "y": 19, "w": 12, "h": 8 },
        "targets": [{ "expr": "sum(rate(fraud_alerts_total[5m])) by (severity)", "legendFormat": "{{severity}}" }],
        "fieldConfig": { "defaults": { "custom": { "fillOpacity": 15, "lineWidth": 2 } } }
    },
    {
        "title": "RabbitMQ Events Processed Rate",
        "type": "timeseries",
        "gridPos": { "x": 12, "y": 19, "w": 12, "h": 8 },
        "targets": [{ "expr": "sum(rate(events_processed_total[1m])) by (event_type)", "legendFormat": "{{event_type}}" }],
        "fieldConfig": { "defaults": { "unit": "reqps", "custom": { "fillOpacity": 15, "lineWidth": 2 } } }
    }
];

const dashboards = {
    'user-dashboard.json': createDashboard('user-service', 'User Service Overview', userBusiness),
    'article-dashboard.json': createDashboard('article-service', 'Article Service Overview', articleBusiness),
    'payment-dashboard.json': createDashboard('payment-service', 'Payment Service Overview', paymentBusiness),
    'fraud-dashboard.json': createDashboard('fraud-detection-service', 'Fraud Detection Overview', fraudBusiness)
};

const grafanaPath = 'infrastructure/kubernetes/observability/grafana.yaml';
let config = fs.readFileSync(grafanaPath, 'utf8');

// Truncate the file up to the dashboards ConfigMap data
const truncateToken = "  name: grafana-dashboards\n  namespace: collector\ndata:\n";
const truncateIdx = config.indexOf(truncateToken);
if (truncateIdx === -1) throw new Error("Could not find grafana-dashboards ConfigMap location");

config = config.substring(0, truncateIdx + truncateToken.length);

// Append the 4 dashboards
for (const [filename, json] of Object.entries(dashboards)) {
    const jsonStr = JSON.stringify(json, null, 2);
    const indentedJson = jsonStr.split('\n').map(line => '    ' + line).join('\n');
    config += `  ${filename}: |\n${indentedJson}\n`;
}

fs.writeFileSync(grafanaPath, config);
console.log("Successfully generated all 4 dashboards and injected them into grafana.yaml");
