{
  lib,
  stdenv,
  buildGoModule,
  fetchPnpmDeps,
  pnpmConfigHook,
  pnpm_10,
  nodejs_22,
  wails,
  gnumake,
  pkg-config,
  gtk3,
  webkitgtk_4_1,
  glib-networking,
  gsettings-desktop-schemas,
  wrapGAppsHook3,
  makeWrapper,
  src ? lib.cleanSource ../..,
  version ? "2026.4",
}:

buildGoModule (finalAttrs: {
  pname = "3ncryp70m41l";
  inherit version src;

  __structuredAttrs = true;

  proxyVendor = true;

  vendorHash = "sha256-G2xtQFLnxL08WtIVhZAu1EvJic7YMvVHrqC4TMCLF3Q=";

  overrideModAttrs = {
    preBuild = ''
      make build-nix VERSION=${finalAttrs.version}
    '';
  };

  nativeBuildInputs = [
    pkg-config
    pnpmConfigHook
    pnpm_10
    nodejs_22
    wails
    gnumake
  ]
  ++ lib.optionals stdenv.hostPlatform.isLinux [
    wrapGAppsHook3
    makeWrapper
  ];

  buildInputs = lib.optionals stdenv.hostPlatform.isLinux [
    gtk3
    webkitgtk_4_1
    glib-networking
    gsettings-desktop-schemas
  ];

  env = {
    pnpmDeps = fetchPnpmDeps {
      inherit (finalAttrs) pname version;
      src = "${finalAttrs.src}/frontend";
      pnpm = pnpm_10;
      fetcherVersion = 3;
      hash = "sha256-uOmD2qDhLX2rtA1C07p43JFZg5LpIlJUIUt7OKqt2g4=";
    };
    pnpmRoot = "frontend";
  };

  buildPhase = ''
    runHook preBuild

    make build-nix VERSION=${finalAttrs.version}

    runHook postBuild
  '';

  doCheck = false;

  installPhase = ''
    runHook preInstall

    install -Dm755 build/bin/EncryptoMail $out/bin/EncryptoMail
    install -Dm644 build/linux/pelton.desktop $out/share/applications/EncryptoMail.desktop
    install -Dm644 build/linux/pelton.metainfo.xml $out/share/metainfo/dev.zytronium.encryptomail.metainfo.xml
    install -Dm644 build/icons/pelton-512.png $out/share/icons/hicolor/512x512/apps/dev.zytronium.encryptomail.png

    runHook postInstall
  '';

  preFixup = lib.optionalString stdenv.hostPlatform.isLinux ''
    gappsWrapperArgs+=(
      --set GIO_EXTRA_MODULES "${glib-networking}/lib/gio/modules"
    )
  '';

  meta = {
    description = "Privacy-focused, cross-platform desktop email client";
    homepage = "https://pelton.app";
    changelog = "https://github.com/peltonapp/Pelton/releases/tag/v${lib.head (lib.splitString "+" finalAttrs.version)}";
    license = lib.licenses.gpl3Plus;
    platforms = lib.platforms.linux;
    mainProgram = "EncryptoMail";
  };
})
