import { inContext, type Context } from 'libs/context';
import { createLogger, redirect, type Logger } from 'libs/logger';
import type { Streams } from 'libs/io';
import { patch } from 'libs/patcher';
import type { TestCompiler } from 'libs/testing';
import { createCachedFetch } from 'libs/fetch';
import {
	DotnetCompilerFactory,
	DotnetRuntimeFactory,
	type DotnetModule,
	type CompilerModuleImports,
	type CompilerModuleExports,
	DotnetTestProgram,
	createLibsLoader
} from 'dotnet-runtime';

import { base } from '$app/paths';

import humanizerDllUrl from 'dotnet-runtime/lib/Humanizer.dll?url';
import microsoftBclAsyncInterfacesDllUrl from 'dotnet-runtime/lib/Microsoft.Bcl.AsyncInterfaces.dll?url';
import microsoftCSharpDllUrl from 'dotnet-runtime/lib/Microsoft.CSharp.dll?url';
// import microsoftCodeAnalysisCSharpWorkspacesDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.CSharp.Workspaces.dll?url"
// import microsoftCodeAnalysisCSharpDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.CSharp.dll?url"
// import microsoftCodeAnalysisVisualBasicWorkspacesDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.VisualBasic.Workspaces.dll?url"
// import microsoftCodeAnalysisVisualBasicDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.VisualBasic.dll?url"
// import microsoftCodeAnalysisWorkspacesDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.Workspaces.dll?url"
// import microsoftCodeAnalysisDllUrl from "dotnet-runtime/lib/Microsoft.CodeAnalysis.dll?url"
// import microsoftJsInteropWebAssemblyDllUrl from "dotnet-runtime/lib/Microsoft.JSInterop.WebAssembly.dll?url"
// import microsoftJsInteropDllUrl from "dotnet-runtime/lib/Microsoft.JSInterop.dll?url"
// import microsoftVisualBasicCoreDllUrl from "dotnet-runtime/lib/Microsoft.VisualBasic.Core.dll?url"
// import microsoftVisualBasicDllUrl from "dotnet-runtime/lib/Microsoft.VisualBasic.dll?url"
// import microsoftWin32PrimitivesDllUrl from "dotnet-runtime/lib/Microsoft.Win32.Primitives.dll?url"
// import microsoftWin32RegistryDllUrl from "dotnet-runtime/lib/Microsoft.Win32.Registry.dll?url"
import systemAppContextDllUrl from 'dotnet-runtime/lib/System.AppContext.dll?url';
import systemBuffersDllUrl from 'dotnet-runtime/lib/System.Buffers.dll?url';
import systemCollectionsConcurrentDllUrl from 'dotnet-runtime/lib/System.Collections.Concurrent.dll?url';
import systemCollectionsImmutableDllUrl from 'dotnet-runtime/lib/System.Collections.Immutable.dll?url';
import systemCollectionsNonGenericDllUrl from 'dotnet-runtime/lib/System.Collections.NonGeneric.dll?url';
import systemCollectionsSpecializedDllUrl from 'dotnet-runtime/lib/System.Collections.Specialized.dll?url';
import systemCollectionsDllUrl from 'dotnet-runtime/lib/System.Collections.dll?url';
// import systemComponentModelAnnotationsDllUrl from "dotnet-runtime/lib/System.ComponentModel.Annotations.dll?url"
// import systemComponentModelDataAnnotationsDllUrl from "dotnet-runtime/lib/System.ComponentModel.DataAnnotations.dll?url"
// import systemComponentModelEventBasedAsyncDllUrl from "dotnet-runtime/lib/System.ComponentModel.EventBasedAsync.dll?url"
// import systemComponentModelPrimitivesDllUrl from "dotnet-runtime/lib/System.ComponentModel.Primitives.dll?url"
// import systemComponentModelTypeConverterDllUrl from "dotnet-runtime/lib/System.ComponentModel.TypeConverter.dll?url"
// import systemComponentModelDllUrl from "dotnet-runtime/lib/System.ComponentModel.dll?url"
// import systemCompositionAttributedModelDllUrl from "dotnet-runtime/lib/System.Composition.AttributedModel.dll?url"
// import systemCompositionConventionDllUrl from "dotnet-runtime/lib/System.Composition.Convention.dll?url"
// import systemCompositionHostingDllUrl from "dotnet-runtime/lib/System.Composition.Hosting.dll?url"
// import systemCompositionRuntimeDllUrl from "dotnet-runtime/lib/System.Composition.Runtime.dll?url"
// import systemCompositionTypedPartsDllUrl from "dotnet-runtime/lib/System.Composition.TypedParts.dll?url"
// import systemConfigurationDllUrl from "dotnet-runtime/lib/System.Configuration.dll?url"
import systemConsoleDllUrl from 'dotnet-runtime/lib/System.Console.dll?url';
import systemCoreDllUrl from 'dotnet-runtime/lib/System.Core.dll?url';
// import systemDataCommonDllUrl from "dotnet-runtime/lib/System.Data.Common.dll?url"
// import systemDataDataSetExtensionsDllUrl from "dotnet-runtime/lib/System.Data.DataSetExtensions.dll?url"
// import systemDataDllUrl from "dotnet-runtime/lib/System.Data.dll?url"
// import systemDiagnosticsContractsDllUrl from "dotnet-runtime/lib/System.Diagnostics.Contracts.dll?url"
import systemDiagnosticsDebugDllUrl from 'dotnet-runtime/lib/System.Diagnostics.Debug.dll?url';
// import systemDiagnosticsDiagnosticSourceDllUrl from "dotnet-runtime/lib/System.Diagnostics.DiagnosticSource.dll?url"
// import systemDiagnosticsFileVersionInfoDllUrl from "dotnet-runtime/lib/System.Diagnostics.FileVersionInfo.dll?url"
// import systemDiagnosticsProcessDllUrl from "dotnet-runtime/lib/System.Diagnostics.Process.dll?url"
// import systemDiagnosticsStackTraceDllUrl from "dotnet-runtime/lib/System.Diagnostics.StackTrace.dll?url"
// import systemDiagnosticsTextWriterTraceListenerDllUrl from "dotnet-runtime/lib/System.Diagnostics.TextWriterTraceListener.dll?url"
// import systemDiagnosticsToolsDllUrl from "dotnet-runtime/lib/System.Diagnostics.Tools.dll?url"
// import systemDiagnosticsTraceSourceDllUrl from "dotnet-runtime/lib/System.Diagnostics.TraceSource.dll?url"
// import systemDiagnosticsTracingDllUrl from "dotnet-runtime/lib/System.Diagnostics.Tracing.dll?url"
// import systemDrawingPrimitivesDllUrl from "dotnet-runtime/lib/System.Drawing.Primitives.dll?url"
// import systemDrawingDllUrl from "dotnet-runtime/lib/System.Drawing.dll?url"
// import systemDynamicRuntimeDllUrl from "dotnet-runtime/lib/System.Dynamic.Runtime.dll?url"
// import systemFormatsAsn1DllUrl from "dotnet-runtime/lib/System.Formats.Asn1.dll?url"
// import systemFormatsTarDllUrl from "dotnet-runtime/lib/System.Formats.Tar.dll?url"
import systemGlobalizationCalendarsDllUrl from 'dotnet-runtime/lib/System.Globalization.Calendars.dll?url';
import systemGlobalizationExtensionsDllUrl from 'dotnet-runtime/lib/System.Globalization.Extensions.dll?url';
import systemGlobalizationDllUrl from 'dotnet-runtime/lib/System.Globalization.dll?url';
// import systemIoCompressionBrotliDllUrl from "dotnet-runtime/lib/System.IO.Compression.Brotli.dll?url"
// import systemIoCompressionFileSystemDllUrl from "dotnet-runtime/lib/System.IO.Compression.FileSystem.dll?url"
// import systemIoCompressionZipFileDllUrl from "dotnet-runtime/lib/System.IO.Compression.ZipFile.dll?url"
// import systemIoCompressionDllUrl from "dotnet-runtime/lib/System.IO.Compression.dll?url"
// import systemIoFileSystemAccessControlDllUrl from "dotnet-runtime/lib/System.IO.FileSystem.AccessControl.dll?url"
// import systemIoFileSystemDriveInfoDllUrl from "dotnet-runtime/lib/System.IO.FileSystem.DriveInfo.dll?url"
// import systemIoFileSystemPrimitivesDllUrl from "dotnet-runtime/lib/System.IO.FileSystem.Primitives.dll?url"
// import systemIoFileSystemWatcherDllUrl from "dotnet-runtime/lib/System.IO.FileSystem.Watcher.dll?url"
import systemIoFileSystemDllUrl from 'dotnet-runtime/lib/System.IO.FileSystem.dll?url';
// import systemIoIsolatedStorageDllUrl from "dotnet-runtime/lib/System.IO.IsolatedStorage.dll?url"
// import systemIoMemoryMappedFilesDllUrl from "dotnet-runtime/lib/System.IO.MemoryMappedFiles.dll?url"
// import systemIoPipelinesDllUrl from "dotnet-runtime/lib/System.IO.Pipelines.dll?url"
// import systemIoPipesAccessControlDllUrl from "dotnet-runtime/lib/System.IO.Pipes.AccessControl.dll?url"
// import systemIoPipesDllUrl from "dotnet-runtime/lib/System.IO.Pipes.dll?url"
import systemIoUnmanagedMemoryStreamDllUrl from 'dotnet-runtime/lib/System.IO.UnmanagedMemoryStream.dll?url';
import systemIoDllUrl from 'dotnet-runtime/lib/System.IO.dll?url';
import systemLinqExpressionsDllUrl from 'dotnet-runtime/lib/System.Linq.Expressions.dll?url';
import systemLinqParallelDllUrl from 'dotnet-runtime/lib/System.Linq.Parallel.dll?url';
import systemLinqQueryableDllUrl from 'dotnet-runtime/lib/System.Linq.Queryable.dll?url';
import systemLinqDllUrl from 'dotnet-runtime/lib/System.Linq.dll?url';
import systemMemoryDllUrl from 'dotnet-runtime/lib/System.Memory.dll?url';
import systemNetHttpJsonDllUrl from 'dotnet-runtime/lib/System.Net.Http.Json.dll?url';
import systemNetHttpDllUrl from 'dotnet-runtime/lib/System.Net.Http.dll?url';
import systemNetHttpListenerDllUrl from 'dotnet-runtime/lib/System.Net.HttpListener.dll?url';
// import systemNetMailDllUrl from "dotnet-runtime/lib/System.Net.Mail.dll?url"
import systemNetNameResolutionDllUrl from 'dotnet-runtime/lib/System.Net.NameResolution.dll?url';
import systemNetNetworkInformationDllUrl from 'dotnet-runtime/lib/System.Net.NetworkInformation.dll?url';
// import systemNetPingDllUrl from "dotnet-runtime/lib/System.Net.Ping.dll?url"
import systemNetPrimitivesDllUrl from 'dotnet-runtime/lib/System.Net.Primitives.dll?url';
// import systemNetQuicDllUrl from "dotnet-runtime/lib/System.Net.Quic.dll?url"
import systemNetRequestsDllUrl from 'dotnet-runtime/lib/System.Net.Requests.dll?url';
// import systemNetSecurityDllUrl from "dotnet-runtime/lib/System.Net.Security.dll?url"
// import systemNetServicePointDllUrl from "dotnet-runtime/lib/System.Net.ServicePoint.dll?url"
import systemNetSocketsDllUrl from 'dotnet-runtime/lib/System.Net.Sockets.dll?url';
import systemNetWebClientDllUrl from 'dotnet-runtime/lib/System.Net.WebClient.dll?url';
import systemNetWebHeaderCollectionDllUrl from 'dotnet-runtime/lib/System.Net.WebHeaderCollection.dll?url';
// import systemNetWebProxyDllUrl from "dotnet-runtime/lib/System.Net.WebProxy.dll?url"
// import systemNetWebSocketsClientDllUrl from "dotnet-runtime/lib/System.Net.WebSockets.Client.dll?url"
// import systemNetWebSocketsDllUrl from "dotnet-runtime/lib/System.Net.WebSockets.dll?url"
import systemNetDllUrl from 'dotnet-runtime/lib/System.Net.dll?url';
import systemNumericsVectorsDllUrl from 'dotnet-runtime/lib/System.Numerics.Vectors.dll?url';
import systemNumericsDllUrl from 'dotnet-runtime/lib/System.Numerics.dll?url';
import systemObjectModelDllUrl from 'dotnet-runtime/lib/System.ObjectModel.dll?url';
import systemPrivateCoreLibDllUrl from 'dotnet-runtime/lib/System.Private.CoreLib.dll?url';
// import systemPrivateDataContractSerializationDllUrl from "dotnet-runtime/lib/System.Private.DataContractSerialization.dll?url"
import systemPrivateUriDllUrl from 'dotnet-runtime/lib/System.Private.Uri.dll?url';
// import systemPrivateXmlLinqDllUrl from "dotnet-runtime/lib/System.Private.Xml.Linq.dll?url"
// import systemPrivateXmlDllUrl from "dotnet-runtime/lib/System.Private.Xml.dll?url"
// import systemReflectionDispatchProxyDllUrl from "dotnet-runtime/lib/System.Reflection.DispatchProxy.dll?url"
// import systemReflectionEmitIlGenerationDllUrl from "dotnet-runtime/lib/System.Reflection.Emit.ILGeneration.dll?url"
// import systemReflectionEmitLightweightDllUrl from "dotnet-runtime/lib/System.Reflection.Emit.Lightweight.dll?url"
// import systemReflectionEmitDllUrl from "dotnet-runtime/lib/System.Reflection.Emit.dll?url"
// import systemReflectionExtensionsDllUrl from "dotnet-runtime/lib/System.Reflection.Extensions.dll?url"
// import systemReflectionMetadataDllUrl from "dotnet-runtime/lib/System.Reflection.Metadata.dll?url"
// import systemReflectionPrimitivesDllUrl from "dotnet-runtime/lib/System.Reflection.Primitives.dll?url"
// import systemReflectionTypeExtensionsDllUrl from "dotnet-runtime/lib/System.Reflection.TypeExtensions.dll?url"
import systemReflectionDllUrl from 'dotnet-runtime/lib/System.Reflection.dll?url';
import systemResourcesReaderDllUrl from 'dotnet-runtime/lib/System.Resources.Reader.dll?url';
import systemResourcesResourceManagerDllUrl from 'dotnet-runtime/lib/System.Resources.ResourceManager.dll?url';
import systemResourcesWriterDllUrl from 'dotnet-runtime/lib/System.Resources.Writer.dll?url';
// import systemRuntimeCompilerServicesUnsafeDllUrl from "dotnet-runtime/lib/System.Runtime.CompilerServices.Unsafe.dll?url"
// import systemRuntimeCompilerServicesVisualCDllUrl from "dotnet-runtime/lib/System.Runtime.CompilerServices.VisualC.dll?url"
import systemRuntimeExtensionsDllUrl from 'dotnet-runtime/lib/System.Runtime.Extensions.dll?url';
import systemRuntimeHandlesDllUrl from 'dotnet-runtime/lib/System.Runtime.Handles.dll?url';
// import systemRuntimeInteropServicesJavaScriptDllUrl from "dotnet-runtime/lib/System.Runtime.InteropServices.JavaScript.dll?url"
import systemRuntimeInteropServicesRuntimeInformationDllUrl from 'dotnet-runtime/lib/System.Runtime.InteropServices.RuntimeInformation.dll?url';
import systemRuntimeInteropServicesDllUrl from 'dotnet-runtime/lib/System.Runtime.InteropServices.dll?url';
// import systemRuntimeIntrinsicsDllUrl from "dotnet-runtime/lib/System.Runtime.Intrinsics.dll?url"
// import systemRuntimeLoaderDllUrl from "dotnet-runtime/lib/System.Runtime.Loader.dll?url"
// import systemRuntimeNumericsDllUrl from "dotnet-runtime/lib/System.Runtime.Numerics.dll?url"
// import systemRuntimeSerializationFormattersDllUrl from "dotnet-runtime/lib/System.Runtime.Serialization.Formatters.dll?url"
import systemRuntimeSerializationJsonDllUrl from 'dotnet-runtime/lib/System.Runtime.Serialization.Json.dll?url';
// import systemRuntimeSerializationPrimitivesDllUrl from "dotnet-runtime/lib/System.Runtime.Serialization.Primitives.dll?url"
// import systemRuntimeSerializationXmlDllUrl from "dotnet-runtime/lib/System.Runtime.Serialization.Xml.dll?url"
// import systemRuntimeSerializationDllUrl from "dotnet-runtime/lib/System.Runtime.Serialization.dll?url"
import systemRuntimeDllUrl from 'dotnet-runtime/lib/System.Runtime.dll?url';
// import systemSecurityAccessControlDllUrl from "dotnet-runtime/lib/System.Security.AccessControl.dll?url"
// import systemSecurityClaimsDllUrl from "dotnet-runtime/lib/System.Security.Claims.dll?url"
// import systemSecurityCryptographyAlgorithmsDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.Algorithms.dll?url"
// import systemSecurityCryptographyCngDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.Cng.dll?url"
// import systemSecurityCryptographyCspDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.Csp.dll?url"
// import systemSecurityCryptographyEncodingDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.Encoding.dll?url"
// import systemSecurityCryptographyOpenSslDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.OpenSsl.dll?url"
// import systemSecurityCryptographyPrimitivesDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.Primitives.dll?url"
// import systemSecurityCryptographyX509CertificatesDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.X509Certificates.dll?url"
// import systemSecurityCryptographyDllUrl from "dotnet-runtime/lib/System.Security.Cryptography.dll?url"
// import systemSecurityPrincipalWindowsDllUrl from "dotnet-runtime/lib/System.Security.Principal.Windows.dll?url"
import systemSecurityPrincipalDllUrl from 'dotnet-runtime/lib/System.Security.Principal.dll?url';
import systemSecuritySecureStringDllUrl from 'dotnet-runtime/lib/System.Security.SecureString.dll?url';
import systemSecurityDllUrl from 'dotnet-runtime/lib/System.Security.dll?url';
// import systemServiceModelWebDllUrl from "dotnet-runtime/lib/System.ServiceModel.Web.dll?url"
// import systemServiceProcessDllUrl from "dotnet-runtime/lib/System.ServiceProcess.dll?url"
// import systemTextEncodingCodePagesDllUrl from "dotnet-runtime/lib/System.Text.Encoding.CodePages.dll?url"
import systemTextEncodingExtensionsDllUrl from 'dotnet-runtime/lib/System.Text.Encoding.Extensions.dll?url';
import systemTextEncodingDllUrl from 'dotnet-runtime/lib/System.Text.Encoding.dll?url';
import systemTextEncodingsWebDllUrl from 'dotnet-runtime/lib/System.Text.Encodings.Web.dll?url';
import systemTextJsonDllUrl from 'dotnet-runtime/lib/System.Text.Json.dll?url';
import systemTextRegularExpressionsDllUrl from 'dotnet-runtime/lib/System.Text.RegularExpressions.dll?url';
// import systemThreadingChannelsDllUrl from "dotnet-runtime/lib/System.Threading.Channels.dll?url"
// import systemThreadingOverlappedDllUrl from "dotnet-runtime/lib/System.Threading.Overlapped.dll?url"
// import systemThreadingTasksDataflowDllUrl from "dotnet-runtime/lib/System.Threading.Tasks.Dataflow.dll?url"
import systemThreadingTasksExtensionsDllUrl from 'dotnet-runtime/lib/System.Threading.Tasks.Extensions.dll?url';
import systemThreadingTasksParallelDllUrl from 'dotnet-runtime/lib/System.Threading.Tasks.Parallel.dll?url';
import systemThreadingTasksDllUrl from 'dotnet-runtime/lib/System.Threading.Tasks.dll?url';
import systemThreadingThreadDllUrl from 'dotnet-runtime/lib/System.Threading.Thread.dll?url';
import systemThreadingThreadPoolDllUrl from 'dotnet-runtime/lib/System.Threading.ThreadPool.dll?url';
import systemThreadingTimerDllUrl from 'dotnet-runtime/lib/System.Threading.Timer.dll?url';
import systemThreadingDllUrl from 'dotnet-runtime/lib/System.Threading.dll?url';
// import systemTransactionsLocalDllUrl from "dotnet-runtime/lib/System.Transactions.Local.dll?url"
import systemTransactionsDllUrl from 'dotnet-runtime/lib/System.Transactions.dll?url';
import systemValueTupleDllUrl from 'dotnet-runtime/lib/System.ValueTuple.dll?url';
import systemWebHttpUtilityDllUrl from 'dotnet-runtime/lib/System.Web.HttpUtility.dll?url';
// import systemWebDllUrl from "dotnet-runtime/lib/System.Web.dll?url"
// import systemWindowsDllUrl from "dotnet-runtime/lib/System.Windows.dll?url"
// import systemXmlLinqDllUrl from "dotnet-runtime/lib/System.Xml.Linq.dll?url"
// import systemXmlReaderWriterDllUrl from "dotnet-runtime/lib/System.Xml.ReaderWriter.dll?url"
// import systemXmlSerializationDllUrl from "dotnet-runtime/lib/System.Xml.Serialization.dll?url"
// import systemXmlXDocumentDllUrl from "dotnet-runtime/lib/System.Xml.XDocument.dll?url"
// import systemXmlXPathXDocumentDllUrl from "dotnet-runtime/lib/System.Xml.XPath.XDocument.dll?url"
// import systemXmlXPathDllUrl from "dotnet-runtime/lib/System.Xml.XPath.dll?url"
// import systemXmlXmlDocumentDllUrl from "dotnet-runtime/lib/System.Xml.XmlDocument.dll?url"
// import systemXmlXmlSerializerDllUrl from "dotnet-runtime/lib/System.Xml.XmlSerializer.dll?url"
// import systemXmlDllUrl from "dotnet-runtime/lib/System.Xml.dll?url"
import systemDllUrl from 'dotnet-runtime/lib/System.dll?url';
import webAssemblyDllUrl from 'dotnet-runtime/lib/WebAssembly.dll?url';
// import windowsBaseDllUrl from "dotnet-runtime/lib/WindowsBase.dll?url"
// import compilerDllUrl from "dotnet-runtime/lib/compiler.dll?url"
import mscorlibDllUrl from 'dotnet-runtime/lib/mscorlib.dll?url';
import netstandardDllUrl from 'dotnet-runtime/lib/netstandard.dll?url';

