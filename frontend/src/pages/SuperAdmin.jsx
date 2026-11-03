// import { useEffect, useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import { supabase } from "../lib/supabase";
// import { LogOut, Plus, Building2, UserPlus, RefreshCw } from "lucide-react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// export default function SuperAdmin() {
//  const {user,logout}=useAuth();
//  const [rows,setRows]=useState([]);
//  const [error,setError]=useState("");
//  const [busy,setBusy]=useState(false);
//  const [org,setOrg]=useState({name:"",organizationCode:"",type:"Business",location:""});
//  const [admin,setAdmin]=useState({organizationId:"",email:"",password:"",role:"admin"});
//  const call=async(path,options={})=>{
//    const {data:{session}}=await supabase.auth.getSession();
//    if(!session?.access_token) throw new Error("Session expired. Please login again.");
//    const res=await fetch(`${API}${path}`,{...options,headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`,...options.headers}});
//    const body=await res.json(); if(!res.ok) throw new Error(body.error||"Request failed."); return body;
//  };
//  const load=async()=>{setError("");try{const r=await call("/super-admin/organizations");setRows(r.data||[]);}catch(e){setError(e.message);}};
//  useEffect(()=>{load();},[]);
//  const createOrg=async(e)=>{e.preventDefault();setBusy(true);setError("");try{await call("/super-admin/organizations",{method:"POST",body:JSON.stringify(org)});setOrg({name:"",organizationCode:"",type:"Business",location:""});await load();}catch(e){setError(e.message);}finally{setBusy(false);}};
//  const update=async(id,updates)=>{setBusy(true);try{await call(`/super-admin/organizations/${id}`,{method:"PATCH",body:JSON.stringify(updates)});await load();}catch(e){setError(e.message);}finally{setBusy(false);}};
//  const createAdmin=async(e)=>{e.preventDefault();setBusy(true);try{await call(`/super-admin/organizations/${admin.organizationId}/admins`,{method:"POST",body:JSON.stringify(admin)});setAdmin({...admin,email:"",password:""});setError("Organization admin account created.");}catch(e){setError(e.message);}finally{setBusy(false);}};
//  return <div className="min-h-screen bg-slate-50 p-4 md:p-8">
//   <header className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="text-sm font-semibold text-emerald-700">CONTROL PLANE</p><h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1><p className="text-sm text-slate-500">{user?.email}</p></div><button onClick={()=>{logout();supabase.auth.signOut();}} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm"><LogOut size={16}/>Logout</button></header>
//   {error&&<div className="mx-auto mt-5 max-w-6xl rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
//   <main className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-2">
//    <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><Plus size={18}/>Create Organization</h2><form onSubmit={createOrg} className="mt-4 space-y-3">
//     <input required value={org.name} onChange={e=>setOrg({...org,name:e.target.value})} placeholder="Organization name" className="w-full rounded-lg border p-3 text-sm"/>
//     <input required value={org.organizationCode} onChange={e=>setOrg({...org,organizationCode:e.target.value})} placeholder="Manual unique organization code" className="w-full rounded-lg border p-3 text-sm"/>
//     <select value={org.type} onChange={e=>setOrg({...org,type:e.target.value})} className="w-full rounded-lg border p-3 text-sm">{["Business","Hospital","School","Hotel"].map(v=><option key={v}>{v}</option>)}</select>
//     <input value={org.location} onChange={e=>setOrg({...org,location:e.target.value})} placeholder="Location (optional)" className="w-full rounded-lg border p-3 text-sm"/>
//     <button disabled={busy} className="w-full rounded-lg bg-emerald-700 p-3 text-sm font-semibold text-white disabled:opacity-60">Create Organization</button>
//    </form></section>
//    <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><UserPlus size={18}/>Create Organization Admin</h2><form onSubmit={createAdmin} className="mt-4 space-y-3">
//     <select required value={admin.organizationId} onChange={e=>setAdmin({...admin,organizationId:e.target.value})} className="w-full rounded-lg border p-3 text-sm"><option value="">Choose organization</option>{rows.filter(r=>r.status==="active").map(r=><option key={r.id} value={r.id}>{r.name} ({r.organization_code})</option>)}</select>
//     <input required type="email" value={admin.email} onChange={e=>setAdmin({...admin,email:e.target.value})} placeholder="Admin email" className="w-full rounded-lg border p-3 text-sm"/>
//     <input required minLength={10} type="password" value={admin.password} onChange={e=>setAdmin({...admin,password:e.target.value})} placeholder="Temporary password (min 10 chars)" className="w-full rounded-lg border p-3 text-sm"/>
//     <select value={admin.role} onChange={e=>setAdmin({...admin,role:e.target.value})} className="w-full rounded-lg border p-3 text-sm">{["admin","owner","staff","viewer"].map(v=><option key={v}>{v}</option>)}</select>
//     <button disabled={busy||!admin.organizationId} className="w-full rounded-lg bg-emerald-700 p-3 text-sm font-semibold text-white disabled:opacity-60">Create Admin Account</button>
//    </form></section>
//    <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Building2 size={18}/>Organizations ({rows.length})</h2><button onClick={load} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14}/>Refresh</button></div>
//     <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr>{["Organization","Code","Type","Status","Action"].map(t=><th key={t} className="p-3">{t}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t"><td className="p-3 font-medium">{r.name}<div className="text-xs text-slate-500">{r.location}</div></td><td className="p-3 font-mono">{r.organization_code}</td><td className="p-3">{r.type}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${r.status==="active"?"bg-emerald-100 text-emerald-800":"bg-rose-100 text-rose-800"}`}>{r.status}</span></td><td className="p-3"><button disabled={busy} onClick={()=>update(r.id,{status:r.status==="active"?"inactive":"active"})} className="rounded-lg border px-3 py-1.5 text-xs">{r.status==="active"?"Deactivate":"Activate"}</button></td></tr>)}</tbody></table></div>
//    </section>
//   </main>
//  </div>;
// }



