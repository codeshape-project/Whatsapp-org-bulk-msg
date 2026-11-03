// // import { useState } from "react";
// // import { Navigate, useNavigate } from "react-router-dom";
// // import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Building2 } from "lucide-react";
// // import { useAuth } from "../hooks/useAuth";

// // export default function Login() {
// //   const { login, isAuthenticated, user } = useAuth();
// //   const navigate = useNavigate();
// //   const [email,setEmail] = useState("");
// //   const [password,setPassword] = useState("");
// //   const [organizationCode,setOrganizationCode] = useState("");
// //   const [superAdminMode,setSuperAdminMode] = useState(false);
// //   const [show,setShow] = useState(false);
// //   const [error,setError] = useState("");
// //   const [busy,setBusy] = useState(false);

// //   if (isAuthenticated) return <Navigate to={user?.role === "super_admin" ? "/super-admin" : "/dashboard"} replace />;
// //   const submit = async (e) => {
// //     e.preventDefault(); setError("");
// //     if (!email.trim() || !password || (!superAdminMode && !organizationCode.trim())) {
// //       setError(superAdminMode ? "Enter email and password." : "Enter email, password, and organization code."); return;
// //     }
// //     setBusy(true);
// //     try {
// //       const u = await login(email.trim(),password,true,superAdminMode ? "" : organizationCode.trim());
// //       navigate(u.role === "super_admin" ? "/super-admin" : "/dashboard",{replace:true});
// //     } catch (err) { setError(err.message || "Login failed."); }
// //     finally { setBusy(false); }
// //   };
// //   return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdf9e9] px-4 py-10">
// //     <div className="w-full max-w-[440px] rounded-[28px] border border-[#9fd5bd] bg-[#fdfbf2] p-8 shadow-xl">
// //       <div className="flex items-center gap-3"><div className="rounded-xl bg-[#e1f7e9] p-3 text-[#08744a]"><ShieldCheck size={25}/></div>
// //         <div><h1 className="text-lg font-bold text-[#0b5a3c]">WhatsApp CRM</h1><p className="text-xs text-[#2f6a56]">One platform. Multiple organizations.</p></div></div>
// //       <div className="mt-6 flex rounded-full border border-[#9fd5bd] bg-white p-1">
// //         <button type="button" onClick={()=>{setSuperAdminMode(false);setError("");}} className={`flex-1 rounded-full py-2 text-xs font-semibold ${!superAdminMode ? "bg-[#08744a] text-white" : "text-[#0b5a3c]"}`}><Building2 size={14} className="mr-1 inline"/>Organization</button>
// //         <button type="button" onClick={()=>{setSuperAdminMode(true);setError("");}} className={`flex-1 rounded-full py-2 text-xs font-semibold ${superAdminMode ? "bg-[#08744a] text-white" : "text-[#0b5a3c]"}`}><ShieldCheck size={14} className="mr-1 inline"/>Super Admin</button>
// //       </div>
// //       <h2 className="mt-5 text-lg font-bold text-[#0b5a3c]">{superAdminMode ? "Super Admin Login" : "Organization Login"}</h2>
// //       <p className="mt-1 text-xs text-[#2f6a56]">Enter your account credentials to continue.</p>
// //       <form onSubmit={submit} className="mt-5 space-y-3">
// //         <label className="flex items-center gap-3 rounded-full border border-[#9fd5bd] bg-white px-4 py-3"><Mail size={16} className="text-[#0b5a3c]"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email Address" autoComplete="username" className="w-full bg-transparent text-sm outline-none"/></label>
// //         <label className="flex items-center gap-3 rounded-full border border-[#9fd5bd] bg-white px-4 py-3"><Lock size={16} className="text-[#0b5a3c]"/><input required type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full bg-transparent text-sm outline-none"/><button type="button" onClick={()=>setShow(v=>!v)} aria-label="Toggle password visibility" className="text-[#0b5a3c]">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></label>
// //         {!superAdminMode && <label className="flex items-center gap-3 rounded-full border border-[#9fd5bd] bg-white px-4 py-3"><Building2 size={16} className="text-[#0b5a3c]"/><input required value={organizationCode} onChange={e=>setOrganizationCode(e.target.value)} placeholder="Organization Code" autoComplete="organization" className="w-full bg-transparent text-sm outline-none"/></label>}
// //         {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}
// //         <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#12a460] to-[#08744a] py-3 text-sm font-semibold text-white shadow disabled:opacity-60"><LogIn size={16}/>{busy?"Verifying...":"Login"}</button>
// //       </form>
// //       <p className="mt-4 text-center text-[11px] text-[#4b6b61]"><ShieldCheck size={13} className="mr-1 inline"/>Secure server-verified login</p>
// //     </div>
// //   </div>;
// // }

