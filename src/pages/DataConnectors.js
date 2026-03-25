import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ApiService from "../services/apiService";
import "../styles/DataConnectors.css";

/* ── Source metadata for all 6 types ── */
const SOURCE_META = {
  sql: {
    icon: "fas fa-database",
    color: "#336791",
    label: "SQL Database",
    description: "PostgreSQL / MySQL database",
    category: "database",
  },
  mongodb: {
    icon: "fas fa-leaf",
    color: "#13aa52",
    label: "MongoDB",
    description: "MongoDB / DocumentDB",
    category: "database",
  },
  api: {
    icon: "fas fa-globe",
    color: "#7c3aed",
    label: "REST API",
    description: "Connect to any REST API endpoint",
    category: "database",
  },
  monster: {
    icon: "fas fa-search-dollar",
    color: "#6d28d9",
    label: "Monster.com",
    description: "Monster job board integration",
    category: "jobboard",
  },
  dice: {
    icon: "fas fa-dice-d6",
    color: "#e11d48",
    label: "Dice.com",
    description: "Dice tech job board integration",
    category: "jobboard",
  },
  ceipal: {
    icon: "fas fa-briefcase",
    color: "#0369a1",
    label: "Ceipal ATS",
    description: "Ceipal applicant tracking system",
    category: "jobboard",
  },
};

const HOW_IT_WORKS = [
  { icon: "fas fa-database", color: "#6366f1", title: "Connect", desc: "Provide your database or API credentials" },
  { icon: "fas fa-search", color: "#8b5cf6", title: "Discover", desc: "AI scans and discovers data schema" },
  { icon: "fas fa-project-diagram", color: "#10b981", title: "Map", desc: "Fields auto-mapped to resume schema" },
  { icon: "fas fa-sync-alt", color: "#f59e0b", title: "Sync", desc: "Data syncs on demand or automatically" },
];

/* ── Default form values per source ── */
function getDefaultForm(source) {
  switch (source) {
    case "sql":
      return { name: "", host: "localhost", port: "5432", database: "recruitment_db", table: "candidates", username: "", password: "", where_clause: "", batch_size: "100" };
    case "mongodb":
      return { name: "", host: "localhost", port: "27017", database: "recruiting", collection: "resumes", username: "", password: "", query_filter: "", batch_size: "50" };
    case "api":
      return { name: "", base_url: "", endpoint: "/candidates", auth_type: "bearer", auth_token: "", auth_username: "", auth_password: "", auth_header_name: "X-API-Key", pagination_type: "page", page_size: "50", batch_size: "100" };
    case "monster":
      return { name: "", api_key: "", secret_key: "", search_query: "", location: "", radius_miles: "50", max_records: "200" };
    case "dice":
      return { name: "", api_key: "", search_query: "", location: "", radius_miles: "0", max_records: "100" };
    case "ceipal":
      return { name: "", api_key: "", company_code: "", status_filter: "active", max_records: "500" };
    default:
      return { name: "" };
  }
}

/* ── Build discover payload (for sql/mongodb/api) ── */
function buildDiscoverPayload(source, form) {
  const connStr = buildConnectionString(source, form);
  if (source === "sql") {
    return { source: "sql", connection_string: connStr, table: form.table };
  }
  if (source === "mongodb") {
    return { source: "mongodb", connection_string: connStr, database: form.database, collection: form.collection, query_filter: form.query_filter ? JSON.parse(form.query_filter) : {} };
  }
  if (source === "api") {
    const payload = { source: "api", base_url: form.base_url, endpoint: form.endpoint };
    const auth = buildAuthObject(form);
    if (auth) payload.auth = auth;
    return payload;
  }
  return {};
}

/* ── Build quick-setup payload (sql/mongodb/api only) ── */
function buildQuickSetupPayload(source, form) {
  const connStr = buildConnectionString(source, form);
  if (source === "sql") {
    return { name: form.name, source: "sql", connection_string: connStr, table: form.table, batch_size: parseInt(form.batch_size) || 100, auto_sync: false };
  }
  if (source === "mongodb") {
    return { name: form.name, source: "mongodb", connection_string: connStr, database: form.database, collection: form.collection, batch_size: parseInt(form.batch_size) || 50, auto_sync: false };
  }
  if (source === "api") {
    const payload = { name: form.name, source: "api", base_url: form.base_url, endpoint: form.endpoint, batch_size: parseInt(form.batch_size) || 100, auto_sync: false };
    const auth = buildAuthObject(form);
    if (auth) payload.auth = auth;
    return payload;
  }
  return {};
}