const dotnetUrl = new URL(
	`${base}/assets/dotnet/compiler/dotnet.js`,
	globalThis.location.origin
).toString();

export const LIBS = [
	humanizerDllUrl,
	microsoftBclAsyncInterfacesDllUrl,
	microsoftCSharpDllUrl,
	// microsoftCodeAnalysisCSharpWorkspacesDllUrl,
	// microsoftCodeAnalysisCSharpDllUrl,
	// microsoftCodeAnalysisVisualBasicWorkspacesDllUrl,
	// microsoftCodeAnalysisVisualBasicDllUrl,
	// microsoftCodeAnalysisWorkspacesDllUrl,
	// microsoftCodeAnalysisDllUrl,
	// microsoftJsInteropWebAssemblyDllUrl,
	// microsoftJsInteropDllUrl,
	// microsoftVisualBasicCoreDllUrl,
	// microsoftVisualBasicDllUrl,
	// microsoftWin32PrimitivesDllUrl,
	// microsoftWin32RegistryDllUrl,
	systemAppContextDllUrl,
	systemBuffersDllUrl,
	systemCollectionsConcurrentDllUrl,
	systemCollectionsImmutableDllUrl,
	systemCollectionsNonGenericDllUrl,
	systemCollectionsSpecializedDllUrl,
	systemCollectionsDllUrl,
	// systemComponentModelAnnotationsDllUrl,
	// systemComponentModelDataAnnotationsDllUrl,
	// systemComponentModelEventBasedAsyncDllUrl,
	// systemComponentModelPrimitivesDllUrl,
	// systemComponentModelTypeConverterDllUrl,
	// systemComponentModelDllUrl,
	// systemCompositionAttributedModelDllUrl,
	// systemCompositionConventionDllUrl,
	// systemCompositionHostingDllUrl,
	// systemCompositionRuntimeDllUrl,
	// systemCompositionTypedPartsDllUrl,
	// systemConfigurationDllUrl,
	systemConsoleDllUrl,
	systemCoreDllUrl,
	// systemDataCommonDllUrl,
	// systemDataDataSetExtensionsDllUrl,
	// systemDataDllUrl,
	// systemDiagnosticsContractsDllUrl,
	systemDiagnosticsDebugDllUrl,
	// systemDiagnosticsDiagnosticSourceDllUrl,
	// systemDiagnosticsFileVersionInfoDllUrl,
	// systemDiagnosticsProcessDllUrl,
	// systemDiagnosticsStackTraceDllUrl,
	// systemDiagnosticsTextWriterTraceListenerDllUrl,
	// systemDiagnosticsToolsDllUrl,
	// systemDiagnosticsTraceSourceDllUrl,
	// systemDiagnosticsTracingDllUrl,
	// systemDrawingPrimitivesDllUrl,
	// systemDrawingDllUrl,
	// systemDynamicRuntimeDllUrl,
	// systemFormatsAsn1DllUrl,
	// systemFormatsTarDllUrl,
	systemGlobalizationCalendarsDllUrl,
	systemGlobalizationExtensionsDllUrl,
	systemGlobalizationDllUrl,
	// systemIoCompressionBrotliDllUrl,
	// systemIoCompressionFileSystemDllUrl,
	// systemIoCompressionZipFileDllUrl,
	// systemIoCompressionDllUrl,
	// systemIoFileSystemAccessControlDllUrl,
	// systemIoFileSystemDriveInfoDllUrl,
	// systemIoFileSystemPrimitivesDllUrl,
	// systemIoFileSystemWatcherDllUrl,
	systemIoFileSystemDllUrl,
	// systemIoIsolatedStorageDllUrl,
	// systemIoMemoryMappedFilesDllUrl,
	// systemIoPipelinesDllUrl,
	// systemIoPipesAccessControlDllUrl,
	// systemIoPipesDllUrl,
	systemIoUnmanagedMemoryStreamDllUrl,
	systemIoDllUrl,
	systemLinqExpressionsDllUrl,
	systemLinqParallelDllUrl,
	systemLinqQueryableDllUrl,
	systemLinqDllUrl,
	systemMemoryDllUrl,
	systemNetHttpJsonDllUrl,
	systemNetHttpDllUrl,
	systemNetHttpListenerDllUrl,
	// systemNetMailDllUrl,
	systemNetNameResolutionDllUrl,
	systemNetNetworkInformationDllUrl,
	// systemNetPingDllUrl,
	systemNetPrimitivesDllUrl,
	// systemNetQuicDllUrl,
	systemNetRequestsDllUrl,
	// systemNetSecurityDllUrl,
	// systemNetServicePointDllUrl,
	systemNetSocketsDllUrl,
	systemNetWebClientDllUrl,
	systemNetWebHeaderCollectionDllUrl,
	// systemNetWebProxyDllUrl,
	// systemNetWebSocketsClientDllUrl,
	// systemNetWebSocketsDllUrl,
	systemNetDllUrl,
	systemNumericsVectorsDllUrl,
	systemNumericsDllUrl,
	systemObjectModelDllUrl,
	systemPrivateCoreLibDllUrl,
	// systemPrivateDataContractSerializationDllUrl,
	systemPrivateUriDllUrl,
	// systemPrivateXmlLinqDllUrl,
	// systemPrivateXmlDllUrl,
	// systemReflectionDispatchProxyDllUrl,
	// systemReflectionEmitIlGenerationDllUrl,
	// systemReflectionEmitLightweightDllUrl,
	// systemReflectionEmitDllUrl,
	// systemReflectionExtensionsDllUrl,
	// systemReflectionMetadataDllUrl,
	// systemReflectionPrimitivesDllUrl,
	// systemReflectionTypeExtensionsDllUrl,
	systemReflectionDllUrl,
	systemResourcesReaderDllUrl,
	systemResourcesResourceManagerDllUrl,
	systemResourcesWriterDllUrl,
	// systemRuntimeCompilerServicesUnsafeDllUrl,
	// systemRuntimeCompilerServicesVisualCDllUrl,
	systemRuntimeExtensionsDllUrl,
	systemRuntimeHandlesDllUrl,
	// systemRuntimeInteropServicesJavaScriptDllUrl,
	systemRuntimeInteropServicesRuntimeInformationDllUrl,
	systemRuntimeInteropServicesDllUrl,
	// systemRuntimeIntrinsicsDllUrl,
	// systemRuntimeLoaderDllUrl,
	// systemRuntimeNumericsDllUrl,
	// systemRuntimeSerializationFormattersDllUrl,
	systemRuntimeSerializationJsonDllUrl,
	// systemRuntimeSerializationPrimitivesDllUrl,
	// systemRuntimeSerializationXmlDllUrl,
	// systemRuntimeSerializationDllUrl,
	systemRuntimeDllUrl,
	// systemSecurityAccessControlDllUrl,
	// systemSecurityClaimsDllUrl,
	// systemSecurityCryptographyAlgorithmsDllUrl,
	// systemSecurityCryptographyCngDllUrl,
	// systemSecurityCryptographyCspDllUrl,
	// systemSecurityCryptographyEncodingDllUrl,
	// systemSecurityCryptographyOpenSslDllUrl,
	// systemSecurityCryptographyPrimitivesDllUrl,
	// systemSecurityCryptographyX509CertificatesDllUrl,
	// systemSecurityCryptographyDllUrl,
	// systemSecurityPrincipalWindowsDllUrl,
	systemSecurityPrincipalDllUrl,
	systemSecuritySecureStringDllUrl,
	systemSecurityDllUrl,
	// systemServiceModelWebDllUrl,
	// systemServiceProcessDllUrl,
	// systemTextEncodingCodePagesDllUrl,
	systemTextEncodingExtensionsDllUrl,
	systemTextEncodingDllUrl,
	systemTextEncodingsWebDllUrl,
	systemTextJsonDllUrl,
	systemTextRegularExpressionsDllUrl,
	// systemThreadingChannelsDllUrl,
	// systemThreadingOverlappedDllUrl,
	// systemThreadingTasksDataflowDllUrl,
	systemThreadingTasksExtensionsDllUrl,
	systemThreadingTasksParallelDllUrl,
	systemThreadingTasksDllUrl,
	systemThreadingThreadDllUrl,
	systemThreadingThreadPoolDllUrl,
	systemThreadingTimerDllUrl,
	systemThreadingDllUrl,
	// systemTransactionsLocalDllUrl,
	systemTransactionsDllUrl,
	systemValueTupleDllUrl,
	systemWebHttpUtilityDllUrl,
	// systemWebDllUrl,
	// systemWindowsDllUrl,
	// systemXmlLinqDllUrl,
	// systemXmlReaderWriterDllUrl,
	// systemXmlSerializationDllUrl,
	// systemXmlXDocumentDllUrl,
	// systemXmlXPathXDocumentDllUrl,
	// systemXmlXPathDllUrl,
	// systemXmlXmlDocumentDllUrl,
	// systemXmlXmlSerializerDllUrl,
	// systemXmlDllUrl,
	systemDllUrl,
	webAssemblyDllUrl,
	// windowsBaseDllUrl,
	// compilerDllUrl,
	mscorlibDllUrl,
	netstandardDllUrl
];

