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

const root = path.resolve(__dirname, "../../");

const platformsTarget = path.resolve(root, "platforms");
const platformsPath = path.resolve(root, "public/cordova");

const configXmlTarget = path.resolve(root, "config.xml");
const configXmlPath = path.resolve(root, "public/config.xml");

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

        console.log({ platformsTarget, platformsPath });

        if (!fs.existsSync(platformsPath)) {
          console.log(
            `${platformsTarget} is not link with ${platformsPath} yet.`
          );
          console.log("Begin sync and link");
          fs.symlinkSync(platformsTarget, platformsPath, "dir");
        }

        if (!fs.existsSync(configXmlPath)) {
          console.log(
            `${configXmlTarget} is not link with ${configXmlPath} yet.`
          );
          console.log("Begin sync and link");
          fs.symlinkSync(configXmlTarget, configXmlPath);
        }

        setConfig(indexUrl);
        // return;
        return api.service.run("serve", serveArgs).then(result => {
          let childProcess = null;
          switch (args._[0]) {
            case "android":
              childProcess = spawn("cordova", ["run", "android"]);
              break;
            case "ios":
              childProcess = spawn("cordova", ["run", "ios"]);
              break;
            default:
              info(
                "Build servce done. Open your browser and enter local address"
              );
              info("npm run dev android | If you wan run app on android");
              info("npm run dev ios | If you wan run app on ios");
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

      // fs.symlinkSync('../platforms', './public/cordova', 'dir')

      // const wwwDirPath = api.resolve("www");
      // copyRedirectHtml(serveArgs, wwwDirPath);
      setConfig();
      return api.service.run("build", serveArgs).then(result => {
        // setUTF8("www/index.html");
        // console.log("Updated index.html");
        info("Preparing for build " + args._[0] + " app");
        let childProcess = null;
        switch (args._[0]) {
          case "android":
            childProcess = spawn("cordova", ["run", "android"]);
            break;
          case "ios":
            childProcess = spawn("cordova", ["run", "ios"]);
            break;
          default:
            info("Build project done. Open www to view update.");
            info("cordova run android | If you wan run app on android");
            info("cordova run ios | If you wan run app on ios");
            break;
        }

        if (childProcess) {
          childProcess.stdout.on("data", data => {
            console.log(`${data}`);
          });

          childProcess.stderr.on("data", data => {
            console.log(`${data}`);
          });

          childProcess.on("close", code => {
            console.log(`Cordova build done. Code ${code}`);
          });
        }
      });
    }
  );
  api.registerCommand(
    "cordova-release",
    {
      description: "Cordova build production",
      usage: "vue-cli-service cordova-release [options]"
    },
    args => {
      const serveArgs = {
        dest: "www"
      };
      info("Preparing for release production...");

      // fs.symlinkSync('../platforms', './public/cordova', 'dir')

      // const wwwDirPath = api.resolve("www");
      // copyRedirectHtml(serveArgs, wwwDirPath);
      setConfig();
      return api.service.run("build", serveArgs).then(result => {
        // setUTF8("www/index.html");
        // console.log("Updated index.html");
        info("Preparing for build " + args._[0] + " app");
        let childProcess = null;
        switch (args._[0]) {
          case "android":
            childProcess = spawn("cordova", ["run", "android", "--release"]);
            break;
          case "ios":
            childProcess = spawn("cordova", ["run", "ios", "--release"]);
            break;
          default:
            childProcess = spawn("cordova", ["run", "browser"]);
            break;
        }

        if (childProcess) {
          childProcess.stdout.on("data", data => {
            console.log(`${data}`);
          });

          childProcess.stderr.on("data", data => {
            console.log(`${data}`);
          });

          childProcess.on("close", code => {
            console.log(`Cordova release done. Code ${code}`);
          });
        }
      });
    }
  );

  api.configureWebpack(config => {
    config.output.publicPath =
      process.env.NODE_ENV === "development" ? "/" : "./";
  });
  // api.chainWebpack(webpackConfig => {
  //   webpackConfig.module
  //     .rule("fonts")
  //     .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
  //     .use("url-loader")
  //     .loader("url-loader")
  //     .options({
  //       filename: "fonts/[name].[contenthash:8].css",
  //       publicPath: process.env.NODE_ENV === "production" ? "../fonts" : "/"
  //     });
  // });
};

function setConfig(url = "index.html") {
  var parser = new xml2js.Parser();
  var xmlBuilder = new xml2js.Builder();

  fs.readFile(configXmlTarget, function(err, data) {
    parser.parseString(data, function(err, result) {
      result.widget.content = { $: { src: url } };

      var xml = xmlBuilder.buildObject(result);

      fs.writeFile(configXmlTarget, xml, function(err, data) {
        if (err) console.log(err);
        console.log(`Updated config.xml: <content src="${url}"/>`);
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
  "cordova-production": "production",
  "cordova-release": "production"
};
