//! Licensed to the .NET Foundation under one or more agreements.
//! The .NET Foundation licenses this file to you under the MIT license.

var e=!1;const t=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,6,64,25,11,11])),o=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11])),n=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])),r=Symbol.for("wasm promise_control");function i(e,t){let o=null;const n=new Promise((function(n,r){o={isDone:!1,promise:null,resolve:t=>{o.isDone||(o.isDone=!0,n(t),e&&e())},reject:e=>{o.isDone||(o.isDone=!0,r(e),t&&t())}}}));o.promise=n;const i=n;return i[r]=o,{promise:i,promise_control:o}}function s(e){return e[r]}function a(e){e&&function(e){return void 0!==e[r]}(e)||Be(!1,"Promise is not controllable")}const l="__mono_message__",c=["debug","log","trace","warn","info","error"],d="MONO_WASM: ";let u,f,m,g,p,h;function w(e){g=e}function b(e){if(Pe.diagnosticTracing){const t="function"==typeof e?e():e;console.debug(d+t)}}function y(e,...t){console.info(d+e,...t)}function v(e,...t){console.info(e,...t)}function E(e,...t){console.warn(d+e,...t)}function _(e,...t){if(t&&t.length>0&&t[0]&&"object"==typeof t[0]){if(t[0].silent)return;if(t[0].toString)return void console.error(d+e,t[0].toString())}console.error(d+e,...t)}function x(e,t,o){return function(...n){try{let r=n[0];if(void 0===r)r="undefined";else if(null===r)r="null";else if("function"==typeof r)r=r.toString();else if("string"!=typeof r)try{r=JSON.stringify(r)}catch(e){r=r.toString()}t(o?JSON.stringify({method:e,payload:r,arguments:n.slice(1)}):[e+r,...n.slice(1)])}catch(e){m.error(`proxyConsole failed: ${e}`)}}}function j(e,t,o){f=t,g=e,m={...t};const n=`${o}/console`.replace("https://","wss://").replace("http://","ws://");u=new WebSocket(n),u.addEventListener("error",A),u.addEventListener("close",S),function(){for(const e of c)f[e]=x(`console.${e}`,T,!0)}()}function R(e){let t=30;const o=()=>{u?0==u.bufferedAmount||0==t?(e&&v(e),function(){for(const e of c)f[e]=x(`console.${e}`,m.log,!1)}(),u.removeEventListener("error",A),u.removeEventListener("close",S),u.close(1e3,e),u=void 0):(t--,globalThis.setTimeout(o,100)):e&&m&&m.log(e)};o()}function T(e){u&&u.readyState===WebSocket.OPEN?u.send(e):m.log(e)}function A(e){m.error(`[${g}] proxy console websocket error: ${e}`,e)}function S(e){m.debug(`[${g}] proxy console websocket closed: ${e}`,e)}function D(){Pe.preferredIcuAsset=O(Pe.config);let e="invariant"==Pe.config.globalizationMode;if(!e)if(Pe.preferredIcuAsset)Pe.diagnosticTracing&&b("ICU data archive(s) available, disabling invariant mode");else{if("custom"===Pe.config.globalizationMode||"all"===Pe.config.globalizationMode||"sharded"===Pe.config.globalizationMode){const e="invariant globalization mode is inactive and no ICU data archives are available";throw _(`ERROR: ${e}`),new Error(e)}Pe.diagnosticTracing&&b("ICU data archive(s) not available, using invariant globalization mode"),e=!0,Pe.preferredIcuAsset=null}const t="DOTNET_SYSTEM_GLOBALIZATION_INVARIANT",o=Pe.config.environmentVariables;if(void 0===o[t]&&e&&(o[t]="1"),void 0===o.TZ)try{const e=Intl.DateTimeFormat().resolvedOptions().timeZone||null;e&&(o.TZ=e)}catch(e){y("failed to detect timezone, will fallback to UTC")}}function O(e){var t;if((null===(t=e.resources)||void 0===t?void 0:t.icu)&&"invariant"!=e.globalizationMode){const t=e.applicationCulture||(ke?globalThis.navigator&&globalThis.navigator.languages&&globalThis.navigator.languages[0]:Intl.DateTimeFormat().resolvedOptions().locale),o=e.resources.icu;let n=null;if("custom"===e.globalizationMode){if(o.length>=1)return o[0].name}else t&&"all"!==e.globalizationMode?"sharded"===e.globalizationMode&&(n=function(e){const t=e.split("-")[0];return"en"===t||["fr","fr-FR","it","it-IT","de","de-DE","es","es-ES"].includes(e)?"icudt_EFIGS.dat":["zh","ko","ja"].includes(t)?"icudt_CJK.dat":"icudt_no_CJK.dat"}(t)):n="icudt.dat";if(n)for(let e=0;e<o.length;e++){const t=o[e];if(t.virtualPath===n)return t.name}}return e.globalizationMode="invariant",null}(new Date).valueOf();const C=class{constructor(e){this.url=e}toString(){return this.url}};async function k(e,t){try{const o="function"==typeof globalThis.fetch;if(Se){const n=e.startsWith("file://");if(!n&&o)return globalThis.fetch(e,t||{credentials:"same-origin"});p||(h=Ne.require("url"),p=Ne.require("fs")),n&&(e=h.fileURLToPath(e));const r=await p.promises.readFile(e);return{ok:!0,headers:{length:0,get:()=>null},url:e,arrayBuffer:()=>r,json:()=>JSON.parse(r),text:()=>{throw new Error("NotImplementedException")}}}if(o)return globalThis.fetch(e,t||{credentials:"same-origin"});if("function"==typeof read)return{ok:!0,url:e,headers:{length:0,get:()=>null},arrayBuffer:()=>new Uint8Array(read(e,"binary")),json:()=>JSON.parse(read(e,"utf8")),text:()=>read(e,"utf8")}}catch(t){return{ok:!1,url:e,status:500,headers:{length:0,get:()=>null},statusText:"ERR28: "+t,arrayBuffer:()=>{throw t},json:()=>{throw t},text:()=>{throw t}}}throw new Error("No fetch implementation available")}function I(e){return"string"!=typeof e&&Be(!1,"url must be a string"),!M(e)&&0!==e.indexOf("./")&&0!==e.indexOf("../")&&globalThis.URL&&globalThis.document&&globalThis.document.baseURI&&(e=new URL(e,globalThis.document.baseURI).toString()),e}const U=/^[a-zA-Z][a-zA-Z\d+\-.]*?:\/\//,P=/[a-zA-Z]:[\\/]/;function M(e){return Se||Ie?e.startsWith("/")||e.startsWith("\\")||-1!==e.indexOf("///")||P.test(e):U.test(e)}let L,N=0;const $=[],z=[],W=new Map,F={"js-module-threads":!0,"js-module-runtime":!0,"js-module-dotnet":!0,"js-module-native":!0,"js-module-diagnostics":!0},B={...F,"js-module-library-initializer":!0},V={...F,dotnetwasm:!0,heap:!0,manifest:!0},q={...B,manifest:!0},H={...B,dotnetwasm:!0},J={dotnetwasm:!0,symbols:!0},Z={...B,dotnetwasm:!0,symbols:!0},Q={symbols:!0};function G(e){return!("icu"==e.behavior&&e.name!=Pe.preferredIcuAsset)}function K(e,t,o){null!=t||(t=[]),Be(1==t.length,`Expect to have one ${o} asset in resources`);const n=t[0];return n.behavior=o,X(n),e.push(n),n}function X(e){V[e.behavior]&&W.set(e.behavior,e)}function Y(e){Be(V[e],`Unknown single asset behavior ${e}`);const t=W.get(e);if(t&&!t.resolvedUrl)if(t.resolvedUrl=Pe.locateFile(t.name),F[t.behavior]){const e=ge(t);e?("string"!=typeof e&&Be(!1,"loadBootResource response for 'dotnetjs' type should be a URL string"),t.resolvedUrl=e):t.resolvedUrl=ce(t.resolvedUrl,t.behavior)}else if("dotnetwasm"!==t.behavior)throw new Error(`Unknown single asset behavior ${e}`);return t}function ee(e){const t=Y(e);return Be(t,`Single asset for ${e} not found`),t}let te=!1;async function oe(){if(!te){te=!0,Pe.diagnosticTracing&&b("mono_download_assets");try{const e=[],t=[],o=(e,t)=>{!Z[e.behavior]&&G(e)&&Pe.expected_instantiated_assets_count++,!H[e.behavior]&&G(e)&&(Pe.expected_downloaded_assets_count++,t.push(se(e)))};for(const t of $)o(t,e);for(const e of z)o(e,t);Pe.allDownloadsQueued.promise_control.resolve(),Promise.all([...e,...t]).then((()=>{Pe.allDownloadsFinished.promise_control.resolve()})).catch((e=>{throw Pe.err("Error in mono_download_assets: "+e),Xe(1,e),e})),await Pe.runtimeModuleLoaded.promise;const n=async e=>{const t=await e;if(t.buffer){if(!Z[t.behavior]){t.buffer&&"object"==typeof t.buffer||Be(!1,"asset buffer must be array-like or buffer-like or promise of these"),"string"!=typeof t.resolvedUrl&&Be(!1,"resolvedUrl must be string");const e=t.resolvedUrl,o=await t.buffer,n=new Uint8Array(o);pe(t),await Ue.beforeOnRuntimeInitialized.promise,Ue.instantiate_asset(t,e,n)}}else J[t.behavior]?("symbols"===t.behavior&&(await Ue.instantiate_symbols_asset(t),pe(t)),J[t.behavior]&&++Pe.actual_downloaded_assets_count):(t.isOptional||Be(!1,"Expected asset to have the downloaded buffer"),!H[t.behavior]&&G(t)&&Pe.expected_downloaded_assets_count--,!Z[t.behavior]&&G(t)&&Pe.expected_instantiated_assets_count--)},r=[],i=[];for(const t of e)r.push(n(t));for(const e of t)i.push(n(e));Promise.all(r).then((()=>{Ce||Ue.coreAssetsInMemory.promise_control.resolve()})).catch((e=>{throw Pe.err("Error in mono_download_assets: "+e),Xe(1,e),e})),Promise.all(i).then((async()=>{Ce||(await Ue.coreAssetsInMemory.promise,Ue.allAssetsInMemory.promise_control.resolve())})).catch((e=>{throw Pe.err("Error in mono_download_assets: "+e),Xe(1,e),e}))}catch(e){throw Pe.err("Error in mono_download_assets: "+e),e}}}let ne=!1;function re(){if(ne)return;ne=!0;const e=Pe.config,t=[];if(e.assets)for(const t of e.assets)"object"!=typeof t&&Be(!1,`asset must be object, it was ${typeof t} : ${t}`),"string"!=typeof t.behavior&&Be(!1,"asset behavior must be known string"),"string"!=typeof t.name&&Be(!1,"asset name must be string"),t.resolvedUrl&&"string"!=typeof t.resolvedUrl&&Be(!1,"asset resolvedUrl could be string"),t.hash&&"string"!=typeof t.hash&&Be(!1,"asset resolvedUrl could be string"),t.pendingDownload&&"object"!=typeof t.pendingDownload&&Be(!1,"asset pendingDownload could be object"),t.isCore?$.push(t):z.push(t),X(t);else if(e.resources){const o=e.resources;o.wasmNative||Be(!1,"resources.wasmNative must be defined"),o.jsModuleNative||Be(!1,"resources.jsModuleNative must be defined"),o.jsModuleRuntime||Be(!1,"resources.jsModuleRuntime must be defined"),K(z,o.wasmNative,"dotnetwasm"),K(t,o.jsModuleNative,"js-module-native"),K(t,o.jsModuleRuntime,"js-module-runtime"),o.jsModuleDiagnostics&&K(t,o.jsModuleDiagnostics,"js-module-diagnostics");const n=(e,t,o)=>{const n=e;n.behavior=t,o?(n.isCore=!0,$.push(n)):z.push(n)};if(o.coreAssembly)for(let e=0;e<o.coreAssembly.length;e++)n(o.coreAssembly[e],"assembly",!0);if(o.assembly)for(let e=0;e<o.assembly.length;e++)n(o.assembly[e],"assembly",!o.coreAssembly);if(0!=e.debugLevel&&Pe.isDebuggingSupported()){if(o.corePdb)for(let e=0;e<o.corePdb.length;e++)n(o.corePdb[e],"pdb",!0);if(o.pdb)for(let e=0;e<o.pdb.length;e++)n(o.pdb[e],"pdb",!o.corePdb)}if(e.loadAllSatelliteResources&&o.satelliteResources)for(const e in o.satelliteResources)for(let t=0;t<o.satelliteResources[e].length;t++){const r=o.satelliteResources[e][t];r.culture=e,n(r,"resource",!o.coreAssembly)}if(o.coreVfs)for(let e=0;e<o.coreVfs.length;e++)n(o.coreVfs[e],"vfs",!0);if(o.vfs)for(let e=0;e<o.vfs.length;e++)n(o.vfs[e],"vfs",!o.coreVfs);const r=O(e);if(r&&o.icu)for(let e=0;e<o.icu.length;e++){const t=o.icu[e];t.name===r&&n(t,"icu",!1)}if(o.wasmSymbols)for(let e=0;e<o.wasmSymbols.length;e++)n(o.wasmSymbols[e],"symbols",!1)}if(e.appsettings)for(let t=0;t<e.appsettings.length;t++){const o=e.appsettings[t],n=he(o);"appsettings.json"!==n&&n!==`appsettings.${e.applicationEnvironment}.json`||z.push({name:o,behavior:"vfs",noCache:!0,useCredentials:!0})}e.assets=[...$,...z,...t]}async function ie(e){const t=await se(e);return await t.pendingDownloadInternal.response,t.buffer}async function se(e){try{return await ae(e)}catch(t){if(!Pe.enableDownloadRetry)throw t;if(Ie||Se)throw t;if(e.pendingDownload&&e.pendingDownloadInternal==e.pendingDownload)throw t;if(e.resolvedUrl&&-1!=e.resolvedUrl.indexOf("file://"))throw t;if(t&&404==t.status)throw t;e.pendingDownloadInternal=void 0,await Pe.allDownloadsQueued.promise;try{return Pe.diagnosticTracing&&b(`Retrying download '${e.name}'`),await ae(e)}catch(t){return e.pendingDownloadInternal=void 0,await new Promise((e=>globalThis.setTimeout(e,100))),Pe.diagnosticTracing&&b(`Retrying download (2) '${e.name}' after delay`),await ae(e)}}}async function ae(e){for(;L;)await L.promise;try{++N,N==Pe.maxParallelDownloads&&(Pe.diagnosticTracing&&b("Throttling further parallel downloads"),L=i());const t=await async function(e){if(e.pendingDownload&&(e.pendingDownloadInternal=e.pendingDownload),e.pendingDownloadInternal&&e.pendingDownloadInternal.response)return e.pendingDownloadInternal.response;if(e.buffer){const t=await e.buffer;return e.resolvedUrl||(e.resolvedUrl="undefined://"+e.name),e.pendingDownloadInternal={url:e.resolvedUrl,name:e.name,response:Promise.resolve({ok:!0,arrayBuffer:()=>t,json:()=>JSON.parse(new TextDecoder("utf-8").decode(t)),text:()=>{throw new Error("NotImplementedException")},headers:{get:()=>{}}})},e.pendingDownloadInternal.response}const t=e.loadRemote&&Pe.config.remoteSources?Pe.config.remoteSources:[""];let o;for(let n of t){n=n.trim(),"./"===n&&(n="");const t=le(e,n);e.name===t?Pe.diagnosticTracing&&b(`Attempting to download '${t}'`):Pe.diagnosticTracing&&b(`Attempting to download '${t}' for ${e.name}`);try{e.resolvedUrl=t;const n=fe(e);if(e.pendingDownloadInternal=n,o=await n.response,!o||!o.ok)continue;return o}catch(e){o||(o={ok:!1,url:t,status:0,statusText:""+e});continue}}const n=e.isOptional||e.name.match(/\.pdb$/)&&Pe.config.ignorePdbLoadErrors;if(o||Be(!1,`Response undefined ${e.name}`),!n){const t=new Error(`download '${o.url}' for ${e.name} failed ${o.status} ${o.statusText}`);throw t.status=o.status,t}y(`optional download '${o.url}' for ${e.name} failed ${o.status} ${o.statusText}`)}(e);return t?(J[e.behavior]||(e.buffer=await t.arrayBuffer(),++Pe.actual_downloaded_assets_count),e):e}finally{if(--N,L&&N==Pe.maxParallelDownloads-1){Pe.diagnosticTracing&&b("Resuming more parallel downloads");const e=L;L=void 0,e.promise_control.resolve()}}}function le(e,t){let o;return null==t&&Be(!1,`sourcePrefix must be provided for ${e.name}`),e.resolvedUrl?o=e.resolvedUrl:(o=""===t?"assembly"===e.behavior||"pdb"===e.behavior?e.name:"resource"===e.behavior&&e.culture&&""!==e.culture?`${e.culture}/${e.name}`:e.name:t+e.name,o=ce(Pe.locateFile(o),e.behavior)),o&&"string"==typeof o||Be(!1,"attemptUrl need to be path or url string"),o}function ce(e,t){return Pe.modulesUniqueQuery&&q[t]&&(e+=Pe.modulesUniqueQuery),e}let de=0;const ue=new Set;function fe(e){try{e.resolvedUrl||Be(!1,"Request's resolvedUrl must be set");const t=function(e){let t=e.resolvedUrl;if(Pe.loadBootResource){const o=ge(e);if(o instanceof Promise)return o;"string"==typeof o&&(t=o)}const o={};return Pe.config.disableNoCacheFetch||(o.cache="no-cache"),e.useCredentials?o.credentials="include":!Pe.config.disableIntegrityCheck&&e.hash&&(o.integrity=e.hash),Pe.fetch_like(t,o)}(e),o={name:e.name,url:e.resolvedUrl,response:t};return ue.add(e.name),o.response.then((()=>{"assembly"==e.behavior&&Pe.loadedAssemblies.push(e.name),de++,Pe.onDownloadResourceProgress&&Pe.onDownloadResourceProgress(de,ue.size)})),o}catch(t){const o={ok:!1,url:e.resolvedUrl,status:500,statusText:"ERR29: "+t,arrayBuffer:()=>{throw t},json:()=>{throw t}};return{name:e.name,url:e.resolvedUrl,response:Promise.resolve(o)}}}const me={resource:"assembly",assembly:"assembly",pdb:"pdb",icu:"globalization",vfs:"configuration",manifest:"manifest",dotnetwasm:"dotnetwasm","js-module-dotnet":"dotnetjs","js-module-native":"dotnetjs","js-module-runtime":"dotnetjs","js-module-threads":"dotnetjs"};function ge(e){var t;if(Pe.loadBootResource){const o=null!==(t=e.hash)&&void 0!==t?t:"",n=e.resolvedUrl,r=me[e.behavior];if(r){const t=Pe.loadBootResource(r,e.name,n,o,e.behavior);return"string"==typeof t?I(t):t}}}function pe(e){e.pendingDownloadInternal=null,e.pendingDownload=null,e.buffer=null,e.moduleExports=null}function he(e){let t=e.lastIndexOf("/");return t>=0&&t++,e.substring(t)}async function we(e){e&&await Promise.all((null!=e?e:[]).map((e=>async function(e){try{const t=e.name;if(!e.moduleExports){const o=ce(Pe.locateFile(t),"js-module-library-initializer");Pe.diagnosticTracing&&b(`Attempting to import '${o}' for ${e}`),e.moduleExports=await import(/*! webpackIgnore: true */o)}Pe.libraryInitializers.push({scriptName:t,exports:e.moduleExports})}catch(t){E(`Failed to import library initializer '${e}': ${t}`)}}(e))))}async function be(e,t){if(!Pe.libraryInitializers)return;const o=[];for(let n=0;n<Pe.libraryInitializers.length;n++){const r=Pe.libraryInitializers[n];r.exports[e]&&o.push(ye(r.scriptName,e,(()=>r.exports[e](...t))))}await Promise.all(o)}async function ye(e,t,o){try{await o()}catch(o){throw E(`Failed to invoke '${t}' on library initializer '${e}': ${o}`),Xe(1,o),o}}function ve(e,t){if(e===t)return e;const o={...t};return void 0!==o.assets&&o.assets!==e.assets&&(o.assets=[...e.assets||[],...o.assets||[]]),void 0!==o.resources&&(o.resources=_e(e.resources||{assembly:[],jsModuleNative:[],jsModuleRuntime:[],wasmNative:[]},o.resources)),void 0!==o.environmentVariables&&(o.environmentVariables={...e.environmentVariables||{},...o.environmentVariables||{}}),void 0!==o.runtimeOptions&&o.runtimeOptions!==e.runtimeOptions&&(o.runtimeOptions=[...e.runtimeOptions||[],...o.runtimeOptions||[]]),Object.assign(e,o)}function Ee(e,t){if(e===t)return e;const o={...t};return o.config&&(e.config||(e.config={}),o.config=ve(e.config,o.config)),Object.assign(e,o)}function _e(e,t){if(e===t)return e;const o={...t};return void 0!==o.coreAssembly&&(o.coreAssembly=[...e.coreAssembly||[],...o.coreAssembly||[]]),void 0!==o.assembly&&(o.assembly=[...e.assembly||[],...o.assembly||[]]),void 0!==o.lazyAssembly&&(o.lazyAssembly=[...e.lazyAssembly||[],...o.lazyAssembly||[]]),void 0!==o.corePdb&&(o.corePdb=[...e.corePdb||[],...o.corePdb||[]]),void 0!==o.pdb&&(o.pdb=[...e.pdb||[],...o.pdb||[]]),void 0!==o.jsModuleWorker&&(o.jsModuleWorker=[...e.jsModuleWorker||[],...o.jsModuleWorker||[]]),void 0!==o.jsModuleNative&&(o.jsModuleNative=[...e.jsModuleNative||[],...o.jsModuleNative||[]]),void 0!==o.jsModuleDiagnostics&&(o.jsModuleDiagnostics=[...e.jsModuleDiagnostics||[],...o.jsModuleDiagnostics||[]]),void 0!==o.jsModuleRuntime&&(o.jsModuleRuntime=[...e.jsModuleRuntime||[],...o.jsModuleRuntime||[]]),void 0!==o.wasmSymbols&&(o.wasmSymbols=[...e.wasmSymbols||[],...o.wasmSymbols||[]]),void 0!==o.wasmNative&&(o.wasmNative=[...e.wasmNative||[],...o.wasmNative||[]]),void 0!==o.icu&&(o.icu=[...e.icu||[],...o.icu||[]]),void 0!==o.satelliteResources&&(o.satelliteResources=function(e,t){if(e===t)return e;for(const o in t)e[o]=[...e[o]||[],...t[o]||[]];return e}(e.satelliteResources||{},o.satelliteResources||{})),void 0!==o.modulesAfterConfigLoaded&&(o.modulesAfterConfigLoaded=[...e.modulesAfterConfigLoaded||[],...o.modulesAfterConfigLoaded||[]]),void 0!==o.modulesAfterRuntimeReady&&(o.modulesAfterRuntimeReady=[...e.modulesAfterRuntimeReady||[],...o.modulesAfterRuntimeReady||[]]),void 0!==o.extensions&&(o.extensions={...e.extensions||{},...o.extensions||{}}),void 0!==o.vfs&&(o.vfs=[...e.vfs||[],...o.vfs||[]]),Object.assign(e,o)}function xe(){const e=Pe.config;if(e.environmentVariables=e.environmentVariables||{},e.runtimeOptions=e.runtimeOptions||[],e.resources=e.resources||{assembly:[],jsModuleNative:[],jsModuleWorker:[],jsModuleRuntime:[],wasmNative:[],vfs:[],satelliteResources:{}},e.assets){Pe.diagnosticTracing&&b("config.assets is deprecated, use config.resources instead");for(const t of e.assets){const o={};switch(t.behavior){case"assembly":o.assembly=[t];break;case"pdb":o.pdb=[t];break;case"resource":o.satelliteResources={},o.satelliteResources[t.culture]=[t];break;case"icu":o.icu=[t];break;case"symbols":o.wasmSymbols=[t];break;case"vfs":o.vfs=[t];break;case"dotnetwasm":o.wasmNative=[t];break;case"js-module-threads":o.jsModuleWorker=[t];break;case"js-module-runtime":o.jsModuleRuntime=[t];break;case"js-module-native":o.jsModuleNative=[t];break;case"js-module-diagnostics":o.jsModuleDiagnostics=[t];break;case"js-module-dotnet":break;default:throw new Error(`Unexpected behavior ${t.behavior} of asset ${t.name}`)}_e(e.resources,o)}}e.debugLevel,e.applicationEnvironment||(e.applicationEnvironment="Production"),e.applicationCulture&&(e.environmentVariables.LANG=`${e.applicationCulture}.UTF-8`),Ue.diagnosticTracing=Pe.diagnosticTracing=!!e.diagnosticTracing,Ue.waitForDebugger=e.waitForDebugger,Pe.maxParallelDownloads=e.maxParallelDownloads||Pe.maxParallelDownloads,Pe.enableDownloadRetry=void 0!==e.enableDownloadRetry?e.enableDownloadRetry:Pe.enableDownloadRetry}let je=!1;async function Re(e){var t;if(je)return void await Pe.afterConfigLoaded.promise;let o;try{if(e.configSrc||Pe.config&&0!==Object.keys(Pe.config).length&&(Pe.config.assets||Pe.config.resources)||(e.configSrc="dotnet.boot.js"),o=e.configSrc,je=!0,o&&(Pe.diagnosticTracing&&b("mono_wasm_load_config"),await async function(e){const t=e.configSrc,o=Pe.locateFile(t);let n=null;void 0!==Pe.loadBootResource&&(n=Pe.loadBootResource("manifest",t,o,"","manifest"));let r,i=null;if(n)if("string"==typeof n)n.includes(".json")?(i=await s(I(n)),r=await Ae(i)):r=(await import(I(n))).config;else{const e=await n;"function"==typeof e.json?(i=e,r=await Ae(i)):r=e.config}else o.includes(".json")?(i=await s(ce(o,"manifest")),r=await Ae(i)):r=(await import(ce(o,"manifest"))).config;function s(e){return Pe.fetch_like(e,{method:"GET",credentials:"include",cache:"no-cache"})}Pe.config.applicationEnvironment&&(r.applicationEnvironment=Pe.config.applicationEnvironment),ve(Pe.config,r)}(e)),xe(),await we(null===(t=Pe.config.resources)||void 0===t?void 0:t.modulesAfterConfigLoaded),await be("onRuntimeConfigLoaded",[Pe.config]),e.onConfigLoaded)try{await e.onConfigLoaded(Pe.config,Le),xe()}catch(e){throw _("onConfigLoaded() failed",e),e}xe(),Pe.afterConfigLoaded.promise_control.resolve(Pe.config)}catch(t){const n=`Failed to load config file ${o} ${t} ${null==t?void 0:t.stack}`;throw Pe.config=e.config=Object.assign(Pe.config,{message:n,error:t,isError:!0}),Xe(1,new Error(n)),t}}function Te(){return!!globalThis.navigator&&(Pe.isChromium||Pe.isFirefox)}async function Ae(e){const t=Pe.config,o=await e.json();t.applicationEnvironment||o.applicationEnvironment||(o.applicationEnvironment=e.headers.get("Blazor-Environment")||e.headers.get("DotNet-Environment")||void 0),o.environmentVariables||(o.environmentVariables={});const n=e.headers.get("DOTNET-MODIFIABLE-ASSEMBLIES");n&&(o.environmentVariables.DOTNET_MODIFIABLE_ASSEMBLIES=n);const r=e.headers.get("ASPNETCORE-BROWSER-TOOLS");return r&&(o.environmentVariables.__ASPNETCORE_BROWSER_TOOLS=r),o}"function"!=typeof importScripts||globalThis.onmessage||(globalThis.dotnetSidecar=!0);const Se="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,De="function"==typeof importScripts,Oe=De&&"undefined"!=typeof dotnetSidecar,Ce=De&&!Oe,ke="object"==typeof window||De&&!Se,Ie=!ke&&!Se;let Ue={},Pe={},Me={},Le={},Ne={},$e=!1;const ze={},We={config:ze},Fe={mono:{},binding:{},internal:Ne,module:We,loaderHelpers:Pe,runtimeHelpers:Ue,diagnosticHelpers:Me,api:Le};function Be(e,t){if(e)return;const o="Assert failed: "+("function"==typeof t?t():t),n=new Error(o);_(o,n),Ue.nativeAbort(n)}function Ve(){return void 0!==Pe.exitCode}function qe(){return Ue.runtimeReady&&!Ve()}function He(){Ve()&&Be(!1,`.NET runtime already exited with ${Pe.exitCode} ${Pe.exitReason}. You can use runtime.runMain() which doesn't exit the runtime.`),Ue.runtimeReady||Be(!1,".NET runtime didn't start yet. Please call dotnet.create() first.")}function Je(){ke&&(globalThis.addEventListener("unhandledrejection",et),globalThis.addEventListener("error",tt))}let Ze,Qe;function Ge(e){Qe&&Qe(e),Xe(e,Pe.exitReason)}function Ke(e){Ze&&Ze(e||Pe.exitReason),Xe(1,e||Pe.exitReason)}function Xe(t,o){var n,r;const i=o&&"object"==typeof o;t=i&&"number"==typeof o.status?o.status:void 0===t?-1:t;const s=i&&"string"==typeof o.message?o.message:""+o;(o=i?o:Ue.ExitStatus?function(e,t){const o=new Ue.ExitStatus(e);return o.message=t,o.toString=()=>t,o}(t,s):new Error("Exit with code "+t+" "+s)).status=t,o.message||(o.message=s);const a=""+(o.stack||(new Error).stack);try{Object.defineProperty(o,"stack",{get:()=>a})}catch(e){}const l=!!o.silent;if(o.silent=!0,Ve())Pe.diagnosticTracing&&b("mono_exit called after exit");else{try{We.onAbort==Ke&&(We.onAbort=Ze),We.onExit==Ge&&(We.onExit=Qe),ke&&(globalThis.removeEventListener("unhandledrejection",et),globalThis.removeEventListener("error",tt)),Ue.runtimeReady?(Ue.jiterpreter_dump_stats&&Ue.jiterpreter_dump_stats(!1),0===t&&(null===(n=Pe.config)||void 0===n?void 0:n.interopCleanupOnExit)&&Ue.forceDisposeProxies(!0,!0),e&&0!==t&&(null===(r=Pe.config)||void 0===r||r.dumpThreadsOnNonZeroExit)):(Pe.diagnosticTracing&&b(`abort_startup, reason: ${o}`),function(e){Pe.allDownloadsQueued.promise_control.reject(e),Pe.allDownloadsFinished.promise_control.reject(e),Pe.afterConfigLoaded.promise_control.reject(e),Pe.wasmCompilePromise.promise_control.reject(e),Pe.runtimeModuleLoaded.promise_control.reject(e),Ue.dotnetReady&&(Ue.dotnetReady.promise_control.reject(e),Ue.afterInstantiateWasm.promise_control.reject(e),Ue.beforePreInit.promise_control.reject(e),Ue.afterPreInit.promise_control.reject(e),Ue.afterPreRun.promise_control.reject(e),Ue.beforeOnRuntimeInitialized.promise_control.reject(e),Ue.afterOnRuntimeInitialized.promise_control.reject(e),Ue.afterPostRun.promise_control.reject(e))}(o))}catch(e){E("mono_exit A failed",e)}try{l||(function(e,t){if(0!==e&&t){const e=Ue.ExitStatus&&t instanceof Ue.ExitStatus?b:_;"string"==typeof t?e(t):(void 0===t.stack&&(t.stack=(new Error).stack+""),t.message?e(Ue.stringify_as_error_with_stack?Ue.stringify_as_error_with_stack(t.message+"\n"+t.stack):t.message+"\n"+t.stack):e(JSON.stringify(t)))}!Ce&&Pe.config&&(Pe.config.logExitCode?Pe.config.forwardConsoleLogsToWS?R("WASM EXIT "+e):v("WASM EXIT "+e):Pe.config.forwardConsoleLogsToWS&&R())}(t,o),function(e){if(ke&&!Ce&&Pe.config&&Pe.config.appendElementOnExit&&document){const t=document.createElement("label");t.id="tests_done",0!==e&&(t.style.background="red"),t.innerHTML=""+e,document.body.appendChild(t)}}(t))}catch(e){E("mono_exit B failed",e)}Pe.exitCode=t,Pe.exitReason||(Pe.exitReason=o),!Ce&&Ue.runtimeReady&&We.runtimeKeepalivePop()}if(Pe.config&&Pe.config.asyncFlushOnExit&&0===t)throw(async()=>{try{await async function(){try{const e=await import(/*! webpackIgnore: true */"process"),t=e=>new Promise(((t,o)=>{e.on("error",o),e.end("","utf8",t)})),o=t(e.stderr),n=t(e.stdout);let r;const i=new Promise((e=>{r=setTimeout((()=>e("timeout")),1e3)}));await Promise.race([Promise.all([n,o]),i]),clearTimeout(r)}catch(e){_(`flushing std* streams failed: ${e}`)}}()}finally{Ye(t,o)}})(),o;Ye(t,o)}function Ye(e,t){if(Ue.runtimeReady&&Ue.nativeExit)try{Ue.nativeExit(e)}catch(e){!Ue.ExitStatus||e instanceof Ue.ExitStatus||E("set_exit_code_and_quit_now failed: "+e.toString())}if(0!==e||!ke)throw Se&&Ne.process?Ne.process.exit(e):Ue.quit&&Ue.quit(e,t),t}function et(e){ot(e,e.reason,"rejection")}function tt(e){ot(e,e.error,"error")}function ot(e,t,o){e.preventDefault();try{t||(t=new Error("Unhandled "+o)),void 0===t.stack&&(t.stack=(new Error).stack),t.stack=t.stack+"",t.silent||(_("Unhandled error:",t),Xe(1,t))}catch(e){}}!function(e){if($e)throw new Error("Loader module already loaded");$e=!0,Ue=e.runtimeHelpers,Pe=e.loaderHelpers,Me=e.diagnosticHelpers,Le=e.api,Ne=e.internal,Object.assign(Le,{INTERNAL:Ne,invokeLibraryInitializers:be}),Object.assign(e.module,{config:ve(ze,{environmentVariables:{}})});const r={mono_wasm_bindings_is_ready:!1,config:e.module.config,diagnosticTracing:!1,nativeAbort:e=>{throw e||new Error("abort")},nativeExit:e=>{throw new Error("exit:"+e)}},l={gitHash:"89c8f6a112d37d2ea8b77821e56d170a1bccdc5a",config:e.module.config,diagnosticTracing:!1,maxParallelDownloads:16,enableDownloadRetry:!0,_loaded_files:[],loadedFiles:[],loadedAssemblies:[],libraryInitializers:[],workerNextNumber:1,actual_downloaded_assets_count:0,actual_instantiated_assets_count:0,expected_downloaded_assets_count:0,expected_instantiated_assets_count:0,afterConfigLoaded:i(),allDownloadsQueued:i(),allDownloadsFinished:i(),wasmCompilePromise:i(),runtimeModuleLoaded:i(),loadingWorkers:i(),is_exited:Ve,is_runtime_running:qe,assert_runtime_running:He,mono_exit:Xe,createPromiseController:i,getPromiseController:s,assertIsControllablePromise:a,mono_download_assets:oe,resolve_single_asset_path:ee,setup_proxy_console:j,set_thread_prefix:w,installUnhandledErrorHandler:Je,retrieve_asset_download:ie,invokeLibraryInitializers:be,isDebuggingSupported:Te,exceptions:t,simd:n,relaxedSimd:o};Object.assign(Ue,r),Object.assign(Pe,l)}(Fe);let nt,rt,it,st=!1,at=!1;async function lt(e){if(!at){if(at=!0,ke&&Pe.config.forwardConsoleLogsToWS&&void 0!==globalThis.WebSocket&&j("main",globalThis.console,globalThis.location.origin),We||Be(!1,"Null moduleConfig"),Pe.config||Be(!1,"Null moduleConfig.config"),"function"==typeof e){const t=e(Fe.api);if(t.ready)throw new Error("Module.ready couldn't be redefined.");Object.assign(We,t),Ee(We,t)}else{if("object"!=typeof e)throw new Error("Can't use moduleFactory callback of createDotnetRuntime function.");Ee(We,e)}await async function(e){if(Se){const e=await import(/*! webpackIgnore: true */"process"),t=14;if(e.versions.node.split(".")[0]<t)throw new Error(`NodeJS at '${e.execPath}' has too low version '${e.versions.node}', please use at least ${t}. See also https://aka.ms/dotnet-wasm-features`)}const t=/*! webpackIgnore: true */import.meta.url,o=t.indexOf("?");var n;if(o>0&&(Pe.modulesUniqueQuery=t.substring(o)),Pe.scriptUrl=t.replace(/\\/g,"/").replace(/[?#].*/,""),Pe.scriptDirectory=(n=Pe.scriptUrl).slice(0,n.lastIndexOf("/"))+"/",Pe.locateFile=e=>"URL"in globalThis&&globalThis.URL!==C?new URL(e,Pe.scriptDirectory).toString():M(e)?e:Pe.scriptDirectory+e,Pe.fetch_like=k,Pe.out=console.log,Pe.err=console.error,Pe.onDownloadResourceProgress=e.onDownloadResourceProgress,ke&&globalThis.navigator){const e=globalThis.navigator,t=e.userAgentData&&e.userAgentData.brands;t&&t.length>0?Pe.isChromium=t.some((e=>"Google Chrome"===e.brand||"Microsoft Edge"===e.brand||"Chromium"===e.brand)):e.userAgent&&(Pe.isChromium=e.userAgent.includes("Chrome"),Pe.isFirefox=e.userAgent.includes("Firefox"))}Ne.require=Se?await import(/*! webpackIgnore: true */"module").then((e=>e.createRequire(/*! webpackIgnore: true */import.meta.url))):Promise.resolve((()=>{throw new Error("require not supported")})),void 0===globalThis.URL&&(globalThis.URL=C)}(We)}}async function ct(e){return await lt(e),Ze=We.onAbort,Qe=We.onExit,We.onAbort=Ke,We.onExit=Ge,We.ENVIRONMENT_IS_PTHREAD?async function(){(function(){const e=new MessageChannel,t=e.port1,o=e.port2;t.addEventListener("message",(e=>{var n,r;n=JSON.parse(e.data.config),r=JSON.parse(e.data.monoThreadInfo),st?Pe.diagnosticTracing&&b("mono config already received"):(ve(Pe.config,n),Ue.monoThreadInfo=r,xe(),Pe.diagnosticTracing&&b("mono config received"),st=!0,Pe.afterConfigLoaded.promise_control.resolve(Pe.config),ke&&n.forwardConsoleLogsToWS&&void 0!==globalThis.WebSocket&&Pe.setup_proxy_console("worker-idle",console,globalThis.location.origin)),t.close(),o.close()}),{once:!0}),t.start(),self.postMessage({[l]:{monoCmd:"preload",port:o}},[o])})(),await Pe.afterConfigLoaded.promise,function(){const e=Pe.config;e.assets||Be(!1,"config.assets must be defined");for(const t of e.assets)X(t),Q[t.behavior]&&z.push(t)}(),setTimeout((async()=>{try{await oe()}catch(e){Xe(1,e)}}),0);const e=dt(),t=await Promise.all(e);return await ut(t),We}():async function(){var e;await Re(We),re();const t=dt();(async function(){try{const e=ee("dotnetwasm");await se(e),e&&e.pendingDownloadInternal&&e.pendingDownloadInternal.response||Be(!1,"Can't load dotnet.native.wasm");const t=await e.pendingDownloadInternal.response,o=t.headers&&t.headers.get?t.headers.get("Content-Type"):void 0;let n;if("function"==typeof WebAssembly.compileStreaming&&"application/wasm"===o)n=await WebAssembly.compileStreaming(t);else{ke&&"application/wasm"!==o&&E('WebAssembly resource does not have the expected content type "application/wasm", so falling back to slower ArrayBuffer instantiation.');const e=await t.arrayBuffer();Pe.diagnosticTracing&&b("instantiate_wasm_module buffered"),n=Ie?await Promise.resolve(new WebAssembly.Module(e)):await WebAssembly.compile(e)}e.pendingDownloadInternal=null,e.pendingDownload=null,e.buffer=null,e.moduleExports=null,Pe.wasmCompilePromise.promise_control.resolve(n)}catch(e){Pe.wasmCompilePromise.promise_control.reject(e)}})(),setTimeout((async()=>{try{D(),await oe()}catch(e){Xe(1,e)}}),0);const o=await Promise.all(t);return await ut(o),await Ue.dotnetReady.promise,await we(null===(e=Pe.config.resources)||void 0===e?void 0:e.modulesAfterRuntimeReady),await be("onRuntimeReady",[Fe.api]),Le}()}function dt(){const e=ee("js-module-runtime"),t=ee("js-module-native");if(nt&&rt)return[nt,rt,it];"object"==typeof e.moduleExports?nt=e.moduleExports:(Pe.diagnosticTracing&&b(`Attempting to import '${e.resolvedUrl}' for ${e.name}`),nt=import(/*! webpackIgnore: true */e.resolvedUrl)),"object"==typeof t.moduleExports?rt=t.moduleExports:(Pe.diagnosticTracing&&b(`Attempting to import '${t.resolvedUrl}' for ${t.name}`),rt=import(/*! webpackIgnore: true */t.resolvedUrl));const o=Y("js-module-diagnostics");return o&&("object"==typeof o.moduleExports?it=o.moduleExports:(Pe.diagnosticTracing&&b(`Attempting to import '${o.resolvedUrl}' for ${o.name}`),it=import(/*! webpackIgnore: true */o.resolvedUrl))),[nt,rt,it]}async function ut(e){const{initializeExports:t,initializeReplacements:o,configureRuntimeStartup:n,configureEmscriptenStartup:r,configureWorkerStartup:i,setRuntimeGlobals:s,passEmscriptenInternals:a}=e[0],{default:l}=e[1],c=e[2];s(Fe),t(Fe),c&&c.setRuntimeGlobals(Fe),await n(We),Pe.runtimeModuleLoaded.promise_control.resolve(),l((e=>(Object.assign(We,{ready:e.ready,__dotnet_runtime:{initializeReplacements:o,configureEmscriptenStartup:r,configureWorkerStartup:i,passEmscriptenInternals:a}}),We))).catch((e=>{if(e.message&&e.message.toLowerCase().includes("out of memory"))throw new Error(".NET runtime has failed to start, because too much memory was requested. Please decrease the memory by adjusting EmccMaximumHeapSize. See also https://aka.ms/dotnet-wasm-features");throw e}))}const ft=new class{withModuleConfig(e){try{return Ee(We,e),this}catch(e){throw Xe(1,e),e}}withOnConfigLoaded(e){try{return Ee(We,{onConfigLoaded:e}),this}catch(e){throw Xe(1,e),e}}withConsoleForwarding(){try{return ve(ze,{forwardConsoleLogsToWS:!0}),this}catch(e){throw Xe(1,e),e}}withExitOnUnhandledError(){try{return ve(ze,{exitOnUnhandledError:!0}),Je(),this}catch(e){throw Xe(1,e),e}}withAsyncFlushOnExit(){try{return ve(ze,{asyncFlushOnExit:!0}),this}catch(e){throw Xe(1,e),e}}withExitCodeLogging(){try{return ve(ze,{logExitCode:!0}),this}catch(e){throw Xe(1,e),e}}withElementOnExit(){try{return ve(ze,{appendElementOnExit:!0}),this}catch(e){throw Xe(1,e),e}}withInteropCleanupOnExit(){try{return ve(ze,{interopCleanupOnExit:!0}),this}catch(e){throw Xe(1,e),e}}withDumpThreadsOnNonZeroExit(){try{return ve(ze,{dumpThreadsOnNonZeroExit:!0}),this}catch(e){throw Xe(1,e),e}}withWaitingForDebugger(e){try{return ve(ze,{waitForDebugger:e}),this}catch(e){throw Xe(1,e),e}}withInterpreterPgo(e,t){try{return ve(ze,{interpreterPgo:e,interpreterPgoSaveDelay:t}),ze.runtimeOptions?ze.runtimeOptions.push("--interp-pgo-recording"):ze.runtimeOptions=["--interp-pgo-recording"],this}catch(e){throw Xe(1,e),e}}withConfig(e){try{return ve(ze,e),this}catch(e){throw Xe(1,e),e}}withConfigSrc(e){try{return e&&"string"==typeof e||Be(!1,"must be file path or URL"),Ee(We,{configSrc:e}),this}catch(e){throw Xe(1,e),e}}withVirtualWorkingDirectory(e){try{return e&&"string"==typeof e||Be(!1,"must be directory path"),ve(ze,{virtualWorkingDirectory:e}),this}catch(e){throw Xe(1,e),e}}withEnvironmentVariable(e,t){try{const o={};return o[e]=t,ve(ze,{environmentVariables:o}),this}catch(e){throw Xe(1,e),e}}withEnvironmentVariables(e){try{return e&&"object"==typeof e||Be(!1,"must be dictionary object"),ve(ze,{environmentVariables:e}),this}catch(e){throw Xe(1,e),e}}withDiagnosticTracing(e){try{return"boolean"!=typeof e&&Be(!1,"must be boolean"),ve(ze,{diagnosticTracing:e}),this}catch(e){throw Xe(1,e),e}}withDebugging(e){try{return null!=e&&"number"==typeof e||Be(!1,"must be number"),ve(ze,{debugLevel:e}),this}catch(e){throw Xe(1,e),e}}withApplicationArguments(...e){try{return e&&Array.isArray(e)||Be(!1,"must be array of strings"),ve(ze,{applicationArguments:e}),this}catch(e){throw Xe(1,e),e}}withRuntimeOptions(e){try{return e&&Array.isArray(e)||Be(!1,"must be array of strings"),ze.runtimeOptions?ze.runtimeOptions.push(...e):ze.runtimeOptions=e,this}catch(e){throw Xe(1,e),e}}withMainAssembly(e){try{return ve(ze,{mainAssemblyName:e}),this}catch(e){throw Xe(1,e),e}}withApplicationArgumentsFromQuery(){try{if(!globalThis.window)throw new Error("Missing window to the query parameters from");if(void 0===globalThis.URLSearchParams)throw new Error("URLSearchParams is supported");const e=new URLSearchParams(globalThis.window.location.search).getAll("arg");return this.withApplicationArguments(...e)}catch(e){throw Xe(1,e),e}}withApplicationEnvironment(e){try{return ve(ze,{applicationEnvironment:e}),this}catch(e){throw Xe(1,e),e}}withApplicationCulture(e){try{return ve(ze,{applicationCulture:e}),this}catch(e){throw Xe(1,e),e}}withResourceLoader(e){try{return Pe.loadBootResource=e,this}catch(e){throw Xe(1,e),e}}async download(){try{await async function(){lt(We),await Re(We),re(),D(),oe(),await Pe.allDownloadsFinished.promise}()}catch(e){throw Xe(1,e),e}}async create(){try{return this.instance||(this.instance=await async function(){return await ct(We),Fe.api}()),this.instance}catch(e){throw Xe(1,e),e}}async run(){try{return We.config||Be(!1,"Null moduleConfig.config"),this.instance||await this.create(),this.instance.runMainAndExit()}catch(e){throw Xe(1,e),e}}},mt=Xe,gt=ct;Ie||"function"==typeof globalThis.URL||Be(!1,"This browser/engine doesn't support URL API. Please use a modern version. See also https://aka.ms/dotnet-wasm-features"),"function"!=typeof globalThis.BigInt64Array&&Be(!1,"This browser/engine doesn't support BigInt64Array API. Please use a modern version. See also https://aka.ms/dotnet-wasm-features"),ft.withConfig(/*json-start*/{
  "mainAssemblyName": "compiler",
  "applicationEnvironment": "Development",
  "resources": {
    "hash": "sha256-RQMEfa4sJZjBW+TVkkwX7OvlyT/L7bJCec4/sDQal+k=",
    "jsModuleNative": [
      {
        "name": "dotnet.native.98v1chuo8c.js"
      }
    ],
    "jsModuleRuntime": [
      {
        "name": "dotnet.runtime.fn94ls2wwa.js"
      }
    ],
    "wasmNative": [
      {
        "name": "dotnet.native.ggch313emy.wasm",
        "integrity": "sha256-sG8pH2oty+zIEarSlYNdLjF8uAgfueHqHC6BVtWVPg8="
      }
    ],
    "coreAssembly": [
      {
        "virtualPath": "System.Runtime.InteropServices.JavaScript.wasm",
        "name": "System.Runtime.InteropServices.JavaScript.qdrwfg47h5.wasm",
        "integrity": "sha256-ngFn74a3Dx8pZxahoFHJreh62odKJmJcskblmx1dzt0="
      },
      {
        "virtualPath": "System.Private.CoreLib.wasm",
        "name": "System.Private.CoreLib.yuhfhvrgwa.wasm",
        "integrity": "sha256-1roUOG37q1KQ4bSbBCE2akHq7EW6I8RzvBqcxZf+/zI="
      }
    ],
    "assembly": [
      {
        "virtualPath": "Humanizer.wasm",
        "name": "Humanizer.oqup3v7t3k.wasm",
        "integrity": "sha256-4NbSboZzzP9nikRtXapUZNzOyITt7ht9TNqCIQHr5OE="
      },
      {
        "virtualPath": "Microsoft.Bcl.AsyncInterfaces.wasm",
        "name": "Microsoft.Bcl.AsyncInterfaces.g7taf4i69y.wasm",
        "integrity": "sha256-XFFoqe7LBB1xxAfTIFAs+O2Qot1eLoxpGAfsYYZJJ/o="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.wasm",
        "name": "Microsoft.CodeAnalysis.kpjgxy86t6.wasm",
        "integrity": "sha256-yFB2pIa2byV3TrRzKx8sZMf9diT4CLls+UHRXPpzgew="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.CSharp.wasm",
        "name": "Microsoft.CodeAnalysis.CSharp.spyk6zagzf.wasm",
        "integrity": "sha256-wL7WJvjnoNxQLq7zuL8jTfh74XusEIsa6TS761YhJfM="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.wasm",
        "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.emud6oo046.wasm",
        "integrity": "sha256-RoKohOXHz0EIVOoJQVkCbEzGgFfsWefMTDGLMgAAfxA="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.wasm",
        "name": "Microsoft.CodeAnalysis.VisualBasic.jf8omzzmf7.wasm",
        "integrity": "sha256-Uc3y3xHi5a3ONC0aUvbDEg1L1orocMIiY8CSrWoU8sw="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.wasm",
        "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.y9pmeckjso.wasm",
        "integrity": "sha256-ilgh5yIWZLHaPvm8F8o/B600EKrVAlXroU077EtEF2k="
      },
      {
        "virtualPath": "Microsoft.CodeAnalysis.Workspaces.wasm",
        "name": "Microsoft.CodeAnalysis.Workspaces.zkqto69bm6.wasm",
        "integrity": "sha256-LZQxuyPt5rC5a/nO20LEWWEruRWlWyE9GN848Ud/bh0="
      },
      {
        "virtualPath": "Microsoft.JSInterop.wasm",
        "name": "Microsoft.JSInterop.kksrzpvoig.wasm",
        "integrity": "sha256-ZMDJB7HAUuoLzQZRYnLkvVVaR0Aqx1O070OL2H0APzs="
      },
      {
        "virtualPath": "Microsoft.JSInterop.WebAssembly.wasm",
        "name": "Microsoft.JSInterop.WebAssembly.9udcqny0aq.wasm",
        "integrity": "sha256-EQfaQose2do/RGDJFP6YWTTeOWA2gufnJurZZZh2XLU="
      },
      {
        "virtualPath": "System.Composition.AttributedModel.wasm",
        "name": "System.Composition.AttributedModel.xjif02d2is.wasm",
        "integrity": "sha256-U1z94xgywn6hkn/QrGir0aAnxKs7nfoDKlBhV19H2TM="
      },
      {
        "virtualPath": "System.Composition.Convention.wasm",
        "name": "System.Composition.Convention.jf1zeek5hf.wasm",
        "integrity": "sha256-AciZSrESYwC4KU2/d9UJqwTgDDmOQA5hpmg50sDqHac="
      },
      {
        "virtualPath": "System.Composition.Hosting.wasm",
        "name": "System.Composition.Hosting.e34d2g66uz.wasm",
        "integrity": "sha256-+rdwoU5P89ph2WqlaceKN8T/2juughU2SDidAHby32w="
      },
      {
        "virtualPath": "System.Composition.Runtime.wasm",
        "name": "System.Composition.Runtime.ccm13dk3fm.wasm",
        "integrity": "sha256-XF6nJ73dlc5VZe2GKAWby/hyvuaCrzuPZe8nHg2pJ/Q="
      },
      {
        "virtualPath": "System.Composition.TypedParts.wasm",
        "name": "System.Composition.TypedParts.oz2ut0mn5s.wasm",
        "integrity": "sha256-pMd0NDsJG6d31aN31kU1bpOuZDEG7RaYleALWz38k98="
      },
      {
        "virtualPath": "System.Text.Json.wasm",
        "name": "System.Text.Json.9zeefb9ryb.wasm",
        "integrity": "sha256-VQ7Wlb7okzFLdwt0fritW/eYDMOPWlsKMDvOropu7jY="
      },
      {
        "virtualPath": "WebAssembly.wasm",
        "name": "WebAssembly.80zcn45hvr.wasm",
        "integrity": "sha256-yCzmrGzacnOCgQm+JtucdzQaax1unfTADXjE/d0pIvU="
      },
      {
        "virtualPath": "Microsoft.CSharp.wasm",
        "name": "Microsoft.CSharp.7ekt55vmkb.wasm",
        "integrity": "sha256-gSrJuNU0Z1fkUOE58H4IwN7xfe2EG5T3ah9E5ErzwGE="
      },
      {
        "virtualPath": "Microsoft.VisualBasic.Core.wasm",
        "name": "Microsoft.VisualBasic.Core.zzakt1dc79.wasm",
        "integrity": "sha256-UdqlREks2BDwPKksetvq1rG2f2gPheTBCWTLyRNHG0s="
      },
      {
        "virtualPath": "Microsoft.VisualBasic.wasm",
        "name": "Microsoft.VisualBasic.cwtwp129w5.wasm",
        "integrity": "sha256-pONqyNvNp4bcPaa/UwKjpPOH2X7yCP/HBRvyLyIGvRc="
      },
      {
        "virtualPath": "Microsoft.Win32.Primitives.wasm",
        "name": "Microsoft.Win32.Primitives.s7f1whhxfh.wasm",
        "integrity": "sha256-SFeTzxMLHH0r/W7YEnuD7pJYjvk1ANM4uG8sLT9ULm0="
      },
      {
        "virtualPath": "Microsoft.Win32.Registry.wasm",
        "name": "Microsoft.Win32.Registry.zfmdhc8y2i.wasm",
        "integrity": "sha256-IeyL54ZEyWmymiNgynWLF2RJP9WjcC3LWWJyAUUphoY="
      },
      {
        "virtualPath": "System.AppContext.wasm",
        "name": "System.AppContext.3uz9m7wog7.wasm",
        "integrity": "sha256-q2/JgtD4GNRaGd477N1N8TukJ2CeuGqUL+IJ6YonMqM="
      },
      {
        "virtualPath": "System.Buffers.wasm",
        "name": "System.Buffers.cddvx78kj1.wasm",
        "integrity": "sha256-cBLrgGCJNSUwzLgFZHQbZmC8AFQ7DEfFBKdOYJcLaYk="
      },
      {
        "virtualPath": "System.Collections.Concurrent.wasm",
        "name": "System.Collections.Concurrent.edgv89fov9.wasm",
        "integrity": "sha256-oiAO39vj7FsEjGH6/wMkUJJD1YDNEBcfD8n0Vsi/I7o="
      },
      {
        "virtualPath": "System.Collections.Immutable.wasm",
        "name": "System.Collections.Immutable.und9kn5ybq.wasm",
        "integrity": "sha256-ljJhYI9ymjjjV5LRHGbz0RE10Kb5FtAS0bAZagDmlDU="
      },
      {
        "virtualPath": "System.Collections.NonGeneric.wasm",
        "name": "System.Collections.NonGeneric.sd9wcwxi2j.wasm",
        "integrity": "sha256-gGzh70oolcaW0d4iRa19MsSy0qGww/9uwaqmOTF9a18="
      },
      {
        "virtualPath": "System.Collections.Specialized.wasm",
        "name": "System.Collections.Specialized.817ki6vscu.wasm",
        "integrity": "sha256-ZIU+eD6+wwXySm86ityiciBOxJNsd+JNp1ln01Yv5FM="
      },
      {
        "virtualPath": "System.Collections.wasm",
        "name": "System.Collections.g2jg0g9zhy.wasm",
        "integrity": "sha256-iFSp4xT69pkt2Q0kcBP0/jWlEgfN8ilqdWnJJQuMsPc="
      },
      {
        "virtualPath": "System.ComponentModel.Annotations.wasm",
        "name": "System.ComponentModel.Annotations.horu6w69pm.wasm",
        "integrity": "sha256-XzKQyLRqVcvKGfQxAroZU0SMheSBpRzsumrt9rUxud8="
      },
      {
        "virtualPath": "System.ComponentModel.DataAnnotations.wasm",
        "name": "System.ComponentModel.DataAnnotations.0qkokb4tbp.wasm",
        "integrity": "sha256-GGHwZ8y2N6q3xCzX9IZVB/HoV/b2x7wjNvLF1OvzSTY="
      },
      {
        "virtualPath": "System.ComponentModel.EventBasedAsync.wasm",
        "name": "System.ComponentModel.EventBasedAsync.nqotb9qqdz.wasm",
        "integrity": "sha256-f/Gho+DTXu8G4j5esfmpYFvJWu48U8+xw4brIWmVPMc="
      },
      {
        "virtualPath": "System.ComponentModel.Primitives.wasm",
        "name": "System.ComponentModel.Primitives.30agiordrd.wasm",
        "integrity": "sha256-ozhHf4xPHLIfCJttiBB3qU4wAs4OV2UxABGd2OEKREs="
      },
      {
        "virtualPath": "System.ComponentModel.TypeConverter.wasm",
        "name": "System.ComponentModel.TypeConverter.yqedqr26h6.wasm",
        "integrity": "sha256-6tEP6EvZYZ0TDb7SZpjXGnQWeWVFm7uBTtWfC0bYrrs="
      },
      {
        "virtualPath": "System.ComponentModel.wasm",
        "name": "System.ComponentModel.52va30zlt7.wasm",
        "integrity": "sha256-vQ7IVezOF7dCFCJ33tqH57pS8HePg6IVRWQ35/yXU2A="
      },
      {
        "virtualPath": "System.Configuration.wasm",
        "name": "System.Configuration.bu3aho8brh.wasm",
        "integrity": "sha256-DX3Bf82jXM7YLJ7abqUPXEg18gWEt2CdGxNkZGNxD8c="
      },
      {
        "virtualPath": "System.Console.wasm",
        "name": "System.Console.0ipqlt2gwg.wasm",
        "integrity": "sha256-mOyDt5x+iKoJdBlHGt/kGJ4KUqJ03m2Syy+dzABOBdM="
      },
      {
        "virtualPath": "System.Core.wasm",
        "name": "System.Core.44yafkcomb.wasm",
        "integrity": "sha256-NMq5N8H+RghiGk/nfHt4CmAQ2kqcRa0PWK3QJioTwmw="
      },
      {
        "virtualPath": "System.Data.Common.wasm",
        "name": "System.Data.Common.k2irgufjk7.wasm",
        "integrity": "sha256-PIx9AOx95Fw3iHPnWis+I4CP7Q8ql8qj9577kF/Vwck="
      },
      {
        "virtualPath": "System.Data.DataSetExtensions.wasm",
        "name": "System.Data.DataSetExtensions.zotfqnq91v.wasm",
        "integrity": "sha256-Ezrv7hvr/jBL4NYZvTozyUOv9QR0nkhakGZzvOfIXZA="
      },
      {
        "virtualPath": "System.Data.wasm",
        "name": "System.Data.orhqx3to6n.wasm",
        "integrity": "sha256-dFl9FQV3zhMLpMPpe4cQ4BKordXySDRAFq4r+sxZ6Uc="
      },
      {
        "virtualPath": "System.Diagnostics.Contracts.wasm",
        "name": "System.Diagnostics.Contracts.aqgf5r12ov.wasm",
        "integrity": "sha256-cgNqKfGrSqtkgi43UxaZ1WvcU7W7JI3LSHcPvOQO2t8="
      },
      {
        "virtualPath": "System.Diagnostics.Debug.wasm",
        "name": "System.Diagnostics.Debug.f73k8z9qa4.wasm",
        "integrity": "sha256-xS4soeTlZduZ3RRdlw3dwwZQT6vpzMYLzmWE5Uf/Sx0="
      },
      {
        "virtualPath": "System.Diagnostics.DiagnosticSource.wasm",
        "name": "System.Diagnostics.DiagnosticSource.yo016xkv91.wasm",
        "integrity": "sha256-wqPNSMrVVBURk49PpU1sxQBY4uZOhVkRb5698rMQPvg="
      },
      {
        "virtualPath": "System.Diagnostics.FileVersionInfo.wasm",
        "name": "System.Diagnostics.FileVersionInfo.wlwt87jjkp.wasm",
        "integrity": "sha256-rEHuAoDk1A6h9om8iNlhbkmnCWnwzJ95gmm0txZ1Elw="
      },
      {
        "virtualPath": "System.Diagnostics.Process.wasm",
        "name": "System.Diagnostics.Process.i456bnlijd.wasm",
        "integrity": "sha256-jil5CdOgrLHhbS1NrI0wvstzo7k8hFECZQ+Dmz2TS8Q="
      },
      {
        "virtualPath": "System.Diagnostics.StackTrace.wasm",
        "name": "System.Diagnostics.StackTrace.mikg0u5yb2.wasm",
        "integrity": "sha256-IiyicciVYk+iONewG6JYMQmQM1TRN6KyHrSdea8TDAE="
      },
      {
        "virtualPath": "System.Diagnostics.TextWriterTraceListener.wasm",
        "name": "System.Diagnostics.TextWriterTraceListener.y1gptvixga.wasm",
        "integrity": "sha256-hpaABsegLM06SqXEJHYMKQ6/yS1QRPn90nJCmY6U8jA="
      },
      {
        "virtualPath": "System.Diagnostics.Tools.wasm",
        "name": "System.Diagnostics.Tools.fjetqio2d3.wasm",
        "integrity": "sha256-29B90UJT6RAURapkyZoMDx7a/7n9WUUp4tpzfF+2eUk="
      },
      {
        "virtualPath": "System.Diagnostics.TraceSource.wasm",
        "name": "System.Diagnostics.TraceSource.fmv8wtirqr.wasm",
        "integrity": "sha256-F+bURdehxF4knyn8ZeOWNXElgWu1YOFKNNoovbI5/6c="
      },
      {
        "virtualPath": "System.Diagnostics.Tracing.wasm",
        "name": "System.Diagnostics.Tracing.mkbvxd0fsj.wasm",
        "integrity": "sha256-qt6TQlvR8tbNnYUYe8iWDIUuKgG32cvpYoKPQqooQuQ="
      },
      {
        "virtualPath": "System.Drawing.Primitives.wasm",
        "name": "System.Drawing.Primitives.a8jiglxmp7.wasm",
        "integrity": "sha256-2kUWJPofUUotRFOFzcfNdASXJQy/ijTKBGjXGL1GoZE="
      },
      {
        "virtualPath": "System.Drawing.wasm",
        "name": "System.Drawing.upww3v3fe2.wasm",
        "integrity": "sha256-XuM42F8/0M3ov7huuw1nBtdHBm6GFlGtUoQuMg3UG5w="
      },
      {
        "virtualPath": "System.Dynamic.Runtime.wasm",
        "name": "System.Dynamic.Runtime.shys22cnm7.wasm",
        "integrity": "sha256-YFjkWNUN5Q24rVNKszXXK2hS9xjHz4mEx4Qe3UdsbAg="
      },
      {
        "virtualPath": "System.Formats.Asn1.wasm",
        "name": "System.Formats.Asn1.fdygfqarnw.wasm",
        "integrity": "sha256-/XYAtsdyVWvjuCVJsHQGq6vjrKFEPOabocuoHk5lWHM="
      },
      {
        "virtualPath": "System.Formats.Tar.wasm",
        "name": "System.Formats.Tar.p0loft40fm.wasm",
        "integrity": "sha256-acNJbKIAxpEjl6Op2CtCod9uHk4jjTNoDITuz1YmmmU="
      },
      {
        "virtualPath": "System.Globalization.Calendars.wasm",
        "name": "System.Globalization.Calendars.3a0r2lvbjz.wasm",
        "integrity": "sha256-K6C03b0MwW9tFeZBuNuOS6/cc0rigRhaAKiNZSKw/tQ="
      },
      {
        "virtualPath": "System.Globalization.Extensions.wasm",
        "name": "System.Globalization.Extensions.9fvcdfsc79.wasm",
        "integrity": "sha256-FbMxJ0xybWF+JFv/Xp+Rp8vGXu7h06a/B1Qq+zLYvrE="
      },
      {
        "virtualPath": "System.Globalization.wasm",
        "name": "System.Globalization.j9hp0z3uut.wasm",
        "integrity": "sha256-pz/hPzfm7UhEeVc2nBOKu1HDc9LItqmjO3rKkwOZYbc="
      },
      {
        "virtualPath": "System.IO.Compression.Brotli.wasm",
        "name": "System.IO.Compression.Brotli.b19nlei11r.wasm",
        "integrity": "sha256-fxr6gaWY+PFcxrHvubWv/GS1gGZ24MsBS4jkJBwKh+g="
      },
      {
        "virtualPath": "System.IO.Compression.FileSystem.wasm",
        "name": "System.IO.Compression.FileSystem.xokj0hkzdz.wasm",
        "integrity": "sha256-gdMLuffj1VxBN6mTBm8c5eT9rUkMMlZxJkXDC+e2sJE="
      },
      {
        "virtualPath": "System.IO.Compression.ZipFile.wasm",
        "name": "System.IO.Compression.ZipFile.n6fry1pr3p.wasm",
        "integrity": "sha256-n9tV4BF+c61LNDwDgsMV4CSdRlQZsC8QnIToglSZFfM="
      },
      {
        "virtualPath": "System.IO.Compression.wasm",
        "name": "System.IO.Compression.or6fsr5skv.wasm",
        "integrity": "sha256-BAiyzxk5r2Ndz16EHJ1Pa8uwJAB7m60CtbOmCdDMDsM="
      },
      {
        "virtualPath": "System.IO.FileSystem.AccessControl.wasm",
        "name": "System.IO.FileSystem.AccessControl.hmsaw8htm9.wasm",
        "integrity": "sha256-aT+YYcNQ+Yh9mQvBOM8s6jRJOPgBexAQcWTj42RJ/wQ="
      },
      {
        "virtualPath": "System.IO.FileSystem.DriveInfo.wasm",
        "name": "System.IO.FileSystem.DriveInfo.o326txysij.wasm",
        "integrity": "sha256-3C6YPlLD6J3QuMqd14PB5WmGBRnVvV7wOs1n4RGd5Oo="
      },
      {
        "virtualPath": "System.IO.FileSystem.Primitives.wasm",
        "name": "System.IO.FileSystem.Primitives.eb2dm6xdj5.wasm",
        "integrity": "sha256-+kruBHKysrF22mQafKMCvIL3HePiPIbn1plZFY8zRuE="
      },
      {
        "virtualPath": "System.IO.FileSystem.Watcher.wasm",
        "name": "System.IO.FileSystem.Watcher.9cfcfdtgco.wasm",
        "integrity": "sha256-qWuo98hEbb4jQXMWjgQJypY12CdkLCCrPoNPSAoodlo="
      },
      {
        "virtualPath": "System.IO.FileSystem.wasm",
        "name": "System.IO.FileSystem.qjtfcwd9yc.wasm",
        "integrity": "sha256-Vl+Zl7GI/OJPT1ca4Dvkil12W2QkB/xSXdL1lioHTmQ="
      },
      {
        "virtualPath": "System.IO.IsolatedStorage.wasm",
        "name": "System.IO.IsolatedStorage.1sincb3daz.wasm",
        "integrity": "sha256-Lzm6aF+wVRfNEn/uhr9vj5F/BK7Z1JvhrqIkbeJ5NeA="
      },
      {
        "virtualPath": "System.IO.MemoryMappedFiles.wasm",
        "name": "System.IO.MemoryMappedFiles.yb053b8huo.wasm",
        "integrity": "sha256-7j++Hp8rhzw9VyGhlP1PlxswSqzEfehOGiRay5jTWDs="
      },
      {
        "virtualPath": "System.IO.Pipelines.wasm",
        "name": "System.IO.Pipelines.4tds854z1t.wasm",
        "integrity": "sha256-GI+l8Upumfyw6Wp0aA23e2hmpEOAUu99EwPyukotn/I="
      },
      {
        "virtualPath": "System.IO.Pipes.AccessControl.wasm",
        "name": "System.IO.Pipes.AccessControl.tnzx94emdm.wasm",
        "integrity": "sha256-NzSlXc+TDsKM+Hwf7utPDeqXRIl5OtPufiaJahRwlXc="
      },
      {
        "virtualPath": "System.IO.Pipes.wasm",
        "name": "System.IO.Pipes.0age66bi3g.wasm",
        "integrity": "sha256-6BedlJhpguF2VW6x8nrSkDsVsLnUNKxp7Pfv2DQQ2GE="
      },
      {
        "virtualPath": "System.IO.UnmanagedMemoryStream.wasm",
        "name": "System.IO.UnmanagedMemoryStream.t5u18r4nwy.wasm",
        "integrity": "sha256-8aL5s7UVy/wCPRuLHQcOUspwbgYxs5g90QWqo6sAC5o="
      },
      {
        "virtualPath": "System.IO.wasm",
        "name": "System.IO.w9oqr5rgy0.wasm",
        "integrity": "sha256-nCP3k2MWCXmlBE+9eV8rXVMxYksgFiNZgO+uVUq8itI="
      },
      {
        "virtualPath": "System.Linq.AsyncEnumerable.wasm",
        "name": "System.Linq.AsyncEnumerable.rawtdu84rh.wasm",
        "integrity": "sha256-PdJd/IlDwInW0VwVDre3aKuaFnqFYrr+Vpacso0mdC0="
      },
      {
        "virtualPath": "System.Linq.Expressions.wasm",
        "name": "System.Linq.Expressions.f9w577zkbu.wasm",
        "integrity": "sha256-k0UB5pTNDORquriYfX5E25D4L98QrlQO5WLEW8QlHK4="
      },
      {
        "virtualPath": "System.Linq.Parallel.wasm",
        "name": "System.Linq.Parallel.mh1ea8vhqs.wasm",
        "integrity": "sha256-Cpkuwa3eDmY8N+vO7A4K2Z3Ph54NbB3tTccgA5fG9kY="
      },
      {
        "virtualPath": "System.Linq.Queryable.wasm",
        "name": "System.Linq.Queryable.91gb3f3uq1.wasm",
        "integrity": "sha256-E6s0mKJnf5PuAlmcLnF5iN0UgL9i5DSavuxtFgZR2kY="
      },
      {
        "virtualPath": "System.Linq.wasm",
        "name": "System.Linq.h64rvye1fy.wasm",
        "integrity": "sha256-6bTPl0kBUF8yUXU68jeiH3h1jAhxNURe9padSI8T2WY="
      },
      {
        "virtualPath": "System.Memory.wasm",
        "name": "System.Memory.40g2cm90wo.wasm",
        "integrity": "sha256-fA5JdkYOwy2L9tuo8SrHfRnwYYg739ArPYQzvvxLDIk="
      },
      {
        "virtualPath": "System.Net.Http.Json.wasm",
        "name": "System.Net.Http.Json.d62150zi6n.wasm",
        "integrity": "sha256-RZYCrwmOGz0drrr0d6nxGyTmfkKqatefnsa7A4UhfFo="
      },
      {
        "virtualPath": "System.Net.Http.wasm",
        "name": "System.Net.Http.z5sttdveou.wasm",
        "integrity": "sha256-KcvOK2xhOP/N5I0eBN+Cb37fAodCMUNC9cL0qbRfUvw="
      },
      {
        "virtualPath": "System.Net.HttpListener.wasm",
        "name": "System.Net.HttpListener.ud5vbkz84i.wasm",
        "integrity": "sha256-/uctGjUzbQidLC65abR2afHyKJCsUyFesvdBbM8yGMY="
      },
      {
        "virtualPath": "System.Net.Mail.wasm",
        "name": "System.Net.Mail.zqd1eyera1.wasm",
        "integrity": "sha256-2zHDh8PvPqA4Dy2nMhvDdWwRXnXk6RZ4kXuoYYJtweM="
      },
      {
        "virtualPath": "System.Net.NameResolution.wasm",
        "name": "System.Net.NameResolution.ty9uohols3.wasm",
        "integrity": "sha256-9UmOvk6k1/wFdrGon2VV0y0oLIyMV3ccDpiFGnQRejg="
      },
      {
        "virtualPath": "System.Net.NetworkInformation.wasm",
        "name": "System.Net.NetworkInformation.w7ueh7suju.wasm",
        "integrity": "sha256-hAIbDa+0nZWvDhdNSdqNWxlnlzjaihVtu38QCBDA7gc="
      },
      {
        "virtualPath": "System.Net.Ping.wasm",
        "name": "System.Net.Ping.nooey5sp8o.wasm",
        "integrity": "sha256-dwrp0zf9Rv9oI/88zddSo8Rx8EsbNmfxzFqe616e6QU="
      },
      {
        "virtualPath": "System.Net.Primitives.wasm",
        "name": "System.Net.Primitives.u3mnc891g3.wasm",
        "integrity": "sha256-qkvbeXclcTZVKJi3/m2DEMHtEbZYEuwnfKitmY1rDeA="
      },
      {
        "virtualPath": "System.Net.Quic.wasm",
        "name": "System.Net.Quic.orqtp31i91.wasm",
        "integrity": "sha256-xGEiEK1Sr6ADbzO0/Yc2TYL4MPuVkbtXOGB6gxHrw4o="
      },
      {
        "virtualPath": "System.Net.Requests.wasm",
        "name": "System.Net.Requests.apiuj4yhw5.wasm",
        "integrity": "sha256-Lp0t5h+MEoVEVzkihX9M9sLa0dU9FAiN0XjZPKYB4BI="
      },
      {
        "virtualPath": "System.Net.Security.wasm",
        "name": "System.Net.Security.54z2i82u3f.wasm",
        "integrity": "sha256-u88CTdxsSBeo2dPFNj6nmTLZYbmZ5DQQF99bw/Pu+Zo="
      },
      {
        "virtualPath": "System.Net.ServerSentEvents.wasm",
        "name": "System.Net.ServerSentEvents.d5cn8qc62i.wasm",
        "integrity": "sha256-QY1Wk0kIWjxIna2fqvrSZA8+h0bj1uqN6YNrDRSzWaY="
      },
      {
        "virtualPath": "System.Net.ServicePoint.wasm",
        "name": "System.Net.ServicePoint.2d0ew5hnae.wasm",
        "integrity": "sha256-quKijwi28O6vWHiHZFODSrnH8Iuqb6Z1o0n+SQcAAgc="
      },
      {
        "virtualPath": "System.Net.Sockets.wasm",
        "name": "System.Net.Sockets.gy9hprr2aq.wasm",
        "integrity": "sha256-WH7uDiMaqjui0cNQpn0oolet+/CvCMqfIsqbvVKtGpg="
      },
      {
        "virtualPath": "System.Net.WebClient.wasm",
        "name": "System.Net.WebClient.kk1mvyjt06.wasm",
        "integrity": "sha256-dGgXWtqsb701yFrhX0JwQVj7I1t5C1/qpLdSTafOdF4="
      },
      {
        "virtualPath": "System.Net.WebHeaderCollection.wasm",
        "name": "System.Net.WebHeaderCollection.2qa3xk0q6f.wasm",
        "integrity": "sha256-CmpJMb281EtXTJS8mBHWtmYLemFplGR+YT1dDEXnLsU="
      },
      {
        "virtualPath": "System.Net.WebProxy.wasm",
        "name": "System.Net.WebProxy.c56pnyow6u.wasm",
        "integrity": "sha256-oFXnGGlpksbtigN0S2/TkWjtiGUnhK1ZHo/zhtxdBV0="
      },
      {
        "virtualPath": "System.Net.WebSockets.Client.wasm",
        "name": "System.Net.WebSockets.Client.t9xu7z5r7d.wasm",
        "integrity": "sha256-8ebEABwB9OgnI+Pp2U6fmmXtVC1IaUxWs8yfzt7gIf8="
      },
      {
        "virtualPath": "System.Net.WebSockets.wasm",
        "name": "System.Net.WebSockets.4p0it930z5.wasm",
        "integrity": "sha256-+Pq31tJBAAShJLVyfNLUBtdhToA2Cp8XfCXQghXuHxU="
      },
      {
        "virtualPath": "System.Net.wasm",
        "name": "System.Net.we8ykxbpfo.wasm",
        "integrity": "sha256-GAcxbKLzYTwRKfgBFPrMhlnqt6R5gLbPtPGv4XFc89A="
      },
      {
        "virtualPath": "System.Numerics.Vectors.wasm",
        "name": "System.Numerics.Vectors.fo1cmp7ir1.wasm",
        "integrity": "sha256-gaIA9/5T44ya1ZSyRU065VXEygWrAry1ISujMBaZCGU="
      },
      {
        "virtualPath": "System.Numerics.wasm",
        "name": "System.Numerics.xk08lzt881.wasm",
        "integrity": "sha256-8SXnvEQcWRs26KJYIj6zJnhAg2U8jXr7rkDCQgzsfE4="
      },
      {
        "virtualPath": "System.ObjectModel.wasm",
        "name": "System.ObjectModel.e532zojf7h.wasm",
        "integrity": "sha256-jjAfY0x8SiaZhlP7ubJNPtXFIwuG2xr3yFsKrA7rwM8="
      },
      {
        "virtualPath": "System.Private.DataContractSerialization.wasm",
        "name": "System.Private.DataContractSerialization.x8w77inhqa.wasm",
        "integrity": "sha256-AT4XhV23psdbfuh3tUSiXtf+zdEihieXcxkjPWBdAnc="
      },
      {
        "virtualPath": "System.Private.Uri.wasm",
        "name": "System.Private.Uri.k4mqmij3mb.wasm",
        "integrity": "sha256-hEDhIQKqjI0ouFsXOrir6pGyFQf37ENNSjFAvzm+VBI="
      },
      {
        "virtualPath": "System.Private.Xml.Linq.wasm",
        "name": "System.Private.Xml.Linq.m3jn5xtv79.wasm",
        "integrity": "sha256-jmaWg8sBmEuCfav1T05alz6k1bpsKDJp5EDBGjLOxPw="
      },
      {
        "virtualPath": "System.Private.Xml.wasm",
        "name": "System.Private.Xml.6dtrj9zs2g.wasm",
        "integrity": "sha256-lksVavHYYE2lpmSddCDIw+O7LLX94fmx6kiUXEQWNm8="
      },
      {
        "virtualPath": "System.Reflection.DispatchProxy.wasm",
        "name": "System.Reflection.DispatchProxy.96yvftwre0.wasm",
        "integrity": "sha256-P34jdZBi1PTet/VkW7DYSpNiN++aZfvCa4Q/Mk0oid4="
      },
      {
        "virtualPath": "System.Reflection.Emit.ILGeneration.wasm",
        "name": "System.Reflection.Emit.ILGeneration.797kqbp1u6.wasm",
        "integrity": "sha256-u5fqdNUCT0QuiHZbLdgF4VlGlPGqGKmZy48GHfaRj/E="
      },
      {
        "virtualPath": "System.Reflection.Emit.Lightweight.wasm",
        "name": "System.Reflection.Emit.Lightweight.5r781nvogg.wasm",
        "integrity": "sha256-v9kSxcQ32HCliDS3l7BobzaCgk5wIeFb3kcB6I56KSQ="
      },
      {
        "virtualPath": "System.Reflection.Emit.wasm",
        "name": "System.Reflection.Emit.ylln6nmq4d.wasm",
        "integrity": "sha256-2tDaijCrKYmQvC+j1WPQjM++7+gS5xw265QpSLoICTQ="
      },
      {
        "virtualPath": "System.Reflection.Extensions.wasm",
        "name": "System.Reflection.Extensions.pfdhnbr3gu.wasm",
        "integrity": "sha256-u663zwxTg96Rq8/hKhL0gdyQnrJCZ5BvHgDK2n5+/L8="
      },
      {
        "virtualPath": "System.Reflection.Metadata.wasm",
        "name": "System.Reflection.Metadata.hiwljei8qp.wasm",
        "integrity": "sha256-2aKa2yR1ib4JFkl29Q6fBOzpkCL5o+dqcP0zsXfhzno="
      },
      {
        "virtualPath": "System.Reflection.Primitives.wasm",
        "name": "System.Reflection.Primitives.iq7p4cmw98.wasm",
        "integrity": "sha256-aodkDxuRQRAPamsqQgiz337qqHL7LC19u6eiYGRis6A="
      },
      {
        "virtualPath": "System.Reflection.TypeExtensions.wasm",
        "name": "System.Reflection.TypeExtensions.1pgdbmbciq.wasm",
        "integrity": "sha256-O7fHyCcveT/QQ/xmqupziIk5W313WiEEb3DGrWFJCiw="
      },
      {
        "virtualPath": "System.Reflection.wasm",
        "name": "System.Reflection.kv9w77rzcx.wasm",
        "integrity": "sha256-ALORExJMjCOY2epP2CLWaw6/pFIHR7sWoYywwNwHiR0="
      },
      {
        "virtualPath": "System.Resources.Reader.wasm",
        "name": "System.Resources.Reader.k3n9n2hrpi.wasm",
        "integrity": "sha256-0JO0xJ7+yxflaN52eQHH27qkWwE0fCXa1fBFnetJ4ec="
      },
      {
        "virtualPath": "System.Resources.ResourceManager.wasm",
        "name": "System.Resources.ResourceManager.dxk8hkn0pd.wasm",
        "integrity": "sha256-D/OpryB13Nm97EVSWIL6M55SPbmD560dPh4XEABDcEw="
      },
      {
        "virtualPath": "System.Resources.Writer.wasm",
        "name": "System.Resources.Writer.8gzd09mf6r.wasm",
        "integrity": "sha256-SCejdWnz6/yT7ZUjIaRfGIBYwm9DJY+qTStKuqJ2hsw="
      },
      {
        "virtualPath": "System.Runtime.CompilerServices.Unsafe.wasm",
        "name": "System.Runtime.CompilerServices.Unsafe.9hdemd1zg6.wasm",
        "integrity": "sha256-Q8qNzH66XJbGtl8LGbq+zeNlwAk9/o6oJN5cb1VQ6Zo="
      },
      {
        "virtualPath": "System.Runtime.CompilerServices.VisualC.wasm",
        "name": "System.Runtime.CompilerServices.VisualC.u486nooeyj.wasm",
        "integrity": "sha256-UroPGyhrh7rDMhLOXbXL7qYjrEwTbNMkEMAiGJqxzq0="
      },
      {
        "virtualPath": "System.Runtime.Extensions.wasm",
        "name": "System.Runtime.Extensions.dgcev1x2j5.wasm",
        "integrity": "sha256-cxacPTFFhuqoI8UhgJYB/WRXFRCsUoG2oOmiKjoLIHQ="
      },
      {
        "virtualPath": "System.Runtime.Handles.wasm",
        "name": "System.Runtime.Handles.x8t76h9iqc.wasm",
        "integrity": "sha256-0UlG8Kruv7VBVfofFetb+GOL9f4f3LZhPX9V6+u4Riw="
      },
      {
        "virtualPath": "System.Runtime.InteropServices.RuntimeInformation.wasm",
        "name": "System.Runtime.InteropServices.RuntimeInformation.6x46xl0fkw.wasm",
        "integrity": "sha256-lqwkxy/rl7HuHiGSVfyuOXyj5jiFdQn1VXYbrAR+QP0="
      },
      {
        "virtualPath": "System.Runtime.InteropServices.wasm",
        "name": "System.Runtime.InteropServices.yvih4tdwds.wasm",
        "integrity": "sha256-3mHwFke8IS1qJd5S9tmIJSm6bDX0ZhTBeXDoTzhNlOk="
      },
      {
        "virtualPath": "System.Runtime.Intrinsics.wasm",
        "name": "System.Runtime.Intrinsics.wpzyysvog0.wasm",
        "integrity": "sha256-rNT841huhgL+y/t6LkKXzSZO2k6B5jywKJHbLVv18ys="
      },
      {
        "virtualPath": "System.Runtime.Loader.wasm",
        "name": "System.Runtime.Loader.1mwm1bgjgj.wasm",
        "integrity": "sha256-Z0S1WuTMoQ6XPHOMC9bU7ruuWmAag8ou92+cJ1yaLsQ="
      },
      {
        "virtualPath": "System.Runtime.Numerics.wasm",
        "name": "System.Runtime.Numerics.fhvyz5x2g6.wasm",
        "integrity": "sha256-HWVrqgpjYwvvK24Tl0JPbEDK0GDJV1R3/KsdiI3NOR8="
      },
      {
        "virtualPath": "System.Runtime.Serialization.Formatters.wasm",
        "name": "System.Runtime.Serialization.Formatters.e77lbn9sd8.wasm",
        "integrity": "sha256-uk5xySp5HzBhavGFpRZrnhY6XiV72es5pfjLKcFe/iQ="
      },
      {
        "virtualPath": "System.Runtime.Serialization.Json.wasm",
        "name": "System.Runtime.Serialization.Json.jk90p02j9y.wasm",
        "integrity": "sha256-jTYxq3AscBiLUfk9bqd7W7/frXuIBOfvrRE4uR+gBec="
      },
      {
        "virtualPath": "System.Runtime.Serialization.Primitives.wasm",
        "name": "System.Runtime.Serialization.Primitives.89hbpwsi8z.wasm",
        "integrity": "sha256-5FpIDx7n9T3mndId6hNiG2gzqO7pVp0tr3zksHveipI="
      },
      {
        "virtualPath": "System.Runtime.Serialization.Xml.wasm",
        "name": "System.Runtime.Serialization.Xml.d7r7w6jo0y.wasm",
        "integrity": "sha256-ea1lepO6QAZ9jsOcvs2BwCGQ37VJOlG4mvBdTR16WFg="
      },
      {
        "virtualPath": "System.Runtime.Serialization.wasm",
        "name": "System.Runtime.Serialization.42tqcgfp3k.wasm",
        "integrity": "sha256-nBGKw6KKTqcV5fssFzsZLSpaG4cJWCwa02VRunMqenQ="
      },
      {
        "virtualPath": "System.Runtime.wasm",
        "name": "System.Runtime.fia9t5aa1g.wasm",
        "integrity": "sha256-dy4ZGlsKWRJKxM+iZn/uIEZ2fWNqPOIuuOs8vGevqbo="
      },
      {
        "virtualPath": "System.Security.AccessControl.wasm",
        "name": "System.Security.AccessControl.8jczl74u1l.wasm",
        "integrity": "sha256-NJtajZ4/rmdivaLQaa8FFJpnOKA0iNEdZpLj86rdfDs="
      },
      {
        "virtualPath": "System.Security.Claims.wasm",
        "name": "System.Security.Claims.d4szcy3jij.wasm",
        "integrity": "sha256-Hb2gEQMYwOR0+Y+pSj+hwOPQkygmbnbx/4N6sfGiAc8="
      },
      {
        "virtualPath": "System.Security.Cryptography.Algorithms.wasm",
        "name": "System.Security.Cryptography.Algorithms.ypcmxdzh7n.wasm",
        "integrity": "sha256-5m58rAkUiSNYt+Iux+A8pbNdBJPTsul0Bhf9ZzyCOVM="
      },
      {
        "virtualPath": "System.Security.Cryptography.Cng.wasm",
        "name": "System.Security.Cryptography.Cng.vef4n2zmbj.wasm",
        "integrity": "sha256-+Wlqx+fi6Xm68LPbryBh8T4lIJnl0IA8ARkomGhxMG4="
      },
      {
        "virtualPath": "System.Security.Cryptography.Csp.wasm",
        "name": "System.Security.Cryptography.Csp.wgyk5zye6w.wasm",
        "integrity": "sha256-gOMehAFVcVSZrrsTnfZtuMD54EJWHEK/24lFgXRp88w="
      },
      {
        "virtualPath": "System.Security.Cryptography.Encoding.wasm",
        "name": "System.Security.Cryptography.Encoding.zez5h32m7f.wasm",
        "integrity": "sha256-i38SVqfczFVyeqxYq7GBKCAy2gHUMGKF9Fw3ygEtXKI="
      },
      {
        "virtualPath": "System.Security.Cryptography.OpenSsl.wasm",
        "name": "System.Security.Cryptography.OpenSsl.3mmfx2fwxo.wasm",
        "integrity": "sha256-xeaWcGalkX7rjx57pZjgw4kCfVsIub5o9tEp9XC1Je4="
      },
      {
        "virtualPath": "System.Security.Cryptography.Primitives.wasm",
        "name": "System.Security.Cryptography.Primitives.nu8gqxk6tj.wasm",
        "integrity": "sha256-z87gy0if+OQhvvktEj+k6u/JKv4DRwpzYfuaK6n8q1k="
      },
      {
        "virtualPath": "System.Security.Cryptography.X509Certificates.wasm",
        "name": "System.Security.Cryptography.X509Certificates.2939tf7117.wasm",
        "integrity": "sha256-tgHiq/CBVeM9k/+bgmxSW8MtSwhrB9sK/oO7FgmpSLs="
      },
      {
        "virtualPath": "System.Security.Cryptography.wasm",
        "name": "System.Security.Cryptography.f5cgdqs337.wasm",
        "integrity": "sha256-fQkTYT6ABHztvjEdtGn8GrVUdGvwiaHlGnYIr4ZKLmY="
      },
      {
        "virtualPath": "System.Security.Principal.Windows.wasm",
        "name": "System.Security.Principal.Windows.6vay03s7pu.wasm",
        "integrity": "sha256-gteCE33TF5wyXTeR063+HZwgGqUP5MF01cWey6K4GAM="
      },
      {
        "virtualPath": "System.Security.Principal.wasm",
        "name": "System.Security.Principal.q88jaff799.wasm",
        "integrity": "sha256-ekZwN6LsBxE6JMtSi6jNNZ8l+PhtkFQa5tjaKONHTeE="
      },
      {
        "virtualPath": "System.Security.SecureString.wasm",
        "name": "System.Security.SecureString.hb54ys7isu.wasm",
        "integrity": "sha256-E8qN5uyGVHXMiiiY66/Gm6bUKcSXy32GYZlkpIN0bxA="
      },
      {
        "virtualPath": "System.Security.wasm",
        "name": "System.Security.f6krzjlgrw.wasm",
        "integrity": "sha256-5x16E/PPE8IuSIlUoPjVlh33uMhayzX75nQ1lmZAEO0="
      },
      {
        "virtualPath": "System.ServiceModel.Web.wasm",
        "name": "System.ServiceModel.Web.rbntdrde7r.wasm",
        "integrity": "sha256-qRuwsyVaLzjhv7ubB2NL6IsmMwuVUXjHDzKRMWfjWM0="
      },
      {
        "virtualPath": "System.ServiceProcess.wasm",
        "name": "System.ServiceProcess.qyilso7t8z.wasm",
        "integrity": "sha256-Qv9WjGzt98I3CaqNrUwr32NV/uZU0oP9RdP6BLl9Z58="
      },
      {
        "virtualPath": "System.Text.Encoding.CodePages.wasm",
        "name": "System.Text.Encoding.CodePages.17ayvhtqge.wasm",
        "integrity": "sha256-HRungvyyDrs9mDy+17vbupNHAEKY3Z3H8NS3wO1qi+4="
      },
      {
        "virtualPath": "System.Text.Encoding.Extensions.wasm",
        "name": "System.Text.Encoding.Extensions.nygy3jbhx1.wasm",
        "integrity": "sha256-oXazY+HRVeLsh2aZG1T9rGwXoTdAJu3GKQZ3C6TLfZQ="
      },
      {
        "virtualPath": "System.Text.Encoding.wasm",
        "name": "System.Text.Encoding.04hepsgj3x.wasm",
        "integrity": "sha256-4Eg0jFhydpm3qIGrAydbuoXDAIMvDLlOo9kZLmfEUBQ="
      },
      {
        "virtualPath": "System.Text.Encodings.Web.wasm",
        "name": "System.Text.Encodings.Web.bjfqt0dahs.wasm",
        "integrity": "sha256-J17dmTiHubRkZhNBWYtDKL0LYC0uyVbwFsg5t5zpijg="
      },
      {
        "virtualPath": "System.Text.RegularExpressions.wasm",
        "name": "System.Text.RegularExpressions.pg4zhyyp9k.wasm",
        "integrity": "sha256-pyWsqNx0HwjL6/jbWNce4C1uzIyHCWyotT5mHWy3bqM="
      },
      {
        "virtualPath": "System.Threading.AccessControl.wasm",
        "name": "System.Threading.AccessControl.sbjd1gkt6y.wasm",
        "integrity": "sha256-6Pvpqc1NgW7xyxxrNbHsoCgWHSFHaVkBs6Be+9si2V8="
      },
      {
        "virtualPath": "System.Threading.Channels.wasm",
        "name": "System.Threading.Channels.lvmlilj250.wasm",
        "integrity": "sha256-7yK0GAk52eGHcqOzltleFrY+HH8KbvIhucRfeEnTWIM="
      },
      {
        "virtualPath": "System.Threading.Overlapped.wasm",
        "name": "System.Threading.Overlapped.gyxolnyjwp.wasm",
        "integrity": "sha256-6JLze1yT+KYXQAIXRq14cTqgJxkY/wASLxtIrtGZXzI="
      },
      {
        "virtualPath": "System.Threading.Tasks.Dataflow.wasm",
        "name": "System.Threading.Tasks.Dataflow.3osjsejwew.wasm",
        "integrity": "sha256-HSSrFCuMO4G7h7d+zQodxL7RSodD6ygthGHC341izEU="
      },
      {
        "virtualPath": "System.Threading.Tasks.Extensions.wasm",
        "name": "System.Threading.Tasks.Extensions.1mcanyuddp.wasm",
        "integrity": "sha256-p0JTgI1z4lP75tK5rpx2bnpynX2q8Ru7BAi2mZDxRBs="
      },
      {
        "virtualPath": "System.Threading.Tasks.Parallel.wasm",
        "name": "System.Threading.Tasks.Parallel.r6zpp982xl.wasm",
        "integrity": "sha256-Y/t84VLoEkhnwFgMUZqi9Yfj4v0hTYE+qMcUxCs/Le4="
      },
      {
        "virtualPath": "System.Threading.Tasks.wasm",
        "name": "System.Threading.Tasks.pcj2ogebx4.wasm",
        "integrity": "sha256-hzlMPtchlSuUXB/crf18ZUYAxTj9Fdaw5th1gU5KGhg="
      },
      {
        "virtualPath": "System.Threading.Thread.wasm",
        "name": "System.Threading.Thread.04a10woh59.wasm",
        "integrity": "sha256-cCnqwxaOn2xJMgfRsXrnXmQyUuiJu/fBqllOk4gAwlo="
      },
      {
        "virtualPath": "System.Threading.ThreadPool.wasm",
        "name": "System.Threading.ThreadPool.lmw2wobzj9.wasm",
        "integrity": "sha256-U/5Kw/mTaJykZjDJcpGeSLxj9t4OwiWap3nzGBSol/M="
      },
      {
        "virtualPath": "System.Threading.Timer.wasm",
        "name": "System.Threading.Timer.poct2xeqhn.wasm",
        "integrity": "sha256-h1R2vcQ97076p/GwBpPRpXqjBk/S0lh8ZNeMvNd4YZo="
      },
      {
        "virtualPath": "System.Threading.wasm",
        "name": "System.Threading.qp7l28k3o3.wasm",
        "integrity": "sha256-soOcih6t/V2Y775XsRm+4cna8E0NnPzDjtnC2kU6pVQ="
      },
      {
        "virtualPath": "System.Transactions.Local.wasm",
        "name": "System.Transactions.Local.6kd3xk8hdh.wasm",
        "integrity": "sha256-Zrgg0PiFYuUjxGHilBpijjjTD6I80ICEmL0B+27/vZ0="
      },
      {
        "virtualPath": "System.Transactions.wasm",
        "name": "System.Transactions.ump4so0y0l.wasm",
        "integrity": "sha256-xtZYKOllBRFVorDF1D2RApRi1WSE8fOFsv2gWL/q3Cw="
      },
      {
        "virtualPath": "System.ValueTuple.wasm",
        "name": "System.ValueTuple.8l2r2fcikp.wasm",
        "integrity": "sha256-JJzcNUBWHQPPnOWVk6KyHIlk2SffBkKjqEyzT2VDaXo="
      },
      {
        "virtualPath": "System.Web.HttpUtility.wasm",
        "name": "System.Web.HttpUtility.jqny9b28k8.wasm",
        "integrity": "sha256-VX4HXxvr+27q9682PsKSEVdwKHvcGlkPy+zMHvLlxPE="
      },
      {
        "virtualPath": "System.Web.wasm",
        "name": "System.Web.f3isiszv3w.wasm",
        "integrity": "sha256-m3y3phZj6uNNguyeuCMkEZIz3lkRynaPOaiucgIAaR4="
      },
      {
        "virtualPath": "System.Windows.wasm",
        "name": "System.Windows.q5sidjfnfu.wasm",
        "integrity": "sha256-8pfabqlVMYqOCfXEQG8fSAv9WRuutWOaKop52tFYX64="
      },
      {
        "virtualPath": "System.Xml.Linq.wasm",
        "name": "System.Xml.Linq.atp09gp5u7.wasm",
        "integrity": "sha256-UsR0Y0lH0gSjh2syGbFPep0nV8ZAgnboX8y4i6jMlWc="
      },
      {
        "virtualPath": "System.Xml.ReaderWriter.wasm",
        "name": "System.Xml.ReaderWriter.aojujok3am.wasm",
        "integrity": "sha256-GhKWJndfG9FyzyLbf2gYHwCUHdJKlqmV92qhEcy0vyY="
      },
      {
        "virtualPath": "System.Xml.Serialization.wasm",
        "name": "System.Xml.Serialization.agak2gozwa.wasm",
        "integrity": "sha256-Fsz/hbw7X2e02FlPziw7DkGo7WcyakVUgkJKe9KXwNg="
      },
      {
        "virtualPath": "System.Xml.XDocument.wasm",
        "name": "System.Xml.XDocument.02w9zz751t.wasm",
        "integrity": "sha256-eNbdUX8fYv3vgXdXDSM/58VRgJPDE7QvYre+1TqascQ="
      },
      {
        "virtualPath": "System.Xml.XPath.XDocument.wasm",
        "name": "System.Xml.XPath.XDocument.33cyrav3at.wasm",
        "integrity": "sha256-UXs9W1Z1j2/3x1nSuBgvgCnEtROUmFBXSk+btxWJs3U="
      },
      {
        "virtualPath": "System.Xml.XPath.wasm",
        "name": "System.Xml.XPath.tvqmjgrks4.wasm",
        "integrity": "sha256-Z+vO34JvsRn3VFl7G407FwtnK95SFYBm9vuV1XNwR+g="
      },
      {
        "virtualPath": "System.Xml.XmlDocument.wasm",
        "name": "System.Xml.XmlDocument.wxidkaeb57.wasm",
        "integrity": "sha256-3MLqz/ZCfGKMeOqte/pG8M69UxrhEE6kWyFVxs7Tkek="
      },
      {
        "virtualPath": "System.Xml.XmlSerializer.wasm",
        "name": "System.Xml.XmlSerializer.wz2ns3vb1t.wasm",
        "integrity": "sha256-FFmdIoqfSMWK+2KHkRgmosixjn09Lx2GNWg4+8YVxTA="
      },
      {
        "virtualPath": "System.Xml.wasm",
        "name": "System.Xml.96ugyjhhs1.wasm",
        "integrity": "sha256-wdqvDcI4c+Y53jmjhgm6hB8OytZf6iiY1V//BfG+DmE="
      },
      {
        "virtualPath": "System.wasm",
        "name": "System.7ivh8t028t.wasm",
        "integrity": "sha256-QSo5msDSOeSNfKGOHymqidG/WhFiQfS1+OHRbPAVl48="
      },
      {
        "virtualPath": "WindowsBase.wasm",
        "name": "WindowsBase.t8009apkm8.wasm",
        "integrity": "sha256-PaL8FZzeN08X4B9lnn0Rzfkdz/UzrOfHGVRr2v8p8c4="
      },
      {
        "virtualPath": "mscorlib.wasm",
        "name": "mscorlib.2hudslz60a.wasm",
        "integrity": "sha256-emSsjRV2LKaEomf4hjRYICERFvrg8xxumtbgtbV75cQ="
      },
      {
        "virtualPath": "netstandard.wasm",
        "name": "netstandard.j4ilm936ku.wasm",
        "integrity": "sha256-A5mxY/s9ROoUSC44GE0cwB2iIyoYUITC8vTORChFwjk="
      },
      {
        "virtualPath": "compiler.wasm",
        "name": "compiler.llrabshmxa.wasm",
        "integrity": "sha256-ORVuNOJT2VBFU++Dp93VwZkKW8vG/ykn1x9HlyBg0uU="
      }
    ],
    "pdb": [
      {
        "virtualPath": "compiler.pdb",
        "name": "compiler.46xl3apvlm.pdb",
        "integrity": "sha256-LDbmdiM+KlxiAGUyd8/O5kRJdMS1n42/YlqTLDcflFg="
      }
    ],
    "satelliteResources": {
      "cs": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.azbzwnm97j.wasm",
          "integrity": "sha256-mlyPvIy/aTrD9cWR+naU3dIlgyi0Hd5XLyFjgSiNIwo="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.ncyjg21q77.wasm",
          "integrity": "sha256-pxzSGpQdM/slmFBgQf8QMehjkKWMozPJYzfPqW5HeVc="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.xahtunrvma.wasm",
          "integrity": "sha256-2QapptlLRPZU8oSk9rh6ofJ/8ptisfsMoUJyuFoJQPA="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.glch3zuqym.wasm",
          "integrity": "sha256-BAk+Ol0YIyIPbEC3FuZHtjOGxxwuVtTDvB1t/SUzg08="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.v0cr9c01q3.wasm",
          "integrity": "sha256-nw5u45EUdqoE1J2YQfR7C37I1dmuwGLo9evUPnyL+B8="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.g3hovypeve.wasm",
          "integrity": "sha256-jMMsHr4NzccRIX+QynY9/UQozO54jum6INXFYn5dUNo="
        }
      ],
      "de": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.uxm2gznvff.wasm",
          "integrity": "sha256-XnOwMjY5/+DsrMdTu6tlf+FF5JbUGf0DZCeqDZrS9Nk="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.nrmkzk2qqa.wasm",
          "integrity": "sha256-QyPHORDObecDXST5xMuf7MOjs86CBuGI3xViI+xovF8="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.rle74e9jdp.wasm",
          "integrity": "sha256-rxEYe3zXeFVQ4KGwMcQWpnWVbwKMeV4gUt1YSon8xUw="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.3mfzxsme75.wasm",
          "integrity": "sha256-y8oOgaw/GVEmI/d4xVfxHj/r2yeMytdfdxa97CmhQtg="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.51hsea87zy.wasm",
          "integrity": "sha256-ObtMrur1IIcCXAMBS8bFXtdQxanf/NvlFL8X5sF8aKg="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.emy289h252.wasm",
          "integrity": "sha256-xndogMRuwJx9pxJSIC8l6eWLaFH1a39ZVU2BC9/I1ak="
        }
      ],
      "es": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.ec0xfu5e6x.wasm",
          "integrity": "sha256-/vbzh2wSibkLG+hxBNdOvithq0WREjHZI9USfqETzd0="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.7u63wh3avx.wasm",
          "integrity": "sha256-oQbGJX2FzuOnM40Kb8YEjIQax6I+o1FvPXyTpMfVepI="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.cv3mgmxsv9.wasm",
          "integrity": "sha256-6Ao5RsHL7jXHczaARlk/gHbAOrPr8eY2BzYYoVKgpxw="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.3n2xu2fkks.wasm",
          "integrity": "sha256-n6FQXHdWmW0rRTVI1MYY4jqFHYDijkdf5zOmT1NLHdM="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.evc7j9kssq.wasm",
          "integrity": "sha256-6jP8sQ9gsVFrV+mFMmsGL7M2LW7Cfl0e2ERhKd8fpM0="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.tan2fcgo2r.wasm",
          "integrity": "sha256-i/6ouCSNqDTq8XSVqwEVtgvX5cVndy5XkLp2HIz/fnc="
        }
      ],
      "fr": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.udwqjg1mda.wasm",
          "integrity": "sha256-jhZ+Q0gSqxX6phNcgIwZy9p0Pz7EdbFCrXBrtsls1mA="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.yiwbzamycv.wasm",
          "integrity": "sha256-ljtkxxDpZ57IdAOGi0BjhomnAssAojYKklGmb+MxuBs="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.z1hggb0y3z.wasm",
          "integrity": "sha256-V1YO3dBWBDtKjqxkMBuKX/5JW4qX1rQ1ZqNFYmLKhpg="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.jtpg4r6zw4.wasm",
          "integrity": "sha256-SSmhrKTl7DmIthyX5WXhA3JqFrK4Rez/iXw3Vvcis2o="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.iafwb4ru8y.wasm",
          "integrity": "sha256-lj+yyavjiBy/A+qIxMO1bWrb0vKugGDBJdMCk4geMMU="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.8aysq2t2lw.wasm",
          "integrity": "sha256-kI5q6MPiDgdhOfj6ASBWnxhYB0hOMxDeFolxgawiptw="
        }
      ],
      "it": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.86tqtx2upv.wasm",
          "integrity": "sha256-0OjnaSwlweTjnDhi+nfZTko7nCMlOA+fGiL6fml5V10="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.465xyiyi1i.wasm",
          "integrity": "sha256-lN03J4Ux8x+ewgl0TIBsNWX5yySMVEuOtITVTXKeh4w="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.qywpdlptl3.wasm",
          "integrity": "sha256-3hvKfvAu383TSQpA81WWYql1dnT4CL+DDJa14WiIMS8="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.hs6ws8elfc.wasm",
          "integrity": "sha256-YcZm3nYwE1sBHPeTrbsmoJHRJ1UU7fRfNyzBXXuK/BI="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.ii6e2ugdyo.wasm",
          "integrity": "sha256-etI4JU8TcAZzAhYSE/unc8rqSH7F88bcxXIgAEcsxmE="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.tljkgh8rl0.wasm",
          "integrity": "sha256-vys04gENScKCIg0xLU6nSTSNTBijGlEeK5QAWZtzJXY="
        }
      ],
      "ja": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.ner1z7do1e.wasm",
          "integrity": "sha256-AXAAYzbCWQvP4VWolOBBZDvPJ/hxjI8p6bfsg6VqimQ="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.hi9e1rrn8r.wasm",
          "integrity": "sha256-qYT18CC0AWdwbfE90bB/q/PeXLn6pjvSj1HcHfGpm34="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.sqiata1vol.wasm",
          "integrity": "sha256-ZPItJaH3dz8HLw0N2QNhzZBLCPCsK0m9PaE9BzZY880="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.jwuf4fl4ld.wasm",
          "integrity": "sha256-zUUwHGujhNuIUYa9h59xuyHWZAjfL6cbFD8xLwKuGE8="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.2j7ab012ap.wasm",
          "integrity": "sha256-YkAlGuLl4hD32u5e6nS8pO/lerEY/TkH9S6LfAGXS9Y="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.a7tfnlchdd.wasm",
          "integrity": "sha256-atOv2cXayTTVPxBttM78oEU2XvbpPJcm52ASfcIhGRc="
        }
      ],
      "ko": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.u9mscaqe3g.wasm",
          "integrity": "sha256-wnNUgEa31P8Bvdti52QP1fOQQcvvViQDmMtMP2nnl18="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.998gjfe8qz.wasm",
          "integrity": "sha256-MwPjNwHYVz3X3xvxzDupsG637ubEm65TVIPbS6fvL94="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.nkahbg8bp3.wasm",
          "integrity": "sha256-x7oa03cEprs4TJIxWPDv73X1a+ZhDEzxewu7ZEAHvsc="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.26rd1snw29.wasm",
          "integrity": "sha256-yssF7DI18rQNRSpOSJHqLoHWnkPkYxdOBW4ial8Lo0g="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.5rbmzqek0s.wasm",
          "integrity": "sha256-AXDVN/Yi+8hUctr2nKmhSjO96voruLbfT1z0tQnlGSU="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.muf6eu4jeq.wasm",
          "integrity": "sha256-vptbf+JmoxR2I1VfsPvTK2E6lJeLfIqe4KYhYMZ6aSk="
        }
      ],
      "pl": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.si9hlaf1s0.wasm",
          "integrity": "sha256-dBft16QYqFgHThAnfDbPL14GgZO4xew3FuT2RvSJvDE="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.snlz6ty14s.wasm",
          "integrity": "sha256-mO3VU//2bzWuSiCo2L/1+LmQ1T/1R9Cp/TjbZFTFz9U="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.zeiz2i0z3d.wasm",
          "integrity": "sha256-BS5aX4t53ImgsQI5eZ4UGaSxqW4p88dMDAFQlY12B6k="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.g4i0f9yk91.wasm",
          "integrity": "sha256-QFGVsdSBS1TWZWme6spufxuBjANfPjFuR4NqiCsbuhA="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.gkm47blczk.wasm",
          "integrity": "sha256-wPHpcM3g0tiSPKnJN4Yw01XIpviA7rNNfv1QlwHI7w0="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.90ofzrxtw9.wasm",
          "integrity": "sha256-tzkylNbNjUmXKNrVCdoohGPoLsa55mDLM2ilrnKHVTM="
        }
      ],
      "pt-BR": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.mn8z1j7j2b.wasm",
          "integrity": "sha256-khOT3LEMbAh8DDtztJPeiiuLYDPdIBD6ckqK5W5lRG4="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.xarwohe7gy.wasm",
          "integrity": "sha256-Oe6BxpPIYbJqQfzGcO8X/T/WeFUPxQ0mLYPPZnegLOc="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.mwrapdchf0.wasm",
          "integrity": "sha256-xrho/rzjANBR6xvGOeATTqnDqta883FCxynT/+H90n4="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.ag49p40ok2.wasm",
          "integrity": "sha256-yscz/1353KsKOJ3sGhz8uA2P5LT2rzNnWJ9PNUnbRmc="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.u9aadhb4vj.wasm",
          "integrity": "sha256-ghODcUl7gl5XzwVeb85Pxbxei0HwnA3RtN4K1wvZW50="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.zudxo5gd8d.wasm",
          "integrity": "sha256-la8Vh8qyqp/9QjsZ1Zauz1UXUpBHKVdg7DwGIXRcx6M="
        }
      ],
      "ru": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.h3mfsuyol9.wasm",
          "integrity": "sha256-Y+54eupiktzb2rnvJIfO8kTru7uv7j4SEncDmfjOe5Y="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.u5qr7p1vic.wasm",
          "integrity": "sha256-zgdEQNh/n56dpU21YmaNRBf0ARPO5DALw3JGr5HMjQQ="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.p42b90dnqv.wasm",
          "integrity": "sha256-d+ePLt5nw+STIg8XmR+5OszVBfBrg24CuO4QVMVSQKk="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.o1hvwndqwv.wasm",
          "integrity": "sha256-DJQxoNl+MUFfdIPnUN/yb+I+shxiJJVSx7WWwyXi1sg="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.1or4a8z4y3.wasm",
          "integrity": "sha256-Ef+eQwCsotFE2HbieruJboHUUIrlxk2tY8Fl2Pda9ps="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.nanmd097ls.wasm",
          "integrity": "sha256-kWOCodcE9ReuhWAfecjA0QJT8c2m7OUh+CrU3VLMYGE="
        }
      ],
      "tr": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.5zvghpcemm.wasm",
          "integrity": "sha256-HwW8NLN7cTqlZfYe16gB/a3QCBO6ZGKi81rApQRTec4="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.pwlsqlbbsk.wasm",
          "integrity": "sha256-F2QjCvdgMhil7A5fgAZhgxmj4ws4A6BqTryGCfkQ3fI="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.sm5b3c5hpx.wasm",
          "integrity": "sha256-vOtwuic14BnkiNIAWSqioxtXnjq/2lgDLRX4buM1SvU="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.0vdmvujudw.wasm",
          "integrity": "sha256-VKl/GMl8PkPr9sGGQAVCOzLy9H+CLQ7HUQYIBLtFDKc="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.zuap7ima7j.wasm",
          "integrity": "sha256-xS2uJpWjkJL4SPxwDBR/PSvIc1ws/60zQnwvUw75/v0="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.p617tdr33s.wasm",
          "integrity": "sha256-P/00H6AWX1CxYD+8rpq5ErDB1qelp3Uc1Fv2iEyAVuk="
        }
      ],
      "zh-Hans": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.v3jjn2jlhr.wasm",
          "integrity": "sha256-helIZuiJmOS4iSCte80+TeV/keycWw4zMTad7TECc50="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.xa5czk39rr.wasm",
          "integrity": "sha256-Jxfdz3Jgmon5wrrZgjDG6+hTArh5VrZeQblT1tZuePA="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.m6ucnmo7p7.wasm",
          "integrity": "sha256-Mg3t5ehK0Caw7o7prNKXvClg3rQgCm67wTy4SncvHjA="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.0679n81qoj.wasm",
          "integrity": "sha256-eEwh3erTkEKl1zp4KoGyFj3I5fjX4sT7JYRZNIoFEyg="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.mpjam9iwdb.wasm",
          "integrity": "sha256-tsM0HhQeAg3iKg7tUilyBLN3AjaxGQhos5DT+HGeUYY="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.n9c992ve2i.wasm",
          "integrity": "sha256-pfi4I4oz/9b+brV4MIpNIL5+lkPzLOGW5jp9TdjA/YA="
        }
      ],
      "zh-Hant": [
        {
          "virtualPath": "Microsoft.CodeAnalysis.resources.wasm",
          "name": "Microsoft.CodeAnalysis.resources.xff2phc93y.wasm",
          "integrity": "sha256-rVcHpYZCLuYlbIqfBE0mN4yXFwZCS2YbR7T5PyoeNo0="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.resources.pc7lskmtva.wasm",
          "integrity": "sha256-eSTRMqYhBX0GTXPnSh4dY0hu7n/XPeRSmwIrNOcAOVE="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.CSharp.Workspaces.resources.84ewjmqlhy.wasm",
          "integrity": "sha256-ePqDMQ/SeRY7aK9L0lpsd7gnAKUKdqwL8nJBvXMtgEw="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.resources.k9cdtkpeav.wasm",
          "integrity": "sha256-qGME6faa+uzEhGwLnvk7yUZmV/rlzHUY6X+24hGASCM="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.VisualBasic.Workspaces.resources.h11kdu4hxg.wasm",
          "integrity": "sha256-RSdaG2w482ojZ/YviUCnPbSg/OKagEODOkTR4i3iFyM="
        },
        {
          "virtualPath": "Microsoft.CodeAnalysis.Workspaces.resources.wasm",
          "name": "Microsoft.CodeAnalysis.Workspaces.resources.9227t61asb.wasm",
          "integrity": "sha256-MatRb/8ISAproozowr/GATwcM8eBN0qww7Z/hvEKiPg="
        }
      ]
    }
  },
  "debugLevel": -1,
  "globalizationMode": "invariant",
  "runtimeConfig": {
    "runtimeOptions": {
      "configProperties": {
        "Microsoft.Extensions.DependencyInjection.VerifyOpenGenericServiceTrimmability": true,
        "System.ComponentModel.DefaultValueAttribute.IsSupported": false,
        "System.ComponentModel.Design.IDesignerHost.IsSupported": false,
        "System.ComponentModel.TypeConverter.EnableUnsafeBinaryFormatterInDesigntimeLicenseContextSerialization": false,
        "System.ComponentModel.TypeDescriptor.IsComObjectDescriptorSupported": false,
        "System.Data.DataSet.XmlSerializationIsSupported": false,
        "System.Diagnostics.Debugger.IsSupported": false,
        "System.Diagnostics.Metrics.Meter.IsSupported": false,
        "System.Diagnostics.Tracing.EventSource.IsSupported": false,
        "System.Globalization.Invariant": true,
        "System.TimeZoneInfo.Invariant": false,
        "System.Globalization.PredefinedCulturesOnly": true,
        "System.Linq.Enumerable.IsSizeOptimized": true,
        "System.Net.Http.EnableActivityPropagation": false,
        "System.Net.Http.WasmEnableStreamingResponse": true,
        "System.Net.SocketsHttpHandler.Http3Support": false,
        "System.Reflection.Metadata.MetadataUpdater.IsSupported": false,
        "System.Resources.ResourceManager.AllowCustomResourceTypes": false,
        "System.Resources.UseSystemResourceKeys": true,
        "System.Runtime.CompilerServices.RuntimeFeature.IsDynamicCodeSupported": true,
        "System.Runtime.InteropServices.BuiltInComInterop.IsSupported": false,
        "System.Runtime.InteropServices.EnableConsumingManagedCodeFromNativeHosting": false,
        "System.Runtime.InteropServices.EnableCppCLIHostActivation": false,
        "System.Runtime.InteropServices.Marshalling.EnableGeneratedComInterfaceComImportInterop": false,
        "System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization": false,
        "System.StartupHookProvider.IsSupported": false,
        "System.Text.Encoding.EnableUnsafeUTF7Encoding": false,
        "System.Text.Json.JsonSerializer.IsReflectionEnabledByDefault": true,
        "System.Threading.Thread.EnableAutoreleasePool": false
      }
    }
  }
}/*json-end*/);export{gt as default,ft as dotnet,mt as exit};
