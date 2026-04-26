// This file is derived from:
// https://github.com/zigtools/playground/blob/9f9403892077b7624b97b8c1cd0ca5504afebfe7/build.zig
// Copyright (c) 2023 zls-in-the-browser contributors
// Licensed under the MIT License
// Modifications made by Roman Krasilnikov.

const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .wasi,
    });
    const optimize = b.standardOptimizeOption(.{
        .preferred_optimize_mode = .ReleaseSmall,
    });

    const zig_step = b.step("zig", "compile and install Zig");
    const compiler_rt_step = b.step("zig_compiler_rt", "compile and install compiler_rt");
    const tarball_step = b.step("zig_tarball", "compile and install zig.tar.gz");

    b.getInstallStep().dependOn(zig_step);
    b.getInstallStep().dependOn(compiler_rt_step);
    b.getInstallStep().dependOn(tarball_step);

    const zig_dependency = b.dependency("zig", .{
        .target = target,
        .optimize = optimize,
        .@"version-string" = @as([]const u8, "0.17.0"),
        .@"no-lib" = true,
        .dev = "wasm",
    });
    zig_step.dependOn(installArtifact(b, zig_dependency.artifact("zig")));

    const lib_compiler_rt = b.addLibrary(.{ .linkage = .static, .name = "compiler_rt", .root_module = b.createModule(.{ .root_source_file = zig_dependency.path("lib/compiler_rt.zig"), .target = target, .optimize = optimize }) });
    compiler_rt_step.dependOn(&b.addInstallArtifact(lib_compiler_rt, .{ .dest_dir = .{ .override = .prefix } }).step);

    const run_tar = b.addSystemCommand(&.{ "tar", "-czf" });
    const zig_tar_gz = run_tar.addOutputFileArg("zig.tar.gz");
    tarball_step.dependOn(&b.addInstallFile(zig_tar_gz, "zig.tar.gz").step);
    run_tar.addArg("-C");
    run_tar.addDirectoryArg(zig_dependency.path("."));
    run_tar.addArg("lib/std");
}

fn installArtifact(b: *std.Build, artifact: *std.Build.Step.Compile) *std.Build.Step {
    const wasm_opt = b.addSystemCommand(&.{
        "wasm-opt",
        "-Oz",
        "--enable-bulk-memory",
        "--enable-mutable-globals",
        "--enable-nontrapping-float-to-int",
        "--enable-sign-ext",
    });
    wasm_opt.addArtifactArg(artifact);
    wasm_opt.addArg("-o");
    const file_name = b.fmt("{s}.wasm", .{artifact.name});
    const exe = wasm_opt.addOutputFileArg(file_name);
    return &b.addInstallBinFile(exe, file_name).step;
}