// import { useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   LogIn,
//   ShieldCheck,
//   Building2,
// } from "lucide-react";
// import { useAuth } from "../hooks/useAuth";

// const IMAGE_SRC = "/login-illustration.png";
// const LOGO_SRC = "/logo.png";

// export default function Login() {
//   const { login, isAuthenticated, user } = useAuth();
//   const navigate = useNavigate();

//   // Keep the existing login fields and behavior.
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [organizationCode, setOrganizationCode] = useState("");
//   const [superAdminMode, setSuperAdminMode] = useState(false);
//   const [show, setShow] = useState(false);
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   if (isAuthenticated) {
//     return (
//       <Navigate
//         to={user?.role === "super_admin" ? "/super-admin" : "/dashboard"}
//         replace
//       />
//     );
//   }

//   const submit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (
//       !email.trim() ||
//       !password ||
//       (!superAdminMode && !organizationCode.trim())
//     ) {
//       setError(
//         superAdminMode
//           ? "Enter email and password."
//           : "Enter email, password, and organization code."
//       );
//       return;
//     }

//     setBusy(true);
//     try {
//       const result = await login(
//         email.trim(),
//         password,
//         true,
//         superAdminMode ? "" : organizationCode.trim()
//       );

//       navigate(
//         result.role === "super_admin" ? "/super-admin" : "/dashboard",
//         { replace: true }
//       );
//     } catch (err) {
//       setError(err.message || "Login failed.");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdf9e9] px-4 py-10">
//       <style>{`
//         @property --glow-angle {
//           syntax: "<angle>";
//           inherits: false;
//           initial-value: 0deg;
//         }

//         @keyframes glow-spin {
//           to { --glow-angle: 360deg; }
//         }

//         .glow-card,
//         .glow-card::before {
//           background: conic-gradient(
//             from var(--glow-angle),
//             #25d366,
//             #d9f99d 18%,
//             #0f8a52 40%,
//             #86efac 62%,
//             #25d366 80%,
//             #bbf7d0
//           );
//           animation: glow-spin 7s linear infinite;
//         }
//           .glow-card {
//           position: relative;
//           isolation: isolate;
//         }

//         .glow-card::before {
//           content: "";
//           position: absolute;
//           inset: -4px;
//           border-radius: inherit;
//           filter: blur(16px);
//           opacity: 0.58;
//           z-index: -1;
//         }

//         .login-field:focus-within {
//           border-color: #17a862;
//           box-shadow:
//             0 0 0 3px rgba(23, 168, 98, 0.18),
//             0 0 14px rgba(37, 211, 102, 0.25);
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .glow-card,
//           .glow-card::before {
//             animation: none;
//           }
//         }
//       `}</style>

//        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),rgba(253,249,233,0))]" />

//       <div className="glow-card w-full max-w-[440px] rounded-[30px] p-[2px] lg:max-w-[900px]">
//         <div className="flex min-h-[540px] overflow-hidden rounded-[28px] bg-[#fdfbf2]">
//           <div className="relative hidden w-[48%] shrink-0 lg:block">
//             <img
//               src={IMAGE_SRC}
//               alt="WhatsApp CRM illustration"
//               className="h-full w-full object-cover object-center"
//             />
//             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#064e3b]/90 via-[#064e3b]/50 to-transparent px-8 pb-8 pt-20 text-white">
//               <div className="mb-3 flex items-center gap-3">
//                 <img
//                   src={LOGO_SRC}
//                   alt="Codeshape logo"
//                   className="h-12 w-12 rounded-full border border-white/50 bg-white object-contain p-1"
//                 />
//                 <div>
//                   <p className="text-lg font-bold">WhatsApp CRM</p>
//                   <p className="text-xs text-white/80">Codeshape</p>
//                 </div>
//               </div>
//               <h2 className="text-2xl font-bold leading-tight">
//                 One platform.
//                 <br />
//                 Multiple organizations.
//               </h2>
//               <p className="mt-2 max-w-xs text-sm text-white/85">
//                Manage your organization, contacts, campaigns, and messaging
//                 securely from one workspace.
//               </p>
//             </div>
//           </div>

//           <section className="flex flex-1 flex-col justify-center px-7 py-8 sm:px-9 lg:px-10">
//             <div className="flex items-center gap-3">
//               <div className="rounded-xl bg-[#e1f7e9] p-3 text-[#08744a]">
//                 <ShieldCheck size={25} />
//               </div>
//               <div>
//                 <h1 className="text-lg font-bold leading-tight text-[#0b5a3c]">
//                   WhatsApp CRM
//                 </h1>
//                 <p className="text-[11px] font-medium text-[#2f6a56]">
//                   Secure workspace access
//                 </p>
//               </div>
//             </div>

//             <div className="mt-6 flex rounded-full border border-[#9fd5bd] bg-white/80 p-1">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuperAdminMode(false);
//                   setError("");
//                 }}
//                 className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition ${
//                   !superAdminMode
//                     ? "bg-[#08744a] text-white shadow"
//                     : "text-[#0b5a3c] hover:bg-[#e8f8ef]"
//                 }`}
//               >
//                 <Building2 size={14} />
//                 Organization
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSuperAdminMode(true);
//                   setError("");
//                 }}
//                 className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition ${
//                   superAdminMode
//                     ? "bg-[#08744a] text-white shadow"
//                     : "text-[#0b5a3c] hover:bg-[#e8f8ef]"
//                 }`}
//               >
//                 <ShieldCheck size={14} />
//                 Super Admin
//               </button>
//             </div>

//             <h2 className="mt-5 text-lg font-bold text-[#0b5a3c]">
//               {superAdminMode ? "Super Admin Login" : "Organization Login"}
//             </h2>
//             <p className="mt-1 text-xs text-[#2f6a56]">
//               Enter your account credentials to continue.
//             </p>

//             <form onSubmit={submit} className="mt-5 space-y-3">
//               <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
//                 <Mail size={16} className="shrink-0 text-[#0b5a3c]" />
//                 <input
//                   required
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Email Address"
//                   autoComplete="username"
//                   className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
//                 />
//               </label>

//               <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
//                 <Lock size={16} className="shrink-0 text-[#0b5a3c]" />
//                 <input
//                   required
//                   type={show ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Password"
//                   autoComplete="current-password"
//                   className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShow((value) => !value)}
//                   aria-label={show ? "Hide password" : "Show password"}
//                   className="shrink-0 text-[#4b6b61] hover:text-[#0b5a3c]"
//                 >
//                   {show ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </label>
// {!superAdminMode && (
//                 <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
//                   <Building2 size={16} className="shrink-0 text-[#0b5a3c]" />
//                   <input
//                     required
//                     value={organizationCode}
//                     onChange={(e) => setOrganizationCode(e.target.value)}
//                     placeholder="Organization Code"
//                     autoComplete="organization"
//                     className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
//                   />
//                 </label>
//               )}

//               {error && (
//                 <div
//                   role="alert"
//                   className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
//                 >
//                   {error}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={busy}
//                 className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#12a460] to-[#08744a] py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(15,138,82,0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#17a862]/40 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 <LogIn size={16} />
//                 {busy ? "Verifying..." : "Login"}
//               </button>
//             </form>

//             <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#4b6b61]">
//               <ShieldCheck size={14} className="text-[#0f8a52]" />
//               Secure server-verified login
//             </p>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const IMAGE_SRC = "/login-illustration.png";
const LOGO_SRC = "/logo.png";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [superAdminMode, setSuperAdminMode] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "super_admin" ? "/super-admin" : "/dashboard"}
        replace
      />
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !password ||
      (!superAdminMode && !organizationCode.trim())
    ) {
      setError(
        superAdminMode
          ? "Enter email and password."
          : "Enter email, password, and organization code."
      );
      return;
    }

    setBusy(true);

    try {
      const result = await login(
        email.trim(),
        password,
        true,
        superAdminMode ? "" : organizationCode.trim()
      );

      navigate(
        result.role === "super_admin" ? "/super-admin" : "/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdf9e9] px-4 py-10">
      <style>{`
        @property --glow-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes glow-spin {
          to {
            --glow-angle: 360deg;
          }
        }

        .glow-card,
        .glow-card::before {
          background: conic-gradient(
            from var(--glow-angle),
            #25d366,
            #d9f99d 18%,
            #0f8a52 40%,
            #86efac 62%,
            #25d366 80%,
            #bbf7d0
          );
          animation: glow-spin 7s linear infinite;
        }

        .glow-card {
          position: relative;
          isolation: isolate;
        }

        .glow-card::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          filter: blur(16px);
          opacity: 0.58;
          z-index: -1;
        }

        .login-field:focus-within {
          border-color: #17a862;
          box-shadow:
            0 0 0 3px rgba(23, 168, 98, 0.18),
            0 0 14px rgba(37, 211, 102, 0.25);
        }

        @media (prefers-reduced-motion: reduce) {
          .glow-card,
          .glow-card::before {
            animation: none;
          }
        }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),rgba(253,249,233,0))]" />

      {/* Main glowing card */}
      <div className="glow-card w-full max-w-[440px] rounded-[30px] p-[2px] lg:max-w-[900px]">
        <div className="flex min-h-[540px] overflow-hidden rounded-[28px] bg-[#fdfbf2]">

          {/* Curved image panel */}
          <div className="relative hidden w-[48%] shrink-0 overflow-hidden lg:block">
            <img
              src={IMAGE_SRC}
              alt="WhatsApp CRM illustration"
              className="absolute inset-0 h-full w-full object-cover object-center"
              // style={{
              //   clipPath: "ellipse(100% 100% at 0% 50%)",
              //   WebkitClipPath: "ellipse(100% 100% at 0% 50%)",
              // }}
            />

            {/* Image overlay */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex w-[86%] flex-col justify-end px-8 pb-8 pt-20 text-white"
              style={{
                clipPath: "ellipse(100% 100% at 0% 50%)",
                WebkitClipPath: "ellipse(100% 100% at 0% 50%)",
                background:
                  "linear-gradient(to top, rgba(6,78,59,.82), rgba(6,78,59,.20) 35%, transparent 72%)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={LOGO_SRC}
                  alt="Codeshape logo"
                  className="h-12 w-12 rounded-full border border-white/50 bg-white object-contain p-1"
                />

                <div>
                  <p className="text-lg font-bold">WhatsApp CRM</p>
                  <p className="text-xs text-white/80">Codeshape</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold leading-tight">
                One platform.
                <br />
                Multiple organizations.
              </h2>

              <p className="mt-2 max-w-xs text-sm text-white/85">
                Manage your organization, contacts, campaigns, and messaging
                securely from one workspace.
              </p>
            </div>
          </div>

          {/* Login form */}
          <section className="flex flex-1 flex-col justify-center px-7 py-8 sm:px-9 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#e1f7e9] p-3 text-[#08744a]">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h1 className="text-lg font-bold leading-tight text-[#0b5a3c]">
                  WhatsApp CRM
                </h1>

                <p className="text-[11px] font-medium text-[#2f6a56]">
                  Secure workspace access
                </p>
              </div>
            </div>

            {/* Login mode switch */}
            <div className="mt-6 flex rounded-full border border-[#9fd5bd] bg-white/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setSuperAdminMode(false);
                  setError("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition ${
                  !superAdminMode
                    ? "bg-[#08744a] text-white shadow"
                    : "text-[#0b5a3c] hover:bg-[#e8f8ef]"
                }`}
              >
                <Building2 size={14} />
                Organization
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuperAdminMode(true);
                  setError("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition ${
                  superAdminMode
                    ? "bg-[#08744a] text-white shadow"
                    : "text-[#0b5a3c] hover:bg-[#e8f8ef]"
                }`}
              >
                <ShieldCheck size={14} />
                Super Admin
              </button>
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#0b5a3c]">
              {superAdminMode ? "Super Admin Login" : "Organization Login"}
            </h2>

            <p className="mt-1 text-xs text-[#2f6a56]">
              Enter your account credentials to continue.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">

              {/* Email */}
              <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
                <Mail size={16} className="shrink-0 text-[#0b5a3c]" />

                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  autoComplete="username"
                  className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
                />
              </label>

              {/* Password */}
              <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
                <Lock size={16} className="shrink-0 text-[#0b5a3c]" />

                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
                />

                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="shrink-0 text-[#4b6b61] hover:text-[#0b5a3c]"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              {/* Organization code */}
              {!superAdminMode && (
                <label className="login-field flex items-center gap-2.5 rounded-full border border-[#9fd5bd] bg-white/80 px-4 py-3 transition">
                  <Building2 size={16} className="shrink-0 text-[#0b5a3c]" />

                  <input
                    required
                    value={organizationCode}
                    onChange={(e) => setOrganizationCode(e.target.value)}
                    placeholder="Organization Code"
                    autoComplete="organization"
                    className="w-full bg-transparent text-sm text-[#0b5a3c] outline-none placeholder:text-[#6f8f84]"
                  />
                </label>
              )}

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                >
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#12a460] to-[#08744a] py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(15,138,82,0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#17a862]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={16} />
                {busy ? "Verifying..." : "Login"}
              </button>
            </form>

            {/* Security footer */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#4b6b61]">
              <ShieldCheck size={14} className="text-[#0f8a52]" />
              Secure server-verified login
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
