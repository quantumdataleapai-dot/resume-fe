import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ApiService from "../services/apiService";
import { useTheme } from "../utils/ThemeContext";
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
    description: "Connect to a MongoDB instance with flexible document queries",
    category: "database",
  },
  api: {
    icon: "fas fa-globe",
    color: "#7c3aed",
    label: "REST API",
    description: "Connect to any REST API endpoint",
    category: "database",
  },
  // monster: {
  //   icon: "fas fa-search-dollar",
  //   color: "#6d28d9",
  //   label: "Monster.com",
  //   description: "Monster job board integration",
  //   category: "jobboard",
  // },
  // dice: {
  //   icon: "fas fa-dice-d6",
  //   color: "#e11d48",
  //   label: "Dice.com",
  //   description: "Dice tech job board integration",
  //   category: "jobboard",
  // },
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
      return { name: "", connection_string: "", database: "", collection: "", query_filter: "", batch_size: "50", auto_sync: true, showAdvanced: false };
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
    let qf = {};
    if (form.query_filter) { try { qf = JSON.parse(form.query_filter); } catch { /* ignore */ } }
    return { source: "mongodb", connection_string: form.connection_string, database: form.database, collection: form.collection, query_filter: qf };
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
    let qf = {};
    if (form.query_filter) { try { qf = JSON.parse(form.query_filter); } catch { /* ignore */ } }
    return { name: form.name, source: "mongodb", connection_string: form.connection_string, database: form.database, collection: form.collection, query_filter: qf, auto_sync: !!form.auto_sync };
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
    const config = { connection_string: form.connection_string, database: form.database, collection: form.collection, batch_size: parseInt(form.batch_size) || 50 };
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
  const { isDark } = useTheme();
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

  // Success popup state
  const [successPopup, setSuccessPopup] = useState(null); // { title, message, icon }

  // My connectors state
  const [syncStatuses, setSyncStatuses] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingConnector, setEditingConnector] = useState(null); // connector id being edited
  const [editForm, setEditForm] = useState({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditApiKey, setShowEditApiKey] = useState(false);

  // Ceipal ATS state
  const [ceipalPhase, setCeipalPhase] = useState("form"); // "form" | "previewing" | "preview" | "saving" | "saved"
  const [ceipalForm, setCeipalForm] = useState({ name: "", email: "", password: "", api_key: "", max_records: "0" });
  const [ceipalPreview, setCeipalPreview] = useState(null);
  const [ceipalConnectorId, setCeipalConnectorId] = useState(null);
  const [ceipalSyncStatus, setCeipalSyncStatus] = useState(null);
  const [showCeipalPassword, setShowCeipalPassword] = useState(false);
  const [showCeipalApiKey, setShowCeipalApiKey] = useState(false);

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
    return () => { Object.values(pollRefs.current).forEach(clearInterval); };
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
    // Job boards use manual create flow, db/api sources show form immediately
    const isJobBoard = SOURCE_META[source].category === "jobboard";
    setSetupMode(isJobBoard ? "step" : "unified");
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
        const aiMap = res.ai_mapping || res.mapping;
        const mappedCount = aiMap?.field_mapping ? Object.keys(aiMap.field_mapping).length : (aiMap ? Object.keys(aiMap).length : 0);
        const schema = res.discovered_schema;
        let msg = `"${formData.name}" has been set up successfully.`;
        if (mappedCount) msg += ` ${mappedCount} fields auto-mapped by AI.`;
        if (schema?.total_rows) msg += ` ${schema.total_rows.toLocaleString()} documents found.`;
        if (res.sync_status) msg += ` ${res.sync_status}`;
        setSuccessPopup({
          title: "Connector Created!",
          message: msg,
          icon: "fas fa-bolt",
          color: "#6366f1",
        });
        resetForm();
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
        const fieldCount = res.schema?.fields?.length || 0;
        setSuccessPopup({
          title: "Schema Discovered!",
          message: `Found ${fieldCount} fields in your data source. Review the schema and proceed to auto-map.`,
          icon: "fas fa-table",
          color: "#10b981",
        });
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
        const sourceLabel = SOURCE_META[selectedSource]?.label || selectedSource;
        setSuccessPopup({
          title: "Connector Created!",
          message: `"${formData.name}" (${sourceLabel}) has been saved. Head to My Connectors to test and sync.`,
          icon: "fas fa-check-circle",
          color: "#10b981",
        });
        resetForm();
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

  // ─── CEIPAL ATS HANDLERS ───
  const handleCeipalChange = (field, value) => setCeipalForm((prev) => ({ ...prev, [field]: value }));

  const resetCeipal = () => {
    setCeipalPhase("form");
    setCeipalForm({ name: "", email: "", password: "", api_key: "", max_records: "0" });
    setCeipalPreview(null);
    setCeipalConnectorId(null);
    setCeipalSyncStatus(null);
    clearMessages();
  };

  const handleCeipalPreview = async () => {
    clearMessages();
    if (!ceipalForm.email || !ceipalForm.password || !ceipalForm.api_key) {
      setError("Email, password, and API key are required.");
      return;
    }
    setCeipalPhase("previewing");
    try {
      const res = await ApiService.ceipalPreview({
        email: ceipalForm.email,
        password: ceipalForm.password,
        api_key: ceipalForm.api_key,
        limit: 5,
        page: 1,
      });
      if (res.success) {
        setCeipalPreview(res);
        setCeipalPhase("preview");
        setSuccess(`Connected successfully! Found ${res.pagination?.total_count?.toLocaleString() || "N/A"} applicants.`);
      } else {
        setError(res.message || "Failed to connect to Ceipal.");
        setCeipalPhase("form");
      }
    } catch {
      setError("Unable to connect to Ceipal. Please check your credentials.");
      setCeipalPhase("form");
    }
  };

  const handleCeipalSave = async () => {
    clearMessages();
    const connName = ceipalForm.name?.trim();
    if (!connName) {
      setError("Connector name is required.");
      return;
    }
    setCeipalPhase("saving");
    try {
      const payload = {
        name: connName,
        source: "ceipal",
        config: {
          email: ceipalForm.email,
          password: ceipalForm.password,
          api_key: ceipalForm.api_key,
          max_records: parseInt(ceipalForm.max_records) || 0,
        },
      };
      const res = await ApiService.createConnector(payload);
      if (res.success) {
        setCeipalConnectorId(res.id);
        setCeipalPhase("saved");
        setSuccess(`Connector '${connName}' saved successfully!`);
      } else {
        setError(res.message || "Failed to save connector.");
        setCeipalPhase("preview");
      }
    } catch {
      setError("Unable to save connector.");
      setCeipalPhase("preview");
    }
  };

  const handleCeipalTestConnection = async () => {
    if (!ceipalConnectorId) return;
    setActionLoading("ceipal-test");
    clearMessages();
    try {
      const res = await ApiService.testConnector(ceipalConnectorId);
      if (res.success && res.reachable) setSuccess(`Connection successful: ${res.message}`);
      else setError(res.message || "Connection test failed.");
    } catch { setError("Unable to test connection."); }
    setActionLoading(null);
  };

  const handleCeipalSync = async () => {
    if (!ceipalConnectorId) return;
    setActionLoading("ceipal-sync");
    clearMessages();
    try {
      const res = await ApiService.syncConnector(ceipalConnectorId);
      if (res.success) {
        setSuccess(res.message || "Sync started.");
        setCeipalSyncStatus({ status: "syncing", total_synced: 0 });
        pollCeipalSyncStatus();
      } else { setError(res.message || "Sync failed."); }
    } catch { setError("Unable to start sync."); }
    setActionLoading(null);
  };

  const pollCeipalSyncStatus = () => {
    if (!ceipalConnectorId) return;
    const key = `ceipal-${ceipalConnectorId}`;
    if (pollRefs.current[key]) clearInterval(pollRefs.current[key]);
    pollRefs.current[key] = setInterval(async () => {
      try {
        const res = await ApiService.getSyncStatus(ceipalConnectorId);
        if (res.success) {
          setCeipalSyncStatus(res);
          if (res.status !== "syncing") {
            clearInterval(pollRefs.current[key]);
            delete pollRefs.current[key];
          }
        }
      } catch {
        clearInterval(pollRefs.current[key]);
        delete pollRefs.current[key];
      }
    }, 4000);
  };

  // ─── EDIT CONNECTOR HANDLERS ───
  const handleStartEdit = (connector) => {
    clearMessages();
    setDeleteConfirm(null);
    setEditingConnector(connector.id);
    // Pre-populate form. For ceipal connectors, we show credential fields.
    // Config is not returned from the API for security — user must re-enter credentials to update.
    setEditForm({
      name: connector.name || "",
      source_type: connector.source_type || "",
      email: "",
      password: "",
      api_key: "",
      max_records: "0",
    });
    setShowEditPassword(false);
    setShowEditApiKey(false);
  };

  const handleCancelEdit = () => {
    setEditingConnector(null);
    setEditForm({});
    clearMessages();
  };

  const handleEditChange = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveEdit = async (connectorId) => {
    clearMessages();
    const payload = {};
    const connector = connectors.find((c) => c.id === connectorId);

    // Always send name if changed
    if (editForm.name?.trim() && editForm.name !== connector?.name) {
      payload.name = editForm.name.trim();
    }

    // Build config if credentials were provided (for ceipal)
    if (editForm.source_type === "ceipal") {
      if (editForm.email || editForm.password || editForm.api_key) {
        // Must provide all config fields when updating config
        if (!editForm.email || !editForm.password || !editForm.api_key) {
          setError("When updating credentials, all fields (email, password, API key) are required.");
          return;
        }
        payload.config = {
          email: editForm.email,
          password: editForm.password,
          api_key: editForm.api_key,
          max_records: parseInt(editForm.max_records) || 0,
        };
      }
    }

    if (Object.keys(payload).length === 0) {
      setError("No changes to save.");
      return;
    }

    setActionLoading(`edit-${connectorId}`);
    try {
      const res = await ApiService.updateConnector(connectorId, payload);
      if (res.success) {
        setSuccess(res.message || "Connector updated successfully.");
        setEditingConnector(null);
        setEditForm({});
        fetchConnectors();
      } else {
        setError(res.message || "Failed to update connector.");
      }
    } catch {
      setError("Unable to update connector.");
    }
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
      <div className="dc-form-group">
        <label>Connection URI <span style={{ color: "#ef4444" }}>*</span></label>
        <div className="dc-input-icon-wrap">
          <i className="fas fa-link dc-input-icon"></i>
          <input
            placeholder="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net"
            value={formData.connection_string || ""}
            onChange={(e) => handleChange("connection_string", e.target.value)}
          />
        </div>
        <p className="dc-field-hint"><i className="fas fa-info-circle"></i> Include username and password in the URI. Special characters in passwords are auto-encoded.</p>
      </div>

      <div className="dc-form-group">
        <label>Database Name <span style={{ color: "#ef4444" }}>*</span></label>
        <input placeholder="recruitment_db" value={formData.database || ""} onChange={(e) => handleChange("database", e.target.value)} />
      </div>

      <div className="dc-form-group">
        <label>Collection Name <span style={{ color: "#ef4444" }}>*</span></label>
        <input placeholder="candidates" value={formData.collection || ""} onChange={(e) => handleChange("collection", e.target.value)} />
        <p className="dc-field-hint">The collection containing your candidate/resume documents</p>
      </div>

      <div className="dc-form-group">
        <label>Query Filter <span className="dc-optional">(optional)</span></label>
        <input placeholder='{"status": "active"}' value={formData.query_filter || ""} onChange={(e) => handleChange("query_filter", e.target.value)} />
        <p className="dc-field-hint">MongoDB query to filter documents (JSON format)</p>
      </div>

      {/* Auto-sync checkbox */}
      <label className="dc-checkbox-row">
        <input type="checkbox" checked={formData.auto_sync || false} onChange={(e) => handleChange("auto_sync", e.target.checked)} />
        <span><strong>Start sync immediately after setup</strong></span>
      </label>
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
            <button className={`dc-tab ${activeTab === "ceipal" ? "active" : ""}`} onClick={() => { setActiveTab("ceipal"); clearMessages(); }}>
              <i className="fas fa-users-cog"></i> Ceipal ATS
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

                    {/* Form fields phase */}
                    {setupMode && stepPhase === "form" && (
                      <>
                        <div className="dc-form-group">
                          <label>Connector Name</label>
                          <input placeholder="e.g., Client HR Database" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>

                        {renderSourceFields()}

                        {/* Action buttons */}
                        {setupMode === "unified" && hasDiscoverFeature && (
                          <div className="dc-unified-actions">
                            <button className="dc-unified-quick-btn" onClick={handleQuickSetup} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Setting up...</> : <><i className="fas fa-bolt"></i> One-Click Setup</>}
                            </button>
                            <button className="dc-unified-step-btn" onClick={() => { setSetupMode("step"); handleDiscover(); }} disabled={submitting}>
                              <i className="fas fa-eye"></i> Step-by-Step
                            </button>
                          </div>
                        )}

                        {setupMode === "step" && hasDiscoverFeature && (
                          <div className="dc-form-actions">
                            <button className="dc-btn-secondary" onClick={resetForm}>Cancel</button>
                            <button className="dc-btn-primary" onClick={handleDiscover} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Discovering...</> : <><i className="fas fa-search"></i> Discover Schema</>}
                            </button>
                          </div>
                        )}

                        {setupMode === "step" && isJobBoard && (
                          <div className="dc-form-actions">
                            <button className="dc-btn-secondary" onClick={resetForm}>Cancel</button>
                            <button className="dc-btn-primary" onClick={handleCreateConnector} disabled={submitting}>
                              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Connector</>}
                            </button>
                          </div>
                        )}
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
                      <React.Fragment key={i}>
                        <div className="dc-how-step">
                          <span className="dc-how-icon" style={{ background: `${step.color}15`, color: step.color }}><i className={step.icon}></i></span>
                          <strong>{step.title}</strong>
                          <p>{step.desc}</p>
                        </div>
                        {i < HOW_IT_WORKS.length - 1 && <span className="dc-how-arrow"><i className="fas fa-arrow-right"></i></span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ CEIPAL ATS TAB ═══ */}
          {activeTab === "ceipal" && (
            <div className="dc-ceipal-section">
              <div className="dc-card">
                <div className="dc-card-header">
                  <span className="dc-source-icon" style={{ color: "#e67e22", background: "#fdf2e9" }}>
                    <i className="fas fa-users-cog"></i>
                  </span>
                  <div>
                    <h2 className="dc-card-title">Ceipal ATS Integration</h2>
                    <p className="dc-card-desc">Connect your Ceipal ATS account to automatically import applicant data, resumes, and candidate profiles.</p>
                  </div>
                </div>

                {/* ── Phase: Form (enter credentials) ── */}
                {ceipalPhase === "form" && (
                  <>
                    <div className="dc-form-source-header" style={{ borderBottom: "none", marginBottom: 8 }}>
                      <span className="dc-source-icon-sm" style={{ color: "#e67e22" }}>
                        <i className="fas fa-users-cog"></i>
                      </span>
                      <div>
                        <strong style={{ color: "#e67e22" }}>Ceipal ATS</strong>
                        <p>Connect your Ceipal account to import applicants</p>
                      </div>
                    </div>

                    <div className="dc-form-group">
                      <label>Connector Name <span className="dc-optional">(optional)</span></label>
                      <input placeholder="e.g., My Ceipal ATS" value={ceipalForm.name} onChange={(e) => handleCeipalChange("name", e.target.value)} />
                    </div>

                    <fieldset className="dc-fieldset">
                      <legend><i className="fas fa-key"></i> CREDENTIALS</legend>
                      <div className="dc-form-group">
                        <label>Email</label>
                        <div className="dc-input-icon-wrap">
                          <i className="far fa-envelope dc-input-icon"></i>
                          <input placeholder="Ceipal account email" value={ceipalForm.email} onChange={(e) => handleCeipalChange("email", e.target.value)} />
                        </div>
                      </div>
                      <div className="dc-form-group">
                        <label>Password</label>
                        <div className="dc-input-icon-wrap">
                          <i className="fas fa-lock dc-input-icon"></i>
                          <input
                            type={showCeipalPassword ? "text" : "password"}
                            placeholder="Ceipal password"
                            value={ceipalForm.password}
                            onChange={(e) => handleCeipalChange("password", e.target.value)}
                          />
                          <button type="button" className="dc-input-toggle" onClick={() => setShowCeipalPassword(!showCeipalPassword)}>
                            <i className={showCeipalPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                          </button>
                        </div>
                      </div>
                      <div className="dc-form-group">
                        <label>API Key</label>
                        <div className="dc-input-icon-wrap">
                          <i className="fas fa-key dc-input-icon"></i>
                          <input
                            type={showCeipalApiKey ? "text" : "password"}
                            placeholder="Ceipal API key"
                            value={ceipalForm.api_key}
                            onChange={(e) => handleCeipalChange("api_key", e.target.value)}
                          />
                          <button type="button" className="dc-input-toggle" onClick={() => setShowCeipalApiKey(!showCeipalApiKey)}>
                            <i className={showCeipalApiKey ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                          </button>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="dc-fieldset">
                      <legend><i className="fas fa-cog"></i> OPTIONS</legend>
                      <div className="dc-form-group">
                        <label>Max Records <span className="dc-optional">(optional)</span></label>
                        <input
                          type="number"
                          placeholder="0"
                          value={ceipalForm.max_records}
                          onChange={(e) => handleCeipalChange("max_records", e.target.value)}
                          style={{ maxWidth: 200 }}
                        />
                        <p className="dc-field-hint">Maximum applicants to import per sync (0 = fetch all)</p>
                      </div>
                    </fieldset>

                    <button className="dc-ceipal-preview-btn" onClick={handleCeipalPreview}>
                      <i className="fas fa-eye"></i> Preview Ceipal Data
                    </button>
                  </>
                )}

                {/* ── Phase: Previewing (loading) ── */}
                {ceipalPhase === "previewing" && (
                  <div className="dc-ceipal-loading">
                    <div className="dc-ceipal-spinner">
                      <div className="dc-spinner-ring"></div>
                      <i className="fas fa-users-cog dc-spinner-icon"></i>
                    </div>
                    <h3>Connecting to Ceipal...</h3>
                    <p>Authenticating and fetching sample applicants</p>
                  </div>
                )}

                {/* ── Phase: Preview (show data) ── */}
                {ceipalPhase === "preview" && ceipalPreview && (
                  <>
                    <div className="dc-alert dc-alert-success">
                      <i className="fas fa-check-circle"></i>
                      <div>
                        <strong>Connected Successfully</strong>
                        <br />
                        Found <strong>{ceipalPreview.pagination?.total_count?.toLocaleString()}</strong> applicants
                        ({ceipalPreview.pagination?.num_pages?.toLocaleString()} pages).
                        Showing {ceipalPreview.preview_count} samples below.
                      </div>
                    </div>

                    {/* Sample applicants table */}
                    {ceipalPreview.sample_applicants?.length > 0 && (
                      <div className="dc-schema-table-wrap" style={{ marginBottom: 20 }}>
                        <table className="dc-schema-table">
                          <thead>
                            <tr>
                              {Object.keys(ceipalPreview.sample_applicants[0]).slice(0, 8).map((key) => (
                                <th key={key}>{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {ceipalPreview.sample_applicants.map((a, i) => (
                              <tr key={i}>
                                {Object.values(a).slice(0, 8).map((val, j) => (
                                  <td key={j} className="dc-sample-cell">{val != null ? String(val) : "-"}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* All available fields */}
                    {ceipalPreview.all_fields?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#cbd5e1" : "#374151", marginBottom: 10 }}>
                          All Available Fields ({ceipalPreview.all_fields.length})
                        </h4>
                        <div className="dc-ceipal-fields">
                          {ceipalPreview.all_fields.map((field) => (
                            <span key={field} className="dc-ceipal-field-tag"><code>{field}</code></span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connector name input */}
                    <div className="dc-form-group">
                      <label>Connector Name</label>
                      <input
                        placeholder="e.g., Ceipal - My Company"
                        value={ceipalForm.name}
                        onChange={(e) => handleCeipalChange("name", e.target.value)}
                      />
                    </div>

                    <div className="dc-form-actions">
                      <button className="dc-btn-secondary" onClick={resetCeipal}>
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                      <button className="dc-ceipal-save-btn" onClick={handleCeipalSave}>
                        <i className="fas fa-link"></i> Save & Connect
                      </button>
                    </div>
                  </>
                )}

                {/* ── Phase: Saving (loading) ── */}
                {ceipalPhase === "saving" && (
                  <div className="dc-ceipal-loading">
                    <div className="dc-ceipal-spinner">
                      <div className="dc-spinner-ring"></div>
                      <i className="fas fa-link dc-spinner-icon"></i>
                    </div>
                    <h3>Saving Connector...</h3>
                    <p>Registering your Ceipal connection</p>
                  </div>
                )}

                {/* ── Phase: Saved (success with actions) ── */}
                {ceipalPhase === "saved" && (
                  <div className="dc-ceipal-saved">
                    <div className="dc-ceipal-saved-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>Connector Saved!</h3>
                    <p>Your Ceipal connector is ready. Test the connection, then sync to import applicants.</p>

                    {/* Sync status display */}
                    {ceipalSyncStatus && (
                      <div className={`dc-ceipal-sync-status dc-ceipal-sync-${ceipalSyncStatus.status}`}>
                        {ceipalSyncStatus.status === "syncing" && (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Syncing... {ceipalSyncStatus.total_synced?.toLocaleString() || 0} records imported</span>
                          </>
                        )}
                        {ceipalSyncStatus.status === "idle" && ceipalSyncStatus.total_synced > 0 && (
                          <>
                            <i className="fas fa-check-circle"></i>
                            <span>Sync complete! {ceipalSyncStatus.total_synced?.toLocaleString()} records imported.</span>
                          </>
                        )}
                        {ceipalSyncStatus.status === "error" && (
                          <>
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Sync error: {ceipalSyncStatus.error || "Unknown error"}</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="dc-ceipal-saved-actions">
                      <button
                        className="dc-btn-secondary"
                        onClick={handleCeipalTestConnection}
                        disabled={actionLoading === "ceipal-test"}
                      >
                        {actionLoading === "ceipal-test" ? <><i className="fas fa-spinner fa-spin"></i> Testing...</> : <><i className="fas fa-check-circle"></i> Test Connection</>}
                      </button>
                      <button
                        className="dc-ceipal-sync-btn"
                        onClick={handleCeipalSync}
                        disabled={actionLoading === "ceipal-sync" || ceipalSyncStatus?.status === "syncing"}
                      >
                        {actionLoading === "ceipal-sync" || ceipalSyncStatus?.status === "syncing"
                          ? <><i className="fas fa-spinner fa-spin"></i> Syncing...</>
                          : <><i className="fas fa-sync-alt"></i> Start Sync</>}
                      </button>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <button className="dc-btn-secondary" onClick={resetCeipal} style={{ fontSize: 12 }}>
                        <i className="fas fa-plus"></i> Set up another connector
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* How Ceipal Integration Works */}
              <div className="dc-card dc-how-card">
                <h2 className="dc-card-title">How Ceipal Integration Works</h2>
                <div className="dc-how-grid">
                  {[
                    { icon: "fas fa-key", color: "#e67e22", title: "Authenticate", desc: "Enter your Ceipal email, password & API key" },
                    { icon: "fas fa-eye", color: "#e67e22", title: "Preview", desc: "Review sample applicant data before importing" },
                    { icon: "fas fa-check-circle", color: "#27ae60", title: "Connect", desc: "Save credentials & test the connection" },
                    { icon: "fas fa-sync-alt", color: "#e67e22", title: "Sync", desc: "Import applicants automatically into your database" },
                  ].map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="dc-how-step">
                        <span className="dc-how-icon" style={{ background: `${step.color}18`, color: step.color }}>
                          <i className={step.icon}></i>
                        </span>
                        <strong>{step.title}</strong>
                        <p>{step.desc}</p>
                      </div>
                      {i < arr.length - 1 && <span className="dc-how-arrow"><i className="fas fa-arrow-right"></i></span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
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
                        {!c.has_ai_mapping && c.source_type !== "ceipal" && (
                          <button className="dc-action-btn dc-action-remap" title="Re-Map Fields" onClick={() => handleRemap(c.id)} disabled={actionLoading === `remap-${c.id}`}>
                            {actionLoading === `remap-${c.id}` ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
                          </button>
                        )}
                        <button className="dc-action-btn dc-action-edit" title="Edit" onClick={() => handleStartEdit(c)} disabled={(syncStatuses[c.id] || c.status) === "syncing"}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="dc-action-btn dc-action-sync" title="Sync Now" onClick={() => handleSync(c.id)} disabled={actionLoading === `sync-${c.id}` || (syncStatuses[c.id] || c.status) === "syncing"}>
                          {actionLoading === `sync-${c.id}` || (syncStatuses[c.id] || c.status) === "syncing" ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                        </button>
                        <button className="dc-action-btn dc-action-delete" title="Delete" onClick={() => setDeleteConfirm(c.id)}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>

                      {/* Delete confirmation */}
                      {deleteConfirm === c.id && (
                        <div className="dc-delete-confirm">
                          <span>Delete <strong>{c.name}</strong>? Already-synced resumes will not be removed.</span>
                          <button className="dc-btn-danger-sm" onClick={() => handleDelete(c.id)} disabled={actionLoading === `del-${c.id}`}>
                            {actionLoading === `del-${c.id}` ? "Deleting..." : "Yes, Delete"}
                          </button>
                          <button className="dc-btn-secondary-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        </div>
                      )}

                      {/* Edit form (inline) */}
                      {editingConnector === c.id && (
                        <div className="dc-edit-form">
                          <div className="dc-edit-form-header">
                            <i className="fas fa-pen" style={{ color: "#6366f1" }}></i>
                            <strong>Edit Connector</strong>
                          </div>

                          <div className="dc-form-group">
                            <label>Connector Name</label>
                            <input
                              placeholder={c.name}
                              value={editForm.name}
                              onChange={(e) => handleEditChange("name", e.target.value)}
                            />
                          </div>

                          {c.source_type === "ceipal" && (
                            <fieldset className="dc-fieldset">
                              <legend><i className="fas fa-key"></i> UPDATE CREDENTIALS <span className="dc-optional">(leave blank to keep current)</span></legend>
                              <div className="dc-form-group">
                                <label>Email</label>
                                <div className="dc-input-icon-wrap">
                                  <i className="far fa-envelope dc-input-icon"></i>
                                  <input
                                    placeholder="Ceipal account email"
                                    value={editForm.email}
                                    onChange={(e) => handleEditChange("email", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="dc-form-group">
                                <label>Password</label>
                                <div className="dc-input-icon-wrap">
                                  <i className="fas fa-lock dc-input-icon"></i>
                                  <input
                                    type={showEditPassword ? "text" : "password"}
                                    placeholder="Ceipal password"
                                    value={editForm.password}
                                    onChange={(e) => handleEditChange("password", e.target.value)}
                                  />
                                  <button type="button" className="dc-input-toggle" onClick={() => setShowEditPassword(!showEditPassword)}>
                                    <i className={showEditPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                  </button>
                                </div>
                              </div>
                              <div className="dc-form-group">
                                <label>API Key</label>
                                <div className="dc-input-icon-wrap">
                                  <i className="fas fa-key dc-input-icon"></i>
                                  <input
                                    type={showEditApiKey ? "text" : "password"}
                                    placeholder="Ceipal API key"
                                    value={editForm.api_key}
                                    onChange={(e) => handleEditChange("api_key", e.target.value)}
                                  />
                                  <button type="button" className="dc-input-toggle" onClick={() => setShowEditApiKey(!showEditApiKey)}>
                                    <i className={showEditApiKey ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                  </button>
                                </div>
                              </div>
                              <div className="dc-form-group">
                                <label>Max Records <span className="dc-optional">(0 = all)</span></label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={editForm.max_records}
                                  onChange={(e) => handleEditChange("max_records", e.target.value)}
                                  style={{ maxWidth: 200 }}
                                />
                              </div>
                            </fieldset>
                          )}

                          <div className="dc-edit-form-actions">
                            <button className="dc-btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                            <button
                              className="dc-btn-secondary"
                              onClick={() => handleTestConnection(c.id)}
                              disabled={actionLoading === `test-${c.id}`}
                            >
                              {actionLoading === `test-${c.id}` ? <><i className="fas fa-spinner fa-spin"></i> Testing...</> : <><i className="fas fa-plug"></i> Test Connection</>}
                            </button>
                            <button
                              className="dc-btn-primary"
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={actionLoading === `edit-${c.id}`}
                            >
                              {actionLoading === `edit-${c.id}` ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                            </button>
                          </div>
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

      {/* ═══ SUCCESS POPUP OVERLAY ═══ */}
      {successPopup && (
        <div className="dc-popup-overlay" onClick={() => setSuccessPopup(null)}>
          <div className="dc-popup" onClick={(e) => e.stopPropagation()}>
            <div className="dc-popup-icon" style={{ background: `${successPopup.color}12`, color: successPopup.color }}>
              <i className={successPopup.icon}></i>
            </div>
            <h3 className="dc-popup-title">{successPopup.title}</h3>
            <p className="dc-popup-message">{successPopup.message}</p>
            <div className="dc-popup-actions">
              <button className="dc-popup-btn-secondary" onClick={() => { setSuccessPopup(null); setActiveTab("my"); fetchConnectors(); }}>
                <i className="fas fa-list"></i> View My Connectors
              </button>
              <button className="dc-popup-btn-primary" onClick={() => setSuccessPopup(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