/* ── Build manual create payload (all sources) ── */
function buildCreatePayload(source, form, mapping) {
  if (source === "sql") {
    const config = { connection_string: buildConnectionString(source, form), table: form.table, batch_size: parseInt(form.batch_size) || 100 };
    if (mapping) config.column_map = mapping;
    if (form.where_clause) config.where_clause = form.where_clause;
    return { name: form.name, source: "sql", config };
  }
  if (source === "mongodb") {
    const config = { connection_string: buildConnectionString(source, form), database: form.database, collection: form.collection, batch_size: parseInt(form.batch_size) || 50 };
    if (mapping) config.field_map = mapping;
    if (form.query_filter) { try { config.query_filter = JSON.parse(form.query_filter); } catch { /* ignore */ } }
    return { name: form.name, source: "mongodb", config };
  }
  if (source === "api") {
    const config = { base_url: form.base_url, endpoint: form.endpoint };
    const auth = buildAuthObject(form);
    if (auth) config.auth = auth;
    if (mapping) config.field_map = mapping;
    if (form.pagination_type !== "none") {
      config.pagination = { type: form.pagination_type, page_param: "page", size_param: "limit", page_size: parseInt(form.page_size) || 50 };
    }
    return { name: form.name, source: "api", config };
  }
  if (source === "monster") {
    return { name: form.name, source: "monster", config: { api_key: form.api_key, secret_key: form.secret_key, search_query: form.search_query, location: form.location, radius_miles: parseInt(form.radius_miles) || 50, max_records: parseInt(form.max_records) || 200 } };
  }
  if (source === "dice") {
    return { name: form.name, source: "dice", config: { api_key: form.api_key, search_query: form.search_query, location: form.location, radius_miles: parseInt(form.radius_miles) || 0, max_records: parseInt(form.max_records) || 100 } };
  }
  if (source === "ceipal") {
    return { name: form.name, source: "ceipal", config: { api_key: form.api_key, company_code: form.company_code, status_filter: form.status_filter, max_records: parseInt(form.max_records) || 500 } };
  }
  return {};
}

function buildConnectionString(source, form) {
  const userPart = form.username ? `${encodeURIComponent(form.username)}:${encodeURIComponent(form.password)}@` : "";
  if (source === "sql") return `postgresql://${userPart}${form.host}:${form.port}/${form.database}`;
  if (source === "mongodb") return `mongodb://${userPart}${form.host}:${form.port}`;
  return "";
}

function buildAuthObject(form) {
  if (form.auth_type === "bearer" && form.auth_token) return { type: "bearer", token: form.auth_token };
  if (form.auth_type === "api_key" && form.auth_token) return { type: "api_key", key: form.auth_token, header_name: form.auth_header_name || "X-API-Key" };
  if (form.auth_type === "basic" && form.auth_username) return { type: "basic", username: form.auth_username, password: form.auth_password };
  return null;
}

const TARGET_FIELDS = [
  "first_name", "last_name", "email", "mobile", "job_title", "experience",
  "skills", "city", "state", "country", "zip_code", "work_authorization",
  "file_bytes", "file_url", "file_path", "text_content", "filename",
  "applicant_id", "source_type",
];

