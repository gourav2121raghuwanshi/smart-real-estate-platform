import client from "prom-client";
import responseTime from "response-time";

/**
 * Register default Node.js metrics
 */
const register = client.register;

client.collectDefaultMetrics({ register });

/**
 * Custom metrics
 */
const reqResTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "Time taken by request and response",
  labelNames: ["method", "route", "status_code"],
  buckets: [10, 50, 100, 200, 400, 500, 800, 1000, 2000, 3000],
});

const totalReqCounter = new client.Counter({
  name: "total_requests",
  help: "Total number of requests received",
});

/**
 * Express middleware
 */
export const prometheusMiddleware = responseTime((req, res, time) => {
  totalReqCounter.inc();
  reqResTime
    .labels(req.method, req.route?.path || req.url, res.statusCode)
    .observe(time);
});

/**
 * Metrics endpoint handler
 */
export const metricsEndpoint = async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send("Error collecting metrics");
  }
};