export interface Options {
	typeFullName?: string;
	methodName?: string;
	executionCode: string;
}

export class DotnetTestCompilerFactory {
	protected readonly log: Logger;
	protected readonly patchedConsole: Console;
	constructor(streams: Streams) {
		this.log = createLogger(streams.out);
		this.patchedConsole = redirect(globalThis.console, this.log);
	}
	async create<I, O>(
		ctx: Context,
		{ typeFullName = 'test.Test', methodName = 'Execute', executionCode }: Options
	): Promise<TestCompiler<I, O>> {
		const { dotnet } = await inContext(ctx, import(/* @vite-ignore */ dotnetUrl));
		using _ = patch(globalThis, 'console', this.patchedConsole);
		const libsLoader = createLibsLoader(createCachedFetch(await caches.open('dotnet-cache')));
		const compilerModule: DotnetModule<CompilerModuleImports, CompilerModuleExports> =
			await inContext(ctx, dotnet.create());
		const compiler = await inContext(
			ctx,
			new DotnetCompilerFactory(this.log, libsLoader, compilerModule).create(LIBS)
		);
		const runtimeFactory = new DotnetRuntimeFactory(compiler);
		return {
			async compile(ctx, files) {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				const runtime = runtimeFactory.create(ctx, files[0].content, executionCode);
				return new DotnetTestProgram<I, O>(typeFullName, methodName, runtime);
			}
		};
	}
}
