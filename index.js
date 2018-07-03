const { info } = require("@vue/cli-shared-utils");
const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const defaults = {
  mode: "development",
  host: "0.0.0.0",
  port: 8080,
  https: false,
  platform: "browser"
};

module.exports = (api, options) => {
  const address = require("address");
  const portfinder = require("portfinder");

  api.registerCommand(
    "cordova-serve",
    {
      description: "start development server for cordova",
      usage: "vue-cli-service cordova-serve [options]",
      options: {
        "--open": `open browser on server start`,
        "--host": `specify host (default: ${defaults.host})`,
        "--port": `specify port (default: ${defaults.port})`,
        "--https": `use https (default: ${defaults.https})`
      }
    },
    args => {
      const projectDevServerOptions = options.devServer || {};
      portfinder.basePort =
        args.port ||
        process.env.PORT ||
        projectDevServerOptions.port ||
        defaults.port;
      return portfinder.getPortPromise().then(port => {
        const serveArgs = {
          open: args.open,
          host:
            args.host ||
            process.env.HOST ||
            projectDevServerOptions.host ||
            defaults.host,
          port,
          https: args.https || projectDevServerOptions.https || defaults.https,
          lanIp: address.ip()
        };

        let indexUrl = `http://${serveArgs.lanIp}:${serveArgs.port}`;
        // setConfig(indexUrl);
        // return;
        return api.service.run("serve", serveArgs).then(result => {
          let childProcess = null;
          switch (args._[0]) {
            case "android":
              childProcess = spawn("cordova", [
                "run",
                "android",
                "--index=" + indexUrl
              ]);
              break;
            case "ios":
              childProcess = spawn("cordova", ["run", "ios"]);
              break;
            default:
              info(
                "Build servce done. Open your browser and enter local address"
              );
              info("npm run cordova android | If you wan run app on android");
              info("npm run cordova ios | If you wan run app on ios");
              break;
          }

          if (childProcess) {
            childProcess.stdout.on("data", data => {
              console.log(`Cordova: ${data}`);
            });

            childProcess.stderr.on("data", data => {
              console.log(`Cordova: ${data}`);
            });

            childProcess.on("close", code => {
              console.log(`Cordova build done. Code ${code}`);
            });
          }
        });
      });
    }
  );

  api.registerCommand(
    "cordova-production",
    {
      description: "Cordova build production",
      usage: "vue-cli-service cordova-production [options]"
    },
    args => {
      const serveArgs = {
        dest: "www"
      };
      info("Preparing for build production...");

      // const wwwDirPath = api.resolve("www");
      // copyRedirectHtml(serveArgs, wwwDirPath);
      return api.service.run("build", serveArgs).then(result => {
        console.log("Build done.");
        info("Preparing for build app");
        let childProcess = null;
        switch (args._[0]) {
          case "android":
            childProcess = spawn("cordova", ["build", "android"]);
            break;
          case "ios":
            childProcess = spawn("cordova", ["build", "ios"]);
            break;
          default:
            childProcess = spawn("cordova", ["build", "browser"]);
            break;
        }

        if (childProcess) {
          childProcess.stdout.on("data", data => {
            console.log(`Cordova: ${data}`);
          });

          childProcess.stderr.on("data", data => {
            console.log(`Cordova: ${data}`);
          });

          childProcess.on("close", code => {
            console.log(`Cordova build done. Code ${code}`);
          });
        }
      });
    }
  );

  // api.chainWebpack(webpackConfig => {
  //   if (process.env.NODE_ENV === "production") {
  //     webpackConfig.plugin("copy").tap(args => {
  //       args[0][0].ignore.push("cordova");
  //       args[0][0].ignore.push("config.xml");
  //       return args;
  //     });
  //     webpackConfig
  //       .plugin("cordova")
  //       .use(require("html-webpack-include-assets-plugin"), [
  //         {
  //           assets: "cordova.js",
  //           append: false,
  //           publicPath: false
  //         }
  //       ]);
  //     // FIXME: This is a temporary patch.
  //     // When the following PR is merged into file-loader, modify it to use cssOutputPath and useRelativePath.
  //     // https://github.com/webpack-contrib/file-loader/pull/150
  //     webpackConfig.plugin("extract-css").tap(args => {
  //       (args[0].filename = "[name].[contenthash:8].css"),
  //         (args[0].chunkFilename = "[name].[id].[contenthash:8].css");
  //     });
  //   }
  // });
};

function setConfig(url) {
  var parser = new xml2js.Parser();
  var xmlBuilder = new xml2js.Builder();

  const configPath = path.resolve(__dirname, "../../config.xml");
  console.log(configPath);
  fs.readFile(configPath, function(err, data) {
    parser.parseString(data, function(err, result) {
      result.widget.content = { $: { src: url } };

      var xml = xmlBuilder.buildObject(result);

      fs.writeFile(configPath, xml, function(err, data) {
        if (err) console.log(err);
        console.log("successfully written our update xml to file");
      });
    });
  });

  // const templateStr = fs.readFileSync(templatePath, "utf-8");
  // const htmlStr = ejs.render(templateStr, args);
  // if (!fs.existsSync(distDirPath)) {
  //   fs.mkdirSync(distDirPath);
  // }
  // const distPath = path.resolve(distDirPath, "index.html");
  // fs.writeFileSync(distPath, htmlStr);
}

module.exports.defaultModes = {
  "cordova-serve": "development",
  "cordova-production": "production"
};