import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  LogOut,
  Plus,
  Building2,
  UserPlus,
  RefreshCw,
  Users,
  GitBranch,
  BriefcaseBusiness,
  Contact,
  FileText,
  Send,
  MessageSquare,
  Eye,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DATA_TABS = [
  { key: "members", label: "Admins & Members", icon: Users },
  { key: "branches", label: "Branches", icon: GitBranch },
  { key: "departments", label: "Departments", icon: BriefcaseBusiness },
  { key: "contacts", label: "Contacts", icon: Contact },
  { key: "templates", label: "Templates", icon: FileText },
  { key: "campaigns", label: "Campaigns", icon: Send },
  { key: "messages", label: "Messages", icon: MessageSquare },
];

function safeValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function safeColumnValue(key, value) {
  const sensitive = /password|secret|token|api.?key/i.test(key);

  if (sensitive && value) return "••••••••";
  return safeValue(value);
}

export default function SuperAdmin() {
  const { user, logout } = useAuth();

  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [dataColumns, setDataColumns] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [org, setOrg] = useState({
    name: "",
    organizationCode: "",
    type: "Business",
    location: "",
  });

  const [admin, setAdmin] = useState({
    organizationId: "",
    email: "",
    password: "",
    role: "admin",
  });

  const call = async (path, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Session expired. Please login again.");
    }

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(body.error || "Request failed.");
    }

    return body;
  };

  const loadOrganizations = async () => {
    try {
      const result = await call("/super-admin/organizations");
      setRows(result.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const loadMembers = async () => {
    setDataLoading(true);
    setError("");

    try {
      const result = await call("/super-admin/members");

      let list = result.data || [];

      if (selectedOrg) {
        list = list.filter(
          (item) => item.organization_id === selectedOrg
        );
      }

      setMembers(list);
      setDataRows(list);
      setDataColumns([
        "email",
        "full_name",
        "role",
        "organization_name",
        "organization_code",
        "organization_status",
        "created_at",
      ]);
    } catch (e) {
      setError(e.message);
      setDataRows([]);
    } finally {
      setDataLoading(false);
    }
  };

  const loadTableData = async (table) => {
    setDataLoading(true);
    setError("");

    try {
      const query = selectedOrg
        ? `?organizationId=${encodeURIComponent(selectedOrg)}`
        : "";

      const result = await call(
        `/super-admin/data/${table}${query}`
      );

      const list = result.data || [];

      setDataRows(list);

      const columns = list.length
        ? Object.keys(list[0])
        : ["No data available"];

      setDataColumns(columns);
    } catch (e) {
      setError(e.message);
      setDataRows([]);
      setDataColumns([]);
    } finally {
      setDataLoading(false);
    }
  };

  const loadCurrentTab = async () => {
    if (activeTab === "members") {
      await loadMembers();
    } else {
      await loadTableData(activeTab);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    loadCurrentTab();
  }, [activeTab, selectedOrg]);

  const createOrg = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await call("/super-admin/organizations", {
        method: "POST",
        body: JSON.stringify(org),
      });

      setOrg({
        name: "",
        organizationCode: "",
        type: "Business",
        location: "",
      });

      setSuccess("Organization created successfully.");
      await loadOrganizations();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const update = async (id, updates) => {
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await call(`/super-admin/organizations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setSuccess("Organization updated successfully.");
      await loadOrganizations();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await call(
        `/super-admin/organizations/${admin.organizationId}/admins`,
        {
          method: "POST",
          body: JSON.stringify(admin),
        }
      );

      setAdmin({
        organizationId: admin.organizationId,
        email: "",
        password: "",
        role: "admin",
      });

      setSuccess("Organization admin account created.");
      await loadMembers();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            CONTROL PLANE
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        <button
          onClick={logoutUser}
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {error && (
        <div className="mx-auto mt-5 max-w-7xl rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-auto mt-5 max-w-7xl rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <main className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-2">
        {/* Create Organization */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Plus size={18} />
            Create Organization
          </h2>

          <form onSubmit={createOrg} className="mt-4 space-y-3">
            <input
              required
              value={org.name}
              onChange={(e) =>
                setOrg({ ...org, name: e.target.value })
              }
              placeholder="Organization name"
              className="w-full rounded-lg border p-3 text-sm"
            />

            <input
              required
              value={org.organizationCode}
              onChange={(e) =>
                setOrg({
                  ...org,
                  organizationCode: e.target.value,
                })
              }
              placeholder="Unique organization code"
              className="w-full rounded-lg border p-3 text-sm"
            />

            <select
              value={org.type}
              onChange={(e) =>
                setOrg({ ...org, type: e.target.value })
              }
              className="w-full rounded-lg border p-3 text-sm"
            >
              {["Business", "Hospital", "School", "Hotel"].map(
                (value) => (
                  <option key={value}>{value}</option>
                )
              )}
            </select>

            <input
              value={org.location}
              onChange={(e) =>
                setOrg({ ...org, location: e.target.value })
              }
              placeholder="Location (optional)"
              className="w-full rounded-lg border p-3 text-sm"
            />

            <button
              disabled={busy}
              className="w-full rounded-lg bg-emerald-700 p-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Create Organization
            </button>
          </form>
        </section>

        {/* Create Admin */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <UserPlus size={18} />
            Create Organization Admin
          </h2>

          <form onSubmit={createAdmin} className="mt-4 space-y-3">
            <select
              required
              value={admin.organizationId}
              onChange={(e) =>
                setAdmin({
                  ...admin,
                  organizationId: e.target.value,
                })
              }
              className="w-full rounded-lg border p-3 text-sm"
            >
              <option value="">Choose organization</option>

              {rows
                .filter((item) => item.status === "active")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.organization_code})
                  </option>
                ))}
            </select>

            <input
              required
              type="email"
              value={admin.email}
              onChange={(e) =>
                setAdmin({ ...admin, email: e.target.value })
              }
              placeholder="Admin email"
              className="w-full rounded-lg border p-3 text-sm"
            />

            <input
              required
              minLength={10}
              type="password"
              value={admin.password}
              onChange={(e) =>
                setAdmin({ ...admin, password: e.target.value })
              }
              placeholder="Temporary password (min 10 chars)"
              className="w-full rounded-lg border p-3 text-sm"
            />

            <select
              value={admin.role}
              onChange={(e) =>
                setAdmin({ ...admin, role: e.target.value })
              }
              className="w-full rounded-lg border p-3 text-sm"
            >
              {["admin", "owner", "staff", "viewer"].map(
                (value) => (
                  <option key={value}>{value}</option>
                )
              )}
            </select>

            <button
              disabled={busy || !admin.organizationId}
              className="w-full rounded-lg bg-emerald-700 p-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Create Admin Account
            </button>
          </form>
        </section>

        {/* Organizations list */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Building2 size={18} />
              Organizations ({rows.length})
            </h2>

            <button
              onClick={loadOrganizations}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  {[
                    "Organization",
                    "Code",
                    "Type",
                    "Status",
                    "Action",
                  ].map((value) => (
                    <th key={value} className="p-3">
                      {value}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 font-medium">
                      {item.name}
                      <div className="text-xs text-slate-500">
                        {item.location}
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      {item.organization_code}
                    </td>

                    <td className="p-3">{item.type}</td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        disabled={busy}
                        onClick={() =>
                          update(item.id, {
                            status:
                              item.status === "active"
                                ? "inactive"
                                : "active",
                          })
                        }
                        className="rounded-lg border px-3 py-1.5 text-xs"
                      >
                        {item.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Organization data viewer */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Eye size={18} />
              Organization Data Explorer
            </h2>

            <button
              onClick={loadCurrentTab}
              disabled={dataLoading}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Organization filter */}
          <div className="mt-4">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full rounded-lg border p-3 text-sm md:max-w-sm"
            >
              <option value="">All Organizations</option>

              {rows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.organization_code})
                </option>
              ))}
            </select>
          </div>

          {/* Data tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {DATA_TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                    activeTab === tab.key
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            {dataLoading
              ? "Loading data..."
              : `${dataRows.length} records shown`}
            {dataRows.length === 500 ? " (maximum 500 rows)" : ""}
          </div>

          {/* Data table */}
          <div className="mt-3 overflow-x-auto rounded-lg border">
            {dataLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : dataRows.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No records found for this section.
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    {dataColumns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap p-3"
                      >
                        {column.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {dataRows.map((item, index) => (
                    <tr
                      key={item.id || item.user_id || index}
                      className="border-t hover:bg-slate-50"
                    >
                      {dataColumns.map((column) => (
                        <td
                          key={column}
                          className="max-w-[300px] break-words p-3"
                        >
                          {safeColumnValue(column, item[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