export default function DataConnectors() {
  const [activeTab, setActiveTab] = useState("new");
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Quick setup result
  const [setupResult, setSetupResult] = useState(null);

  // Step-by-step state
  const [setupMode, setSetupMode] = useState(null); // "quick" | "step"
  const [stepPhase, setStepPhase] = useState(null); // "form" | "schema" | "mapping" | "done"
  const [discoveredSchema, setDiscoveredSchema] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});

  // My connectors state
  const [syncStatuses, setSyncStatuses] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const pollRefs = useRef({});

  const fetchConnectors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getConnectors();
      if (res.success) setConnectors(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "my") fetchConnectors();
  }, [activeTab, fetchConnectors]);

  // Cleanup poll intervals on unmount
  useEffect(() => {
    const refs = pollRefs.current;
    return () => { Object.values(refs).forEach(clearInterval); };
  }, []);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleSourceSelect = (source) => {
    clearMessages();
    setSetupResult(null);
    setDiscoveredSchema(null);
    setFieldMapping({});
    setStepPhase("form");
    setSelectedSource(source);
    setFormData(getDefaultForm(source));
    // Job boards always use manual create flow
    const isJobBoard = SOURCE_META[source].category === "jobboard";
    setSetupMode(isJobBoard ? "step" : null);
  };

  const resetForm = () => {
    setSelectedSource(null);
    setSetupResult(null);
    setSetupMode(null);
    setStepPhase(null);
    setDiscoveredSchema(null);
    setFieldMapping({});
    clearMessages();
  };

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const isJobBoard = selectedSource && SOURCE_META[selectedSource]?.category === "jobboard";
  const hasDiscoverFeature = selectedSource && !isJobBoard;

  // ─── QUICK SETUP ───
  const handleQuickSetup = async () => {
    clearMessages();
    if (!formData.name?.trim()) { setError("Connector name is required."); return; }
    setSubmitting(true);
    try {
      const payload = buildQuickSetupPayload(selectedSource, formData);
      const res = await ApiService.connectorQuickSetup(payload);
      if (res.success) {
        setSuccess(res.message || "Connector created successfully!");
        setSetupResult(res);
      } else {
        setError(res.message || "Setup failed.");
      }
    } catch {
      setError("Unable to connect to server.");
    }
    setSubmitting(false);
  };

  // ─── STEP-BY-STEP: DISCOVER ───
  const handleDiscover = async () => {
    clearMessages();
    setSubmitting(true);
    try {
      const payload = buildDiscoverPayload(selectedSource, formData);
      const res = await ApiService.discoverSchema(payload);
      if (res.success) {
        setDiscoveredSchema(res.schema);
        setStepPhase("schema");
        setSuccess("Schema discovered successfully!");
      } else {
        setError(res.message || "Schema discovery failed.");
      }
    } catch {
      setError("Unable to discover schema.");
    }
    setSubmitting(false);
  };

  // ─── STEP-BY-STEP: AUTO-MAP ───
  const handleAutoMap = async () => {
    clearMessages();
    setSubmitting(true);
    try {
      const res = await ApiService.autoMapFields({ schema: discoveredSchema, source: selectedSource });
      if (res.success && res.mapping) {
        setFieldMapping(res.mapping);
        setStepPhase("mapping");
        setSuccess("Fields auto-mapped by AI!");
      } else {
        setError(res.message || "Auto-map failed.");
      }
    } catch {
      setError("Unable to auto-map fields.");
    }
    setSubmitting(false);
  };

  // ─── STEP-BY-STEP / JOB BOARD: CREATE CONNECTOR ───
  const handleCreateConnector = async () => {
    clearMessages();
    if (!formData.name?.trim()) { setError("Connector name is required."); return; }
    setSubmitting(true);
    try {
      const mapping = Object.keys(fieldMapping).length > 0 ? fieldMapping : null;
      const payload = buildCreatePayload(selectedSource, formData, mapping);
      const res = await ApiService.createConnector(payload);
      if (res.success) {
        setSuccess(res.message || "Connector created!");
        setStepPhase("done");
        setSetupResult(res);
      } else {
        setError(res.message || "Failed to create connector.");
      }
    } catch {
      setError("Unable to create connector.");
    }
    setSubmitting(false);
  };

  const handleMappingChange = (sourceField, targetField) => {
    setFieldMapping((prev) => ({ ...prev, [sourceField]: targetField }));
  };

  // ─── MY CONNECTORS ACTIONS ───
  const handleTestConnection = async (id) => {
    setActionLoading(`test-${id}`);
    clearMessages();
    try {
      const res = await ApiService.testConnector(id);
      if (res.success && res.reachable) setSuccess(`Connection successful: ${res.message}`);
      else setError(res.message || "Connection test failed.");
    } catch { setError("Unable to test connection."); }
    setActionLoading(null);
  };

  const handleSync = async (id) => {
    setActionLoading(`sync-${id}`);
    clearMessages();
    try {
      const res = await ApiService.syncConnector(id);
      if (res.success) {
        setSuccess(res.message || "Sync started.");
        setSyncStatuses((prev) => ({ ...prev, [id]: "syncing" }));
        pollSyncStatus(id);
      } else { setError(res.message || "Sync failed."); }
    } catch { setError("Unable to start sync."); }
    setActionLoading(null);
  };

  const pollSyncStatus = (id) => {
    if (pollRefs.current[id]) clearInterval(pollRefs.current[id]);
    pollRefs.current[id] = setInterval(async () => {
      try {
        const res = await ApiService.getSyncStatus(id);
        if (res.success) {
          setSyncStatuses((prev) => ({ ...prev, [id]: res.status }));
          if (res.status !== "syncing") {
            clearInterval(pollRefs.current[id]);
            delete pollRefs.current[id];
            fetchConnectors();
          }
        }
      } catch {
        clearInterval(pollRefs.current[id]);
        delete pollRefs.current[id];
      }
    }, 4000);
  };

  const handleRemap = async (id) => {
    setActionLoading(`remap-${id}`);
    clearMessages();
    try {
      const res = await ApiService.remapConnector(id);
      if (res.success) setSuccess("Mapping updated successfully.");
      else setError(res.message || "Re-map failed.");
    } catch { setError("Unable to re-map."); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    setActionLoading(`del-${id}`);
    clearMessages();
    try {
      const res = await ApiService.deleteConnector(id);
      if (res.success) {
        setSuccess("Connector deleted.");
        setConnectors((prev) => prev.filter((c) => c.id !== id));
      } else { setError(res.message || "Delete failed."); }
    } catch { setError("Unable to delete connector."); }
    setDeleteConfirm(null);
    setActionLoading(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (connector) => {
    const st = syncStatuses[connector.id] || connector.status || "idle";
    const map = { idle: "dc-badge-idle", syncing: "dc-badge-syncing", error: "dc-badge-error" };
    return <span className={`dc-status-badge ${map[st] || "dc-badge-idle"}`}>{st}</span>;
  };

  // ─── FORM RENDERERS ───

  const renderSqlFields = () => (
    <>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-plug"></i> CONNECTION</legend>
        <div className="dc-form-group">
          <label>Host</label>
          <input placeholder="localhost or db.example.com" value={formData.host || ""} onChange={(e) => handleChange("host", e.target.value)} />
        </div>
        <div className="dc-form-row">
          <div className="dc-form-group">
            <label>Port</label>
            <input placeholder="5432" value={formData.port || ""} onChange={(e) => handleChange("port", e.target.value)} />
          </div>
          <div className="dc-form-group">
            <label>Database</label>
            <input placeholder="recruitment_db" value={formData.database || ""} onChange={(e) => handleChange("database", e.target.value)} />
          </div>
        </div>
        <div className="dc-form-group">
          <label>Table</label>
          <input placeholder="candidates" value={formData.table || ""} onChange={(e) => handleChange("table", e.target.value)} />
        </div>
        {setupMode === "step" && (
          <div className="dc-form-group">
            <label>Where Clause <span className="dc-optional">(optional)</span></label>
            <input placeholder="status = 'active'" value={formData.where_clause || ""} onChange={(e) => handleChange("where_clause", e.target.value)} />
          </div>
        )}
      </fieldset>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> AUTHENTICATION</legend>
        <div className="dc-form-group">
          <label>Username</label>
          <input placeholder="db_user" value={formData.username || ""} onChange={(e) => handleChange("username", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={formData.password || ""} onChange={(e) => handleChange("password", e.target.value)} />
        </div>
      </fieldset>
    </>
  );

  const renderMongoFields = () => (
    <>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-plug"></i> CONNECTION</legend>
        <div className="dc-form-group">
          <label>Host</label>
          <input placeholder="localhost or db.example.com" value={formData.host || ""} onChange={(e) => handleChange("host", e.target.value)} />
        </div>
        <div className="dc-form-row">
          <div className="dc-form-group">
            <label>Port</label>
            <input placeholder="27017" value={formData.port || ""} onChange={(e) => handleChange("port", e.target.value)} />
          </div>
          <div className="dc-form-group">
            <label>Database</label>
            <input placeholder="recruiting" value={formData.database || ""} onChange={(e) => handleChange("database", e.target.value)} />
          </div>
        </div>
        <div className="dc-form-group">
          <label>Collection</label>
          <input placeholder="resumes" value={formData.collection || ""} onChange={(e) => handleChange("collection", e.target.value)} />
        </div>
        {setupMode === "step" && (
          <div className="dc-form-group">
            <label>Query Filter <span className="dc-optional">(optional, JSON)</span></label>
            <input placeholder='{"status": "active"}' value={formData.query_filter || ""} onChange={(e) => handleChange("query_filter", e.target.value)} />
          </div>
        )}
      </fieldset>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> AUTHENTICATION</legend>
        <div className="dc-form-group">
          <label>Username</label>
          <input placeholder="db_user" value={formData.username || ""} onChange={(e) => handleChange("username", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={formData.password || ""} onChange={(e) => handleChange("password", e.target.value)} />
        </div>
      </fieldset>
    </>
  );

  const renderApiFields = () => (
    <>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-plug"></i> ENDPOINT</legend>
        <div className="dc-form-group">
          <label>Base URL</label>
          <input placeholder="https://api.example.com" value={formData.base_url || ""} onChange={(e) => handleChange("base_url", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Endpoint Path</label>
          <input placeholder="/candidates" value={formData.endpoint || ""} onChange={(e) => handleChange("endpoint", e.target.value)} />
        </div>
        {setupMode === "step" && (
          <div className="dc-form-row">
            <div className="dc-form-group">
              <label>Pagination Type</label>
              <select value={formData.pagination_type || "page"} onChange={(e) => handleChange("pagination_type", e.target.value)}>
                <option value="page">Page-based</option>
                <option value="offset">Offset-based</option>
                <option value="cursor">Cursor-based</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="dc-form-group">
              <label>Page Size</label>
              <input placeholder="50" value={formData.page_size || ""} onChange={(e) => handleChange("page_size", e.target.value)} />
            </div>
          </div>
        )}
      </fieldset>
      <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> AUTHENTICATION</legend>
        <div className="dc-form-group">
          <label>Auth Type</label>
          <select value={formData.auth_type || "bearer"} onChange={(e) => handleChange("auth_type", e.target.value)}>
            <option value="bearer">Bearer Token</option>
            <option value="api_key">API Key</option>
            <option value="basic">Basic Auth</option>
          </select>
        </div>
        {formData.auth_type === "basic" ? (
          <div className="dc-form-row">
            <div className="dc-form-group">
              <label>Username</label>
              <input placeholder="Username" value={formData.auth_username || ""} onChange={(e) => handleChange("auth_username", e.target.value)} />
            </div>
            <div className="dc-form-group">
              <label>Password</label>
              <input type="password" placeholder="Password" value={formData.auth_password || ""} onChange={(e) => handleChange("auth_password", e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="dc-form-group">
            <label>{formData.auth_type === "api_key" ? "API Key" : "Token"}</label>
            <input type="password" placeholder={formData.auth_type === "api_key" ? "Enter API key" : "Enter token"} value={formData.auth_token || ""} onChange={(e) => handleChange("auth_token", e.target.value)} />
          </div>
        )}
        {formData.auth_type === "api_key" && (
          <div className="dc-form-group">
            <label>Header Name</label>
            <input placeholder="X-API-Key" value={formData.auth_header_name || ""} onChange={(e) => handleChange("auth_header_name", e.target.value)} />
          </div>
        )}
      </fieldset>
    </>
  );

  const renderMonsterFields = () => (
    <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> MONSTER.COM CONFIGURATION</legend>
      <div className="dc-form-row">
        <div className="dc-form-group">
          <label>API Key</label>
          <input type="password" placeholder="Monster API key" value={formData.api_key || ""} onChange={(e) => handleChange("api_key", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Secret Key</label>
          <input type="password" placeholder="Monster secret key" value={formData.secret_key || ""} onChange={(e) => handleChange("secret_key", e.target.value)} />
        </div>
      </div>
      <div className="dc-form-group">
        <label>Search Query</label>
        <input placeholder="e.g., software engineer" value={formData.search_query || ""} onChange={(e) => handleChange("search_query", e.target.value)} />
      </div>
      <div className="dc-form-row">
        <div className="dc-form-group">
          <label>Location</label>
          <input placeholder="e.g., New York" value={formData.location || ""} onChange={(e) => handleChange("location", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Radius (miles)</label>
          <input placeholder="50" value={formData.radius_miles || ""} onChange={(e) => handleChange("radius_miles", e.target.value)} />
        </div>
      </div>
      <div className="dc-form-group">
        <label>Max Records</label>
        <input placeholder="200" value={formData.max_records || ""} onChange={(e) => handleChange("max_records", e.target.value)} />
      </div>
    </fieldset>
  );

  const renderDiceFields = () => (
    <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> DICE.COM CONFIGURATION</legend>
      <div className="dc-form-group">
        <label>API Key</label>
        <input type="password" placeholder="Dice API key" value={formData.api_key || ""} onChange={(e) => handleChange("api_key", e.target.value)} />
      </div>
      <div className="dc-form-group">
        <label>Search Query</label>
        <input placeholder="e.g., python developer" value={formData.search_query || ""} onChange={(e) => handleChange("search_query", e.target.value)} />
      </div>
      <div className="dc-form-row">
        <div className="dc-form-group">
          <label>Location</label>
          <input placeholder="e.g., Remote" value={formData.location || ""} onChange={(e) => handleChange("location", e.target.value)} />
        </div>
        <div className="dc-form-group">
          <label>Radius (miles)</label>
          <input placeholder="0" value={formData.radius_miles || ""} onChange={(e) => handleChange("radius_miles", e.target.value)} />
        </div>
      </div>
      <div className="dc-form-group">
        <label>Max Records</label>
        <input placeholder="100" value={formData.max_records || ""} onChange={(e) => handleChange("max_records", e.target.value)} />
      </div>
    </fieldset>
  );

  const renderCeipalFields = () => (
    <fieldset className="dc-fieldset"><legend><i className="fas fa-key"></i> CEIPAL CONFIGURATION</legend>
      <div className="dc-form-group">
        <label>API Key</label>
        <input type="password" placeholder="Ceipal API key" value={formData.api_key || ""} onChange={(e) => handleChange("api_key", e.target.value)} />
      </div>
      <div className="dc-form-group">
        <label>Company Code</label>
        <input placeholder="e.g., COMP123" value={formData.company_code || ""} onChange={(e) => handleChange("company_code", e.target.value)} />
      </div>
      <div className="dc-form-row">
        <div className="dc-form-group">
          <label>Status Filter</label>
          <select value={formData.status_filter || "active"} onChange={(e) => handleChange("status_filter", e.target.value)}>
            <option value="active">Active</option>
            <option value="all">All</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="dc-form-group">
          <label>Max Records</label>
          <input placeholder="500" value={formData.max_records || ""} onChange={(e) => handleChange("max_records", e.target.value)} />
        </div>
      </div>
    </fieldset>
  );

  const renderSourceFields = () => {
    switch (selectedSource) {
      case "sql": return renderSqlFields();
      case "mongodb": return renderMongoFields();
      case "api": return renderApiFields();
      case "monster": return renderMonsterFields();
      case "dice": return renderDiceFields();
      case "ceipal": return renderCeipalFields();
      default: return null;
    }
  };

  // ─── SCHEMA / MAPPING VIEWS ───

  const renderSchemaView = () => (
    <div className="dc-schema-card">
      <h3><i className="fas fa-table" style={{ color: "#6366f1" }}></i> Discovered Schema</h3>
      <p className="dc-schema-info">{discoveredSchema.fields?.length || 0} fields found</p>
      <div className="dc-schema-table-wrap">
        <table className="dc-schema-table">
          <thead>
            <tr><th>Field Name</th><th>Type</th><th>Sample</th></tr>
          </thead>
          <tbody>
            {(discoveredSchema.fields || []).map((f, i) => (
              <tr key={i}>
                <td><code>{f.name}</code></td>
                <td><span className="dc-type-badge">{f.type}</span></td>
                <td className="dc-sample-cell">{f.sample != null ? String(f.sample) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dc-form-actions">
        <button className="dc-btn-secondary" onClick={() => setStepPhase("form")}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button className="dc-btn-primary" onClick={handleAutoMap} disabled={submitting}>
          {submitting ? <><i className="fas fa-spinner fa-spin"></i> Mapping...</> : <><i className="fas fa-robot"></i> Auto-Map with AI</>}
        </button>
      </div>
    </div>
  );

  const renderMappingView = () => (
    <div className="dc-mapping-card">
      <h3><i className="fas fa-project-diagram" style={{ color: "#10b981" }}></i> Field Mapping</h3>
      <p className="dc-schema-info">Review and adjust the AI-suggested mapping. Change target fields using the dropdowns.</p>
      <div className="dc-schema-table-wrap">
        <table className="dc-schema-table">
          <thead>
            <tr><th>Source Field</th><th></th><th>Target Field</th></tr>
          </thead>
          <tbody>
            {Object.entries(fieldMapping).map(([src, tgt]) => (
              <tr key={src}>
                <td><code>{src}</code></td>
                <td style={{ textAlign: "center", color: "#9ca3af" }}><i className="fas fa-arrow-right"></i></td>
                <td>
                  <select className="dc-mapping-select" value={tgt} onChange={(e) => handleMappingChange(src, e.target.value)}>
                    <option value="">— skip —</option>
                    {TARGET_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dc-form-actions">
        <button className="dc-btn-secondary" onClick={() => setStepPhase("schema")}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button className="dc-btn-primary" onClick={handleCreateConnector} disabled={submitting}>
          {submitting ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Connector</>}
        </button>
      </div>
    </div>
  );

  // ─── RENDER ───
  return (
    <div className="ur-layout">
      <Sidebar />
      <div className="ur-main">
        <header className="ur-header">
          <div className="ur-header-left">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="dc-header-icon"><i className="fas fa-plug"></i></span>
              <div>
                <h1 className="ur-header-title">Data Connectors</h1>
                <p className="ur-header-subtitle">Connect external databases and APIs to import resumes with AI-powered field mapping</p>
              </div>
            </div>
          </div>
        </header>

        <main className="ur-content">
          {error && <div className="dc-alert dc-alert-error"><i className="fas fa-exclamation-circle"></i>{error}<button className="dc-alert-close" onClick={() => setError("")}>&times;</button></div>}
          {success && <div className="dc-alert dc-alert-success"><i className="fas fa-check-circle"></i>{success}<button className="dc-alert-close" onClick={() => setSuccess("")}>&times;</button></div>}

          {/* Tabs */}
          <div className="dc-tabs">
            <button className={`dc-tab ${activeTab === "new" ? "active" : ""}`} onClick={() => { setActiveTab("new"); clearMessages(); }}>
              <i className="fas fa-plus"></i> New Connector
            </button>
            <button className={`dc-tab ${activeTab === "my" ? "active" : ""}`} onClick={() => { setActiveTab("my"); clearMessages(); }}>
              <i className="fas fa-list"></i> My Connectors
            </button>
          </div>

          {/* ═══ NEW CONNECTOR TAB ═══ */}
          {activeTab === "new" && (
            <div className="dc-new-section">
              <div className="dc-card">
                <div className="dc-card-header">
                  <span className="dc-card-icon">&#9889;</span>
                  <div>
                    <h2 className="dc-card-title">Quick Setup</h2>
                    <p className="dc-card-desc">Connect a data source in one click. The AI agent will discover the schema, auto-map fields, and start syncing automatically.</p>
                  </div>
                </div>

                {/* ── Source selection grid ── */}
                {!selectedSource ? (
                  <>
                    <p className="dc-choose-label">Choose a data source type to get started:</p>

                    {/* Databases & APIs */}
                    <p className="dc-section-label">Databases & APIs</p>
                    <div className="dc-source-grid">
                      {Object.entries(SOURCE_META).filter(([, m]) => m.category === "database").map(([key, meta]) => (
                        <button key={key} className="dc-source-card" onClick={() => handleSourceSelect(key)}>
                          <span className="dc-source-icon" style={{ color: meta.color }}><i className={meta.icon}></i></span>
                          <div>
                            <strong>{meta.label}</strong>
                            <p>{meta.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Job Boards */}
                    <p className="dc-section-label" style={{ marginTop: 22 }}>Job Boards & ATS</p>
                    <div className="dc-source-grid">
                      {Object.entries(SOURCE_META).filter(([, m]) => m.category === "jobboard").map(([key, meta]) => (
                        <button key={key} className="dc-source-card" onClick={() => handleSourceSelect(key)}>
                          <span className="dc-source-icon" style={{ color: meta.color }}><i className={meta.icon}></i></span>
                          <div>
                            <strong>{meta.label}</strong>
                            <p>{meta.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  /* ── Source form ── */
                  <div className="dc-form-area">
                    {/* Source header */}
                    <div className="dc-form-source-header">
                      <button className="dc-back-btn" onClick={resetForm}>
                        <i className="fas fa-arrow-left"></i>
                      </button>
                      <span className="dc-source-icon-sm" style={{ color: SOURCE_META[selectedSource].color }}>
                        <i className={SOURCE_META[selectedSource].icon}></i>
                      </span>
                      <div>
                        <strong style={{ color: SOURCE_META[selectedSource].color }}>{SOURCE_META[selectedSource].label}</strong>
                        <p>{SOURCE_META[selectedSource].description}</p>
                      </div>
                    </div>

                    {/* Mode selector for db/api sources */}
                    {hasDiscoverFeature && !setupMode && (
                      <div className="dc-mode-selector">
                        <button className="dc-mode-btn" onClick={() => setSetupMode("quick")}>
                          <i className="fas fa-bolt"></i>
                          <div>
                            <strong>Quick Setup</strong>
                            <p>One click: discover + AI map + create</p>
                          </div>
                        </button>
                        <button className="dc-mode-btn" onClick={() => setSetupMode("step")}>
                          <i className="fas fa-list-ol"></i>
                          <div>
                            <strong>Step-by-Step</strong>
                            <p>Discover schema, review mapping, then create</p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Form fields phase */}
                    {setupMode && stepPhase === "form" && (
                      <>
                        <div className="dc-form-group">
                          <label>Connector Name</label>
                          <input placeholder="e.g., Client HR Database" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>

                        {renderSourceFields()}

                        {/* Setup result (after quick setup completes) */}
                        {setupResult && (
                          <div className="dc-result-card">
                            <h3><i className="fas fa-check-circle" style={{ color: "#10b981" }}></i> Setup Complete</h3>
                            {setupResult.test_result && (
                              <p className="dc-result-row"><strong>Connection:</strong> {setupResult.test_result.message}</p>
                            )}
                            {setupResult.mapping && (
                              <p className="dc-result-row"><strong>AI Mapping:</strong> {Object.keys(setupResult.mapping).length} fields mapped</p>
                            )}
                            {setupResult.message && (
                              <p className="dc-result-row"><strong>Status:</strong> {setupResult.message}</p>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="dc-form-actions">
                          <button className="dc-btn-secondary" onClick={resetForm}>Cancel</button>

                          {setupMode === "quick" && (
                            <button className="dc-btn-primary" onClick={handleQuickSetup} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Setting up...</> : <><i className="fas fa-bolt"></i> Quick Setup</>}
                            </button>
                          )}

                          {setupMode === "step" && hasDiscoverFeature && (
                            <button className="dc-btn-primary" onClick={handleDiscover} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Discovering...</> : <><i className="fas fa-search"></i> Discover Schema</>}
                            </button>
                          )}

                          {setupMode === "step" && isJobBoard && (
                            <button className="dc-btn-primary" onClick={handleCreateConnector} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Connector</>}
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Schema phase (step-by-step) */}
                    {stepPhase === "schema" && discoveredSchema && renderSchemaView()}

                    {/* Mapping phase (step-by-step) */}
                    {stepPhase === "mapping" && renderMappingView()}

                    {/* Done phase */}
                    {stepPhase === "done" && setupResult && (
                      <div className="dc-result-card">
                        <h3><i className="fas fa-check-circle" style={{ color: "#10b981" }}></i> Connector Created</h3>
                        <p className="dc-result-row">{setupResult.message}</p>
                        <div className="dc-form-actions">
                          <button className="dc-btn-secondary" onClick={resetForm}>Create Another</button>
                          <button className="dc-btn-primary" onClick={() => { setActiveTab("my"); resetForm(); }}>
                            <i className="fas fa-list"></i> View My Connectors
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* How It Works (only on source selection screen) */}
              {!selectedSource && (
                <div className="dc-card dc-how-card">
                  <h2 className="dc-card-title">How It Works</h2>
                  <div className="dc-how-grid">
                    {HOW_IT_WORKS.map((step, i) => (
                      <div key={i} className="dc-how-step">
                        <span className="dc-how-icon" style={{ background: `${step.color}15`, color: step.color }}><i className={step.icon}></i></span>
                        <strong>{step.title}</strong>
                        <p>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ MY CONNECTORS TAB ═══ */}
          {activeTab === "my" && (
            <div className="dc-my-section">
              {loading ? (
                <div className="dc-loading"><i className="fas fa-spinner fa-spin"></i> Loading connectors...</div>
              ) : connectors.length === 0 ? (
                <div className="dc-empty">
                  <i className="fas fa-plug"></i>
                  <h3>No connectors yet</h3>
                  <p>Create your first connector to start importing candidate data.</p>
                  <button className="dc-btn-primary" onClick={() => setActiveTab("new")}><i className="fas fa-plus"></i> New Connector</button>
                </div>
              ) : (
                <div className="dc-connectors-list">
                  {connectors.map((c) => (
                    <div key={c.id} className="dc-connector-row">
                      <div className="dc-connector-info">
                        <span className="dc-connector-icon" style={{ color: SOURCE_META[c.source_type]?.color || "#6366f1" }}>
                          <i className={SOURCE_META[c.source_type]?.icon || "fas fa-database"}></i>
                        </span>
                        <div>
                          <strong>{c.name}</strong>
                          <span className="dc-connector-type">{SOURCE_META[c.source_type]?.label || c.source_type}</span>
                        </div>
                      </div>
                      <div className="dc-connector-meta">
                        <div className="dc-meta-item">{getStatusBadge(c)}</div>
                        <div className="dc-meta-item">
                          <span className="dc-meta-label">Last Synced</span>
                          <span className="dc-meta-value">{formatDate(c.last_synced)}</span>
                        </div>
                        <div className="dc-meta-item">
                          <span className="dc-meta-label">Records</span>
                          <span className="dc-meta-value">{c.total_synced?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div className="dc-connector-actions">
                        <button className="dc-action-btn dc-action-test" title="Test Connection" onClick={() => handleTestConnection(c.id)} disabled={actionLoading === `test-${c.id}`}>
                          {actionLoading === `test-${c.id}` ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plug"></i>}
                        </button>
                        <button className="dc-action-btn dc-action-remap" title="Re-Map Fields" onClick={() => handleRemap(c.id)} disabled={actionLoading === `remap-${c.id}`}>
                          {actionLoading === `remap-${c.id}` ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
                        </button>
                        <button className="dc-action-btn dc-action-sync" title="Sync Now" onClick={() => handleSync(c.id)} disabled={actionLoading === `sync-${c.id}` || (syncStatuses[c.id] || c.status) === "syncing"}>
                          {actionLoading === `sync-${c.id}` || (syncStatuses[c.id] || c.status) === "syncing" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                        </button>
                        <button className="dc-action-btn dc-action-delete" title="Delete" onClick={() => setDeleteConfirm(c.id)}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>

                      {deleteConfirm === c.id && (
                        <div className="dc-delete-confirm">
                          <span>Delete <strong>{c.name}</strong>?</span>
                          <button className="dc-btn-danger-sm" onClick={() => handleDelete(c.id)} disabled={actionLoading === `del-${c.id}`}>
                            {actionLoading === `del-${c.id}` ? "Deleting..." : "Yes, Delete"}
                          </button>
                          <button className="dc-btn-secondary-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
