module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      dev: "vue-cli-service cordova-serve",
      prod: "vue-cli-service cordova-production"
    },
    dependencies: {},
    devDependencies: {
      xml2js: "^0.4.19",
      "material-design-icons-iconfont": "^3.0.3",
      "roboto-fontface": "^0.9.0"
    },
    cordova: {
      plugins: {
        "cordova-plugin-device": {},
        "cordova-plugin-ionic-webview": {},
        "cordova-plugin-splashscreen": {},
        "cordova-plugin-statusbar": {},
        "cordova-plugin-whitelist": {}
      },
      platforms: ["android", "browser", "ios"]
    }
  });

  api.render("./template");

  api.postProcessFiles(files => {
    // Cập nhật file index.html
    const indexFilePath = "public/index.html";
    const indexHtml = files[indexFilePath];
    let existCordovaJs = false;
    if (indexHtml) {
      const lines = indexHtml.split(/\r?\n/g).reverse();
      const lastMetaIndex = lines.findIndex(line => line.match(/\s+<meta/));
      const titleIndex = lines.findIndex(line => line.match(/\s+<title/));

      lines.forEach(line => {
        if (line.indexOf("cordova.js") > -1) {
          existCordovaJs = true;
          return;
        }
      });
      if (!existCordovaJs) {
        lines[lastMetaIndex] +=
          `\n    <!-- TODO: You should modify CSP for production build -->` +
          `\n    <meta http-equiv="Content-Security-Policy" content="default-src gap: data: 'unsafe-inline' 'unsafe-eval' *">`;
        lines[
          titleIndex
        ] += `\n    <script type="text/javascript" src="<%= process.env.NODE_ENV === 'production' ? './cordova.js' : './cordova/browser/platform_www/cordova.js'%>"></script>`;
      }

      files["public/index.html"] = lines.reverse().join("\n");
    }

    // Cập nhật file main.js
    const mainFilePath = "src/main.js";
    const main = files[mainFilePath];
    if (main) {
      const lines = main.split(/\r?\n/g);
      let index = 0;
      let importIndex = 0;
      let appIndex = 0;

      lines.forEach(line => {
        index++;
        if (line.startsWith("import")) importIndex = index;
        if (line.indexOf("new Vue") > -1) {
          appIndex = index;
          return;
        }
      });

      let str = "import.cordovaLoader.from";
      var regex = new RegExp(str, "g");
      if (!main.match(regex)) {
        lines.splice(
          importIndex++,
          0,
          'import cordovaLoader from "./plugins/cordovaLoader"'
        );
        lines.splice(appIndex++, 0, "cordovaLoader(() => {");
        lines.push("})");
      }

      files[mainFilePath] = lines.join("\n");
    }
  });

  api.onCreateComplete(() => {
    // let target = path.resolve(__dirname, "../../platforms");
    // let pathSync = path.resolve(__dirname, "../../public/cordova");
    // console.log({ target, pathSync });
    // if (!fs.existsSync(pathSync)) {
    //   console.log("Folder /public/cordova not sync with /platforms");
    //   console.log("Begin sync and link");
    //   fs.symlinkSync(target, pathSync, "dir");
    // } else {
    //   console.log("Folder /public/cordova was synced with /platforms");
    // }
    //
    //
    // .gitignore - not included in files on postProcessFiles
    // const ignorePath = api.resolve(".gitignore");
    // const ignore = fs.existsSync(ignorePath)
    //   ? fs.readFileSync(ignorePath, "utf-8")
    //   : "";
    // fs.writeFileSync(
    //   ignorePath,
    //   ignore + "\n# Cordova\n/www\n/platforms\n/plugins\n"
    // );
    // fs.unlinkSync('./config.xml')
    // fs.unlinkSync('./public/cordova')
    // create symlinks
    // if (!fs.existsSync("./public/cordova")) {
    //   fs.symlinkSync("../platforms", "./public/cordova", "dir");
    // }
    // if (!fs.existsSync("./public/config.xml")) {
    //   fs.symlinkSync(
    //     "../platforms/browser/www/config.xml",
    //     "./public/config.xml"
    //   );
    // }
  });
};
